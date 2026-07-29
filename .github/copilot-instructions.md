# FoodGo — Luật làm việc chung cho AI

## 1. Mục tiêu và phạm vi

Xây dựng website đặt đồ ăn FoodGo theo kiến trúc:

- Backend: Node.js, Express.js, TypeScript, SQL Server.
- Frontend: React, Vite, TypeScript, Tailwind CSS.
- Giao tiếp: REST API dùng JSON.
- Database: `DatDoAnOnline`.

Ưu tiên hoàn thành MVP trước, sau đó mới triển khai quản trị và tính năng nâng cấp. Không tự ý thêm đăng nhập, thanh toán online, mã giảm giá, đánh giá, realtime hoặc upload ảnh khi chưa được yêu cầu.

## 2. Phân chia trách nhiệm

- AI Backend chỉ sở hữu `backend/**` và tài liệu hợp đồng API dùng chung.
- AI Frontend chỉ sở hữu `frontend/**`.
- Không sửa file thuộc phạm vi của model còn lại nếu chưa được yêu cầu rõ ràng.
- Khi API chưa sẵn sàng, Frontend phải dùng mock có cùng kiểu dữ liệu và response với hợp đồng API.
- Khi cần thay đổi hợp đồng API, phải cập nhật tài liệu trước và ghi rõ ảnh hưởng tới model còn lại.

## 3. Nguồn dữ liệu chính thức

- Backend là nguồn chính thức cho giá, phí giao hàng, trạng thái món, trạng thái đơn, tổng tiền và doanh thu.
- Frontend chỉ tính số tiền tạm tính để hiển thị; kết quả tạo đơn từ Backend là kết quả cuối cùng.
- Không nhận hoặc tin giá món, thành tiền, tổng tiền hay trạng thái do client gửi lên.
- Tên bảng và cột SQL hiện tại là nguồn tham chiếu cho tầng repository; API phải trả tên trường tiếng Anh theo hợp đồng.

## 4. Hợp đồng API

Mọi endpoint phải dùng response thống nhất:

- Thành công: `{ success: true, message?, data }`.
- Phân trang: thêm `pagination: { page, limit, totalItems, totalPages }`.
- Thất bại: `{ success: false, message, errorCode }`.

Mã lỗi chuẩn:

- `VALIDATION_ERROR`
- `RESTAURANT_NOT_FOUND`
- `FOOD_NOT_FOUND`
- `FOOD_UNAVAILABLE`
- `DIFFERENT_RESTAURANT`
- `CUSTOMER_NOT_FOUND`
- `ORDER_NOT_FOUND`
- `INVALID_ORDER_STATUS`
- `ORDER_CANNOT_BE_CANCELLED`
- `DATABASE_ERROR`
- `INTERNAL_SERVER_ERROR`

Trạng thái món chỉ gồm `CON_BAN` và `NGUNG_BAN`.

Trạng thái đơn chỉ gồm:

- `Chờ xác nhận`
- `Đã xác nhận`
- `Đang xử lý`
- `Hoàn thành`
- `Đã hủy`

Luồng hợp lệ:

- `Chờ xác nhận` → `Đã xác nhận` hoặc `Đã hủy`.
- `Đã xác nhận` → `Đang xử lý` hoặc `Đã hủy`.
- `Đang xử lý` → `Hoàn thành`.
- `Hoàn thành` và `Đã hủy` là trạng thái cuối.

## 5. Quy tắc chất lượng

- Bật TypeScript strict; không dùng `any` nếu có thể mô hình hóa kiểu cụ thể.
- Tách rõ controller, service, repository và validation; không đặt SQL trong controller.
- Không gọi API trực tiếp trong React component; phải qua module `src/api` và hook phù hợp.
- Không hard-code URL API, thông tin kết nối database, bí mật hoặc thông tin môi trường.
- Mọi biến môi trường phải có trong `.env.example`, không commit `.env`.
- Validate toàn bộ params, query và body ở biên hệ thống.
- Xử lý đủ loading, success, empty và error ở giao diện.
- Viết test cho nghiệp vụ quan trọng và bug đã sửa.
- Không sửa test để che lỗi triển khai.
- Không để log debug, code chết, secret, file build hoặc dependency cache trong source.

## 6. Quy trình thay đổi

Trước khi viết mã:

1. Đọc tài liệu API và schema liên quan.
2. Xác định phạm vi Backend hoặc Frontend.
3. Kiểm tra kiểu dữ liệu, trạng thái và mã lỗi dùng chung.
4. Nếu có điểm chưa rõ làm thay đổi hợp đồng hoặc dữ liệu, phải hỏi lại thay vì tự suy đoán.

Sau khi viết mã:

1. Chạy type-check, lint và test phù hợp.
2. Kiểm tra không phát sinh lỗi mới.
3. Liệt kê file đã thay đổi, endpoint/route đã hoàn thành và phần còn thiếu.
4. Ghi rõ mọi giả định hoặc phụ thuộc chưa được triển khai.

## 7. Thứ tự ưu tiên

MVP Backend: database → nhà hàng → món ăn → loại món → tạo đơn → tra cứu đơn → cập nhật trạng thái.

MVP Frontend: layout → trang chủ → nhà hàng → chi tiết nhà hàng → giỏ hàng → checkout → thành công → tra cứu đơn.

Chỉ bắt đầu phần quản trị sau khi luồng MVP chính hoạt động và hợp đồng API ổn định.

## 8. Quy trình Git khi hai người làm song song

Repository dùng chung: `https://github.com/Tungdota53/DAT_DO_AN`.

### Phân nhánh

- `main`: bản ổn định để bàn giao; cấm push trực tiếp.
- `develop`: nhánh tích hợp; cấm push trực tiếp.
- Backend làm trên `backend-dev` hoặc nhánh `backend/<ten-tinh-nang>` tạo từ `develop`.
- Frontend làm trên `frontend-dev` hoặc nhánh `frontend/<ten-tinh-nang>` tạo từ `develop`.
- Không làm Backend và Frontend trên cùng một feature branch.
- Không force-push, rebase hoặc xóa nhánh của người còn lại.

### Đồng bộ và tích hợp

1. Trước khi bắt đầu, fetch remote và cập nhật nhánh làm việc từ `develop`.
2. Chỉ commit file thuộc phạm vi sở hữu; không dùng `git add .` khi có file ngoài phạm vi.
3. Commit phải nhỏ, có một mục đích và dùng tiền tố `feat`, `fix`, `test`, `docs`, `refactor` hoặc `chore`.
4. Push lên nhánh cá nhân và mở Pull Request vào `develop`.
5. Pull Request phải mô tả phạm vi, file chính, cách kiểm thử, thay đổi API và phần chưa hoàn thành.
6. Thay đổi ảnh hưởng cả hai phía phải được người còn lại review trước khi merge.
7. Chỉ merge khi không còn conflict và type-check, lint, test, build liên quan đều thành công.
8. Chỉ tạo Pull Request từ `develop` vào `main` khi luồng tích hợp đã được kiểm thử.

### Xử lý xung đột

- Không tự chọn `ours` hoặc `theirs` cho file do người còn lại sở hữu.
- Nếu conflict nằm trong `backend/**`, người Backend quyết định cách giải quyết.
- Nếu conflict nằm trong `frontend/**`, người Frontend quyết định cách giải quyết.
- Nếu conflict nằm trong tài liệu API, cấu hình gốc hoặc file dùng chung, hai người phải thống nhất trước khi sửa.
- Không xóa thay đổi của người khác chỉ để làm merge thành công.

## 9. Hợp đồng dùng chung

- Hợp đồng API chính thức phải đặt tại đường dẫn thống nhất, ưu tiên `docs/openapi.yaml`.
- Backend sở hữu nội dung endpoint, request, response, status và error code trong hợp đồng.
- Frontend không tự sửa hành vi API; chỉ đề xuất thay đổi và đồng bộ type/mock sau khi hợp đồng được chấp thuận.
- Mọi breaking change phải cập nhật hợp đồng trước, nêu rõ ảnh hưởng và được cả hai người review.
- Nếu code, mock và tài liệu khác nhau, hợp đồng đã được hai bên chấp thuận là nguồn tham chiếu; Backend phải xác nhận hành vi thực tế.

## 10. An toàn repository

- Không commit `.env`, secret, mật khẩu SQL Server, token GitHub hoặc dữ liệu khách hàng thật.
- Không commit `node_modules`, `dist`, coverage, log, cache hoặc file cấu hình máy cá nhân.
- Không tự ý sửa lịch sử Git, tag, GitHub Actions, branch protection hoặc CODEOWNERS.
- Không chạy lệnh Git phá hủy như reset hard, clean, force-push hoặc xóa branch nếu người dùng chưa yêu cầu rõ ràng.
- Không thay đổi dependency dùng chung nếu chưa kiểm tra tác động và ghi rõ lý do trong Pull Request.
- Khi phát hiện file ngoài phạm vi bị thay đổi, dừng lại và báo cho người quản lý thay vì commit kèm.

## 11. Điều kiện hoàn thành

Không được báo hoàn thành chỉ vì đã tạo khung. Một công việc chỉ hoàn thành khi:

- Hành vi được triển khai đầy đủ theo acceptance criteria.
- Không còn lỗi type-check, lint, test hoặc build liên quan.
- Có test cho nghiệp vụ quan trọng hoặc bug đã sửa.
- Tài liệu API, `.env.example` và mock được đồng bộ khi có ảnh hưởng.
- Git diff không chứa file ngoài phạm vi, secret, log hoặc code debug.
- Pull Request ghi rõ giả định, dependency và phần chưa hoàn thành.
