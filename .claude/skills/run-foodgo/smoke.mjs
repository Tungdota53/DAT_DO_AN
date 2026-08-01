import { spawn } from "node:child_process";
import { mkdir, open, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "../../..");
const artifactsDir = join(root, ".tmp", "run-foodgo");
const screenshotPath = join(artifactsDir, "foodgo-smoke.png");
const resultPath = join(artifactsDir, "smoke-result.json");
const backendLogPath = join(artifactsDir, "backend.log");
const frontendLogPath = join(artifactsDir, "frontend.log");
const chromeLogPath = join(artifactsDir, "chrome.log");
const chromeProfilePath = join(artifactsDir, "chrome-profile");
const timeoutMs = 45_000;
const children = [];
const resources = [];

const command = process.platform === "win32" ? "cmd.exe" : "npm";
const chromeCandidates =
  process.platform === "win32"
    ? [
        process.env.PROGRAMFILES &&
          join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
        process.env["PROGRAMFILES(X86)"] &&
          join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
        process.env.PROGRAMFILES &&
          join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
      ]
    : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];

const delay = (milliseconds) =>
  new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

const failAfter = async (action, message, duration = timeoutMs) => {
  let timer;
  try {
    return await Promise.race([
      action,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), duration);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const isPortAvailable = (port) =>
  new Promise((resolvePort) => {
    const server = createServer();
    server.unref();
    server.once("error", () => resolvePort(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolvePort(true));
    });
  });

const findExecutable = async (candidates) => {
  for (const candidate of candidates.filter(Boolean)) {
    try {
      const handle = await open(candidate, "r");
      await handle.close();
      return candidate;
    } catch {
      // Try next known installation path.
    }
  }
  throw new Error(
    "Không tìm thấy Chrome hoặc Edge. Cài một trình duyệt Chromium rồi chạy lại.",
  );
};

const startProcess = async (executable, args, logPath, extraOptions = {}) => {
  await mkdir(dirname(logPath), { recursive: true });
  const log = await open(logPath, "w");
  resources.push(log);
  const child = spawn(executable, args, {
    cwd: root,
    env: { ...process.env, ...extraOptions.env },
    stdio: ["ignore", log.fd, log.fd],
    windowsHide: true,
    shell: false,
  });
  children.push(child);
  return child;
};

const waitForHttp = async (url) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // Service is still starting.
    }
    await delay(250);
  }
  throw new Error(`Hết thời gian chờ ${url}`);
};

const stopProcess = async (child) => {
  if (!child || child.exitCode !== null) return;

  if (process.platform === "win32") {
    await new Promise((resolveStop) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
        windowsHide: true,
      });
      killer.once("exit", resolveStop);
      killer.once("error", resolveStop);
    });
    return;
  }

  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveStop) => child.once("exit", resolveStop)),
    delay(2_000).then(() => child.kill("SIGKILL")),
  ]);
};

const connectBrowser = async (endpoint) => {
  const socket = new WebSocket(endpoint);
  const pending = new Map();
  const exceptions = [];
  const logErrors = [];
  const failedRequests = [];
  let messageId = 0;

  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params.exceptionDetails.text);
    }
    if (
      message.method === "Log.entryAdded" &&
      message.params.entry.level === "error" &&
      !message.params.entry.url?.endsWith("/favicon.ico")
    ) {
      logErrors.push(message.params.entry.text);
    }
    if (
      message.method === "Network.responseReceived" &&
      message.params.response.status >= 400 &&
      !message.params.response.url.endsWith("/favicon.ico")
    ) {
      failedRequests.push({
        url: message.params.response.url,
        status: message.params.response.status,
      });
    }
    if (message.method === "Network.loadingFailed") {
      failedRequests.push({
        requestId: message.params.requestId,
        error: message.params.errorText,
      });
    }
  });

  await failAfter(
    new Promise((resolveSocket, reject) => {
      socket.addEventListener("open", resolveSocket, { once: true });
      socket.addEventListener("error", reject, { once: true });
    }),
    "Không kết nối được Chrome DevTools",
  );

  const send = (method, params = {}) =>
    new Promise((resolveSend, reject) => {
      const id = ++messageId;
      pending.set(id, { resolve: resolveSend, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed");
    }
    return result.result.value;
  };

  const waitFor = async (expression) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (await evaluate(expression)) return;
      await delay(200);
    }
    throw new Error(`Hết thời gian chờ giao diện: ${expression}`);
  };

  return {
    socket,
    send,
    evaluate,
    waitFor,
    exceptions,
    logErrors,
    failedRequests,
  };
};

const readLogs = async () => {
  const entries = [];
  for (const logPath of [backendLogPath, frontendLogPath, chromeLogPath]) {
    try {
      entries.push(`\n--- ${logPath} ---\n${await readFile(logPath, "utf8")}`);
    } catch {
      // Log may not exist when startup fails before spawn.
    }
  }
  return entries.join("");
};

try {
  for (const port of [3000, 5173, 9222]) {
    if (!(await isPortAvailable(port))) {
      throw new Error(`Cổng ${port} đang được sử dụng. Dừng tiến trình đó rồi chạy lại.`);
    }
  }

  const chrome = await findExecutable(chromeCandidates);
  await mkdir(artifactsDir, { recursive: true });
  await rm(chromeProfilePath, { recursive: true, force: true });

  const npmArguments = (script) =>
    process.platform === "win32"
      ? ["/d", "/s", "/c", `npm run ${script}`]
      : ["run", script];
  await startProcess(command, npmArguments("dev:backend"), backendLogPath);
  await startProcess(command, npmArguments("dev:frontend"), frontendLogPath);

  const healthResponse = await waitForHttp("http://localhost:3000/api/health");
  const health = await healthResponse.json();
  const restaurantsResponse = await waitForHttp(
    "http://localhost:3000/api/restaurants?page=1&limit=1",
  );
  const restaurants = await restaurantsResponse.json();
  await waitForHttp("http://localhost:5173/");
  await waitForHttp("http://localhost:5173/admin");

  await startProcess(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--remote-debugging-port=9222",
      `--user-data-dir=${chromeProfilePath}`,
      "--window-size=1440,1000",
      "about:blank",
    ],
    chromeLogPath,
  );

  const targetsResponse = await waitForHttp("http://127.0.0.1:9222/json/list");
  const targets = await targetsResponse.json();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("Chrome DevTools không có page target");

  const browser = await connectBrowser(page.webSocketDebuggerUrl);
  await browser.send("Page.enable");
  await browser.send("Runtime.enable");
  await browser.send("Log.enable");
  await browser.send("Network.enable");
  await browser.send("Page.navigate", { url: "http://localhost:5173/" });
  await browser.waitFor(
    "document.readyState === 'complete' && document.body.innerText.includes('Bếp Việt')",
  );

  const home = await browser.evaluate(`({
    title: document.title,
    hasFoodGo: document.body.innerText.includes('FoodGo'),
    hasRestaurant: document.body.innerText.includes('Bếp Việt')
  })`);

  const clicked = await browser.evaluate(`(() => {
    const link = [...document.querySelectorAll('a')].find(
      (element) => element.getAttribute('aria-label') === 'Xem thực đơn Bếp Việt'
    );
    if (!link) return false;
    link.click();
    return true;
  })()`);
  if (!clicked) throw new Error("Không tìm thấy liên kết nhà hàng Bếp Việt");

  await browser.waitFor(
    "location.pathname === '/restaurants/1' && Boolean(document.querySelector('input[placeholder=\"Tìm món trong thực đơn...\"]'))",
  );
  const detail = await browser.evaluate(`({
    path: location.pathname,
    heading: document.querySelector('h1')?.textContent?.trim(),
    hasSearch: Boolean(document.querySelector('input[placeholder="Tìm món trong thực đơn..."]'))
  })`);
  const screenshot = await browser.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
  browser.socket.close();

  const result = {
    health,
    databaseRestaurant: restaurants.data?.[0]?.name,
    endpoints: {
      health: 200,
      databaseQuery: restaurantsResponse.status,
      frontend: 200,
      admin: 200,
    },
    home,
    clicked,
    detail,
    exceptions: browser.exceptions,
    logErrors: browser.logErrors,
    failedRequests: browser.failedRequests,
    screenshotPath,
  };

  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);

  if (
    !health.success ||
    result.databaseRestaurant !== "Bếp Việt" ||
    !home.hasFoodGo ||
    !home.hasRestaurant ||
    !clicked ||
    detail.path !== "/restaurants/1" ||
    detail.heading !== "Bếp Việt" ||
    !detail.hasSearch ||
    browser.exceptions.length ||
    browser.logErrors.length ||
    browser.failedRequests.length
  ) {
    throw new Error(`Smoke test không đạt:\n${JSON.stringify(result, null, 2)}`);
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  console.error(await readLogs());
  process.exitCode = 1;
} finally {
  for (const child of children.reverse()) {
    await stopProcess(child);
  }
  for (const resource of resources) {
    await resource.close();
  }
  try {
    await rm(chromeProfilePath, { recursive: true, force: true });
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EBUSY") {
      throw error;
    }
  }
}
