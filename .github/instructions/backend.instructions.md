---
description: "Luật bắt buộc cho AI Backend khi sửa API, SQL Server, nghiệp vụ đặt hàng hoặc file trong backend."
applyTo: "backend/**"
---

# FoodGo — Luật dành cho AI Backend

## 1. Phạm vi sở hữu

- Chỉ sửa `backend/**`, trừ khi người dùng yêu cầu rõ ràng phạm vi khác.
- Có thể cập nhật tài liệu hợp đồng API dùng chung khi endpoint thay đổi.
- Không sửa `frontend/**`, không xây giao diện và không thêm logic giỏ hàng phía client.
- Không tự ý triển khai đăng nhập, phân quyền, thanh toán online, mã giảm giá, upload ảnh hoặc realtime.

## 2. Kiến trúc bắt buộc

Sử dụng Node.js, Express.js, TypeScript strict và SQL Server. Giữ luồng phụ thuộc:

`route → validator/middleware → controller → service → repository → database`

- Controller chỉ đọc request, gọi service và trả response.
- Service sở hữu nghiệp vụ và transaction orchestration.
- Repository sở hữu SQL; không đặt SQL trong controller.
- Validation phải kiểm tra params, query và body trước khi vào nghiệp vụ.
- Dùng kiểu cụ thể; không dùng `any` khi có thể mô hình hóa.
- Cấu hình database và bí mật chỉ lấy từ biến môi trường.

## 3. Database

Database chính là `DatDoAnOnline`. Trước khi phụ thuộc vào schema, phải kiểm tra các bảng và cột thực tế:

- `NhaHang`
- `KhachHang`
- `LoaiMon`
- `MonAn`
- `DonHang`
- `ChiTietDonHang`

Duy trì `backend/database/fix-database.sql` để:

- Cho phép trạng thái `Đang xử lý`.
- Sửa trigger khóa đơn dựa trên trạng thái cũ trong `deleted`.
- Bổ sung metadata món ăn và nhà hàng cần cho giao diện.
- Bổ sung snapshot thông tin giao hàng vào đơn.

Script SQL phải có thứ tự chạy rõ ràng, an toàn khi áp dụng và không phá dữ liệu hiện có. Không tự đổi tên bảng/cột nguồn nếu chưa có migration và yêu cầu rõ ràng.

## 4. Nghiệp vụ tạo đơn

`POST /api/orders` bắt buộc:

1. Validate khách hàng, nhà hàng, địa chỉ, phương thức thanh toán và danh sách món.
2. Chỉ nhận `foodId` và `quantity` từ client; bỏ qua hoặc từ chối mọi giá client gửi.
3. Đọc giá, trạng thái và nhà hàng của món từ database.
4. Chỉ nhận món `CON_BAN`.
5. Bảo đảm tất cả món thuộc đúng một nhà hàng và đúng `restaurantId`.
6. Dùng transaction cho toàn bộ quá trình tạo/tìm khách, tạo đơn và chi tiết đơn.
7. Lưu giá tại thời điểm đặt vào `DonGiaDat` và tính `ThanhTien` ở Backend.
8. Lấy phí giao hàng từ nhà hàng và lưu snapshot vào đơn.
9. Rollback toàn bộ nếu bất kỳ bước nào thất bại.
10. Trả `subtotal`, `deliveryFee` và `total` do Backend tính.

Không để lỗi giữa chừng tạo đơn thiếu chi tiết hoặc chi tiết không có đơn.

## 5. Trạng thái và doanh thu

Chỉ cho phép:

- `Chờ xác nhận` → `Đã xác nhận` hoặc `Đã hủy`.
- `Đã xác nhận` → `Đang xử lý` hoặc `Đã hủy`.
- `Đang xử lý` → `Hoàn thành`.

Quy tắc:

- Không sửa đơn `Hoàn thành` hoặc `Đã hủy`.
- Không thay chi tiết đơn sau khi đã xác nhận.
- Không xóa đơn hoàn thành.
- Chỉ tăng doanh thu khi chuyển lần đầu sang `Hoàn thành`.
- Cập nhật trạng thái và doanh thu trong cùng transaction để tránh tăng lặp.

## 6. API và lỗi

- Cung cấp `GET /api/health` trả `{ success: true, message: "API is running" }`.
- Dùng đúng envelope và mã lỗi trong luật chung.
- Phân trang phải chuẩn hóa `page`, `limit`, `totalItems`, `totalPages`.
- ID không tồn tại phải trả mã lỗi miền phù hợp, không rò rỉ lỗi SQL.
- Lỗi validation dùng HTTP 400; không tìm thấy dùng 404; xung đột nghiệp vụ dùng 409 khi phù hợp; lỗi không dự kiến dùng 500.
- Middleware lỗi là nơi duy nhất chuyển lỗi nội bộ thành response công khai.

## 7. Tìm kiếm và dữ liệu

- Hỗ trợ Unicode tiếng Việt đúng với kiểu `nvarchar` và tham số SQL.
- Tìm kiếm có dấu/không dấu phải được kiểm thử theo collation hoặc chiến lược đã chọn.
- Mọi SQL dùng parameter binding; cấm nối chuỗi dữ liệu người dùng vào câu SQL.
- Danh sách sort/filter chỉ nhận giá trị allowlist.
- Tránh N+1 query; truy vấn danh sách phải phân trang khi hợp đồng yêu cầu.

## 8. Quản trị

- Xóa món là soft delete: chuyển sang `NGUNG_BAN`.
- Không xóa vật lý món đã có trong `ChiTietDonHang`.
- Dashboard và doanh thu chỉ tính theo định nghĩa đã chốt, mặc định doanh thu từ đơn `Hoàn thành`.
- Không triển khai tài khoản admin mẫu nếu chưa có yêu cầu đăng nhập.

## 9. Kiểm thử bắt buộc

Phải có test cho:

- Danh sách nhà hàng và lọc món.
- Tìm kiếm tiếng Việt có dấu/không dấu.
- Quantity bằng 0 hoặc âm.
- Món ngừng bán và món không tồn tại.
- Món từ nhiều nhà hàng.
- Không tin giá client.
- Rollback khi một món không hợp lệ.
- Tổng tiền và `DonGiaDat`.
- Mọi chuyển trạng thái hợp lệ và không hợp lệ.
- Khóa đơn ở trạng thái cuối.
- Điều kiện hủy đơn.
- Doanh thu chỉ tăng đúng một lần.

Ưu tiên unit test service và integration test API/database. Không sửa kỳ vọng test để hợp thức hóa lỗi.

## 10. Bàn giao mỗi thay đổi

Trước khi kết thúc:

1. Chạy type-check, lint và test Backend.
2. Kiểm tra `.env.example`, migration/SQL và tài liệu API nếu có thay đổi.
3. Không commit `.env`, secret, log, `node_modules` hoặc file build.
4. Báo cáo file đã sửa, endpoint hoàn thành, test đã chạy và phần còn thiếu.
5. Nếu thay đổi response/request, nêu rõ ảnh hưởng để AI Frontend đồng bộ mock và type.

## 11. Quy trình Git dành cho Backend

- Chỉ làm việc trên `backend-dev` hoặc `backend/<ten-tinh-nang>` được tạo từ `develop`.
- Chỉ stage và commit `backend/**` cùng tài liệu API được giao sở hữu.
- Không commit hoặc giải conflict trong `frontend/**`; chuyển conflict đó cho người Frontend.
- Trước Pull Request, đồng bộ `develop`, giải conflict thuộc Backend rồi chạy lại toàn bộ kiểm tra.
- Pull Request đích là `develop`, không phải `main`.
- Nếu endpoint thay đổi, commit tài liệu API trước hoặc cùng Pull Request với code triển khai.
- Breaking change phải được người Frontend chấp thuận trước khi merge.
- Không push code endpoint chưa hoạt động rồi mô tả là hoàn thành; nếu cần chia giai đoạn phải dùng Draft Pull Request và ghi rõ trạng thái.
- Không dùng force-push, reset hard, clean hoặc sửa commit của người Frontend.
