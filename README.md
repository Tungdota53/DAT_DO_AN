# FoodGo

Monorepo website đặt đồ ăn sử dụng Express + TypeScript + SQL Server và React + Vite + Tailwind CSS.

## Cấu trúc

- `backend/`: REST API và SQL scripts.
- `frontend/`: giao diện khách hàng và quản trị.
- `docs/openapi.yaml`: hợp đồng API chính thức.
- `docs/postman/`: Postman collection.
- `.github/`: luật AI và Pull Request workflow.

## Cài đặt

1. Cài Node.js LTS và SQL Server.
2. Chạy `npm install` tại thư mục gốc.
3. Sao chép `backend/.env.example` thành `backend/.env` và cấu hình database.
4. Sao chép `frontend/.env.example` thành `frontend/.env`.
5. Chạy Backend bằng script `dev:backend` và Frontend bằng `dev:frontend`.

## Kiểm tra

Các script gốc: `type-check`, `lint`, `test`, `build`.

> Hiện tại đây là skeleton dự án. Chỉ endpoint `GET /api/health` và giao diện khởi đầu đã được tạo.
