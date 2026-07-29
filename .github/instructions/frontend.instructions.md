---
description: "Luật bắt buộc cho AI Frontend khi sửa React, Vite, Tailwind, mock, tích hợp API hoặc file trong frontend."
applyTo: "frontend/**"
---

# FoodGo — Luật dành cho AI Frontend

## 1. Phạm vi sở hữu

- Chỉ sửa `frontend/**`, trừ khi người dùng yêu cầu rõ ràng phạm vi khác.
- Không sửa `backend/**`, database, SQL hoặc tự thay đổi hành vi endpoint.
- Nếu API thiếu hoặc chưa ổn định, dùng mock đúng hợp đồng và ghi rõ dependency còn thiếu.
- Không tự ý thêm đăng nhập, thanh toán online, mã giảm giá, đánh giá, realtime hoặc upload ảnh.

## 2. Kiến trúc bắt buộc

Sử dụng React, Vite, TypeScript strict và Tailwind CSS.

- Component không gọi `fetch` hoặc `axios` trực tiếp.
- Mọi request đi qua HTTP client chung trong `src/api`.
- Page/component dùng hook hoặc lớp API có kiểu dữ liệu rõ ràng.
- Type miền đặt trong `src/types`; tránh khai báo interface trùng lặp rải rác.
- State giỏ hàng đặt trong store riêng và đồng bộ `localStorage`.
- Không hard-code API URL; dùng `VITE_API_BASE_URL`.
- Không dùng `any` nếu có thể mô hình hóa kiểu cụ thể.

## 3. Hợp đồng API

- Tuân thủ envelope response và mã lỗi trong luật chung.
- Không tự đổi tên field, trạng thái hay endpoint khi Backend chưa cập nhật hợp đồng.
- `VITE_USE_MOCK=true` phải dùng data source mock; `false` dùng API thật mà không yêu cầu sửa component.
- Mock phải mô phỏng cả success, empty, error và response phân trang cần thiết.
- Khi Backend thay đổi hợp đồng, cập nhật type, API adapter, mock và test cùng lúc.

## 4. Nguồn dữ liệu chính thức

Backend là nguồn chính thức cho:

- Giá hiện tại và khả năng bán.
- Phí giao hàng.
- Trạng thái đơn và chuyển trạng thái hợp lệ.
- Tổng tiền cuối cùng.
- Doanh thu và thống kê.

Frontend:

- Chỉ tính subtotal/total tạm thời để hiển thị.
- Khi tạo đơn chỉ gửi thông tin khách, địa chỉ, ghi chú, `restaurantId`, `foodId` và `quantity`.
- Tuyệt đối không gửi `price`, `orderedPrice`, `subtotal`, `deliveryFee`, `total` hoặc trạng thái.
- Sau khi đặt thành công phải dùng số tiền và trạng thái từ response Backend.

## 5. Giỏ hàng

- Một giỏ chỉ chứa món của một nhà hàng.
- Khi thêm món khác nhà hàng, phải hiện modal xác nhận; không tự xóa giỏ.
- Hai lựa chọn: hủy thao tác hoặc xóa giỏ hiện tại rồi thêm món mới.
- Không cho quantity nhỏ hơn 1; muốn bỏ món phải dùng thao tác xóa rõ ràng.
- Không cho thêm món `NGUNG_BAN`; card phải làm mờ, có nhãn và nút bị vô hiệu hóa.
- Persist giỏ trong `localStorage`, đồng thời chịu được dữ liệu cũ/hỏng bằng validation và fallback an toàn.

## 6. Checkout và đặt hàng

- Validate họ tên, số điện thoại Việt Nam, địa chỉ, giỏ không rỗng và quantity dương.
- Chỉ hỗ trợ `COD` trong MVP.
- Khi submit: disable nút và khóa submit lặp trong suốt request.
- Chỉ xóa giỏ sau response tạo đơn thành công.
- Nếu lỗi, giữ nguyên giỏ và hiển thị message an toàn từ Backend.
- Với `FOOD_UNAVAILABLE`, hướng dẫn người dùng cập nhật hoặc bỏ món không còn bán.
- Với `DIFFERENT_RESTAURANT`, không tự sửa payload; yêu cầu người dùng điều chỉnh giỏ.
- Điều hướng tới `/order-success/:orderId` sau khi tạo đơn thành công.

## 7. Trạng thái giao diện

Mọi trang đọc dữ liệu phải có đủ:

- Loading: skeleton phù hợp bố cục.
- Success: dữ liệu đầy đủ.
- Empty: thông báo và hành động tiếp theo hợp lý.
- Error: thông báo dễ hiểu và nút thử lại khi có thể.

Không hiển thị trang trắng, spinner vô hạn hoặc lỗi kỹ thuật thô từ Axios/stack trace.

## 8. UI/UX và responsive

- Phong cách FoodGo hiện đại, nền sáng, màu nhấn cam/đỏ hoặc xanh lá, card bo tròn và hover nhẹ.
- Header cố định nhưng không che nội dung.
- Giỏ hàng dùng drawer trên desktop và hoạt động tốt trên mobile.
- Responsive tối thiểu cho mobile, tablet và desktop.
- Form phải có label, lỗi theo trường, focus state và điều hướng bàn phím.
- Modal/drawer phải quản lý focus, đóng bằng Escape và có tên truy cập phù hợp.
- Ảnh có `alt`, lazy loading khi phù hợp và fallback khi URL lỗi.
- Không chỉ dùng màu sắc để truyền đạt trạng thái.

## 9. Trang khách hàng ưu tiên MVP

Triển khai theo thứ tự:

1. Layout chung và router.
2. Trang chủ.
3. Danh sách nhà hàng.
4. Chi tiết nhà hàng và lọc món.
5. Giỏ hàng.
6. Checkout.
7. Đặt hàng thành công.
8. Tra cứu đơn và timeline trạng thái.

Không bắt đầu Admin khi luồng khách hàng MVP chưa hoạt động, trừ khi người dùng đổi ưu tiên.

## 10. Trang quản trị

- Nút chuyển trạng thái chỉ hiển thị theo trạng thái hiện tại, nhưng Backend vẫn là bên quyết định cuối cùng.
- Khi Backend trả `INVALID_ORDER_STATUS`, refresh dữ liệu và thông báo trạng thái đã thay đổi.
- Quản lý món dùng soft delete/status; không trình bày xóa vĩnh viễn nếu API chỉ chuyển `NGUNG_BAN`.
- Dashboard không tự cộng doanh thu từ dữ liệu client nếu đã có endpoint thống kê.
- Không giả lập quyền admin hoặc bảo mật bằng cách ẩn route nếu chưa có auth Backend.

## 11. Kiểm thử bắt buộc

Phải có test cho:

- Render nhà hàng/món từ API hoặc mock.
- Tìm kiếm, lọc loại món và trạng thái empty/error.
- Thêm, tăng, giảm và xóa món.
- Không cho quantity dưới 1.
- Xác nhận khi đổi nhà hàng.
- Persist giỏ sau reload.
- Checkout validation.
- Payload tạo đơn không chứa giá.
- Chặn submit lặp.
- Chỉ xóa giỏ khi đặt thành công.
- Món ngừng bán và lỗi `FOOD_UNAVAILABLE`.
- Timeline đơn hoàn thành và trạng thái hủy.
- Nút trạng thái Admin.
- Các viewport mobile quan trọng.

Ưu tiên React Testing Library cho hành vi người dùng; không test chi tiết triển khai nội bộ.

## 12. Bàn giao mỗi thay đổi

Trước khi kết thúc:

1. Chạy type-check, lint, test và build Frontend.
2. Kiểm tra `.env.example`, mock và route liên quan.
3. Không commit `.env`, secret, log, `node_modules` hoặc `dist`.
4. Báo cáo file, route, component đã sửa và API đang sử dụng.
5. Ghi rõ endpoint Backend chưa có, giả định tạm thời và cách chuyển mock sang API thật.

## 13. Quy trình Git dành cho Frontend

- Chỉ làm việc trên `frontend-dev` hoặc `frontend/<ten-tinh-nang>` được tạo từ `develop`.
- Chỉ stage và commit `frontend/**`; không commit file Backend hoặc SQL.
- Không commit hoặc giải conflict trong `backend/**`; chuyển conflict đó cho người Backend.
- Trước Pull Request, đồng bộ `develop`, giải conflict thuộc Frontend rồi chạy lại type-check, lint, test và build.
- Pull Request đích là `develop`, không phải `main`.
- Khi Backend đổi hợp đồng đã được chấp thuận, cập nhật API adapter, type, mock và test trong cùng Pull Request Frontend.
- Không tự sửa tài liệu API để hợp thức hóa mock hoặc giao diện đang có.
- Không mô tả tích hợp API là hoàn thành khi vẫn dùng mock; phải ghi rõ `VITE_USE_MOCK` và endpoint còn thiếu.
- Không dùng force-push, reset hard, clean hoặc sửa commit của người Backend.
