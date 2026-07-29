# FoodGo

FoodGo là monorepo đặt món giao tận nơi sử dụng Express + TypeScript + SQL
Server và React + Vite + Tailwind CSS. Luồng khách hàng MVP chạy bằng API và
database thật, không có data source mock ở runtime.

## Chức năng MVP

- Danh sách, tìm kiếm và chi tiết nhà hàng.
- Lọc món theo từ khóa và loại món; chặn món `NGUNG_BAN`.
- Một giỏ chỉ chứa món của một nhà hàng, lưu trong `localStorage`.
- Checkout COD có validation và chặn submit lặp.
- Backend tự đọc giá, phí giao hàng và tính tổng trong transaction.
- Trang thành công, tra cứu đơn bằng mã đơn + số điện thoại và timeline.

Hợp đồng API chính thức nằm tại `docs/openapi.yaml`.

## Yêu cầu máy

- Node.js 22.22 trở lên.
- SQL Server và database `DatDoAnOnline`.
- Microsoft ODBC Driver 18 for SQL Server.

## Cài đặt database

Chạy PowerShell tại thư mục gốc. Tham số `-f 65001` bắt buộc để giữ đúng Unicode:

```powershell
sqlcmd -S localhost -E -C -b -f 65001 -i backend\database\schema.sql
sqlcmd -S localhost -E -C -d DatDoAnOnline -b -f 65001 -i backend\database\fix-database.sql
sqlcmd -S localhost -E -C -d DatDoAnOnline -b -f 65001 -i backend\database\seed.sql
```

`fix-database.sql` là migration idempotent, không xóa dữ liệu hiện có. `seed.sql`
chỉ tạo/cập nhật catalog phát triển, không seed khách hàng hoặc đơn hàng.

## Cài đặt ứng dụng

```powershell
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
npm run dev:backend
```

Mở một terminal khác:

```powershell
npm run dev:frontend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api`

Mặc định Backend dùng Windows Trusted Connection. Nếu dùng SQL Authentication,
đặt `DB_TRUSTED_CONNECTION=false` rồi cấu hình `DB_USER` và `DB_PASSWORD` trong
`backend/.env`. Không commit các file `.env`.

## Kiểm tra

```powershell
npm run type-check
npm run lint
npm run test
npm run build
```

Integration test với SQL Server thật (test tự dọn đơn đã tạo):

```powershell
$env:RUN_DATABASE_TESTS='true'
npm run test --workspace @foodgo/backend
```

## Điều hướng frontend

Dự án tạm dùng History API router tối thiểu. React Router chưa được cài vì các
phiên bản hiện có không đồng thời tránh được các advisory bảo mật đang công bố.
Các page không phụ thuộc implementation router nên có thể chuyển sang phiên bản
an toàn sau này mà không đổi lớp API hoặc nghiệp vụ.
