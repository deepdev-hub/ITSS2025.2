# Vehicle Breakdown Assistance System

## 1. Giới thiệu dự án

**Vehicle Breakdown Assistance System** là hệ thống hỗ trợ cứu hộ xe, cho phép người dùng gửi yêu cầu cứu hộ khi xe gặp sự cố trên đường. Sau khi yêu cầu được tạo, hệ thống sẽ chuyển thông tin đến đơn vị cứu hộ, kỹ thuật viên hoặc quản trị viên để tiếp nhận, phân công và xử lý.

Hệ thống giúp người dùng nhanh chóng tìm được sự hỗ trợ khi gặp các vấn đề như hỏng lốp, hết ắc quy, chết máy, hết xăng hoặc các sự cố xe khác. Trong quá trình xử lý, người dùng có thể theo dõi trạng thái yêu cầu, kỹ thuật viên có thể cập nhật tiến độ công việc, còn quản trị viên có thể quản lý toàn bộ hoạt động của hệ thống.

---

## 2. Mục tiêu của hệ thống

- Hỗ trợ người dùng gửi yêu cầu cứu hộ xe nhanh chóng.
- Giúp đơn vị cứu hộ và kỹ thuật viên tiếp nhận, xử lý yêu cầu hiệu quả.
- Cho phép người dùng theo dõi trạng thái yêu cầu cứu hộ.
- Hỗ trợ quản trị viên quản lý người dùng, kỹ thuật viên, phương tiện và yêu cầu cứu hộ.
- Cung cấp dashboard thống kê để theo dõi hoạt động của hệ thống.
- Nâng cao tính minh bạch trong quá trình cứu hộ xe.

---

## 3. Phạm vi dự án

### 3.1. Chức năng trong phạm vi

Phiên bản đầu tiên của hệ thống hỗ trợ các chức năng chính sau:

- Đăng ký, đăng nhập và quên mật khẩu.
- Quản lý tài khoản người dùng.
- Tạo yêu cầu cứu hộ.
- Xem danh sách và chi tiết yêu cầu cứu hộ.
- Hủy yêu cầu cứu hộ khi chưa hoàn tất.
- Kỹ thuật viên xem yêu cầu chờ nhận.
- Kỹ thuật viên nhận yêu cầu và cập nhật trạng thái xử lý.
- Kỹ thuật viên xem lịch sử công việc.
- Kỹ thuật viên cập nhật trạng thái sẵn sàng làm việc.
- Quản lý khu vực hoạt động của kỹ thuật viên.
- Đơn vị cứu hộ quản lý danh sách kỹ thuật viên.
- Đơn vị cứu hộ quản lý danh sách phương tiện cứu hộ.
- Quản trị viên quản lý người dùng, kỹ thuật viên và yêu cầu cứu hộ.
- Quản trị viên xem dashboard và thống kê hệ thống.

### 3.2. Chức năng ngoài phạm vi

Các chức năng chưa triển khai trong phiên bản đầu tiên:

- Thanh toán trực tuyến.
- Định giá tự động chi phí cứu hộ.
- Tích hợp AI chẩn đoán lỗi xe.
- Gọi video trực tiếp giữa người dùng và kỹ thuật viên.
- Tối ưu tuyến đường nâng cao cho kỹ thuật viên.

---

## 4. Đối tượng sử dụng

### 4.1. Khách

Khách là người chưa đăng nhập vào hệ thống.

Khách có thể:

- Xem trang chủ.
- Đăng ký tài khoản.
- Đăng nhập.
- Sử dụng chức năng quên mật khẩu.

### 4.2. Người dùng

Người dùng là chủ xe hoặc người cần hỗ trợ cứu hộ.

Người dùng có thể:

- Cập nhật hồ sơ cá nhân.
- Tạo yêu cầu cứu hộ.
- Xem lịch sử yêu cầu cứu hộ.
- Xem chi tiết yêu cầu cứu hộ.
- Theo dõi trạng thái yêu cầu.
- Hủy yêu cầu khi yêu cầu chưa được xử lý hoàn tất.
- Đánh giá dịch vụ sau khi hoàn thành.

### 4.3. Kỹ thuật viên

Kỹ thuật viên là người tiếp nhận và xử lý yêu cầu cứu hộ.

Kỹ thuật viên có thể:

- Xem danh sách yêu cầu chờ nhận.
- Xem chi tiết yêu cầu cứu hộ.
- Nhận yêu cầu cứu hộ.
- Cập nhật trạng thái xử lý.
- Xem lịch sử công việc.
- Cập nhật trạng thái sẵn sàng làm việc.
- Quản lý khu vực hoạt động.

### 4.4. Đơn vị cứu hộ

Đơn vị cứu hộ là tổ chức quản lý kỹ thuật viên và phương tiện cứu hộ.

Đơn vị cứu hộ có thể:

- Quản lý danh sách kỹ thuật viên.
- Thêm, sửa, xóa hoặc ẩn kỹ thuật viên.
- Quản lý danh sách phương tiện cứu hộ.
- Thêm, sửa, xóa hoặc ẩn phương tiện cứu hộ.
- Phân công kỹ thuật viên và phương tiện phù hợp cho yêu cầu cứu hộ.

### 4.5. Quản trị viên

Quản trị viên là người có quyền cao nhất trong hệ thống.

Quản trị viên có thể:

- Quản lý tài khoản người dùng.
- Quản lý tài khoản kỹ thuật viên.
- Khóa hoặc mở khóa tài khoản.
- Xem và quản lý tất cả yêu cầu cứu hộ.
- Gán kỹ thuật viên cho yêu cầu cứu hộ.
- Xem dashboard và thống kê hệ thống.

---

## 5. Chức năng chính

## 5.1. Xác thực và tài khoản

- Đăng ký tài khoản.
- Đăng nhập.
- Quên mật khẩu.
- Đặt lại mật khẩu qua email.
- Phân quyền theo vai trò.
- Khóa tài khoản.
- Mở khóa tài khoản.
- Tìm kiếm người dùng.

## 5.2. Quản lý yêu cầu cứu hộ

- Tạo yêu cầu cứu hộ.
- Nhập vị trí xảy ra sự cố.
- Chọn loại sự cố.
- Nhập mô tả chi tiết.
- Tải lên hình ảnh sự cố.
- Xem danh sách yêu cầu.
- Xem chi tiết yêu cầu.
- Hủy yêu cầu cứu hộ.
- Theo dõi trạng thái yêu cầu.

## 5.3. Xử lý yêu cầu của kỹ thuật viên

- Xem danh sách yêu cầu chờ nhận.
- Xem chi tiết yêu cầu được phân công.
- Nhận yêu cầu cứu hộ.
- Cập nhật trạng thái yêu cầu.
- Hoàn thành yêu cầu cứu hộ.
- Hủy yêu cầu trong trường hợp không thể xử lý.
- Xem lịch sử công việc.
- Cập nhật trạng thái làm việc: `ACTIVE`, `BUSY`, `OFFLINE`.

## 5.4. Quản lý kỹ thuật viên

- Xem danh sách kỹ thuật viên.
- Tìm kiếm kỹ thuật viên theo tên hoặc số điện thoại.
- Lọc kỹ thuật viên theo chi nhánh hoặc trạng thái.
- Thêm kỹ thuật viên mới.
- Cập nhật thông tin kỹ thuật viên.
- Xóa hoặc ẩn kỹ thuật viên.
- Kiểm tra trạng thái kỹ thuật viên trước khi xóa.

## 5.5. Quản lý phương tiện cứu hộ

- Xem danh sách phương tiện cứu hộ.
- Tìm kiếm phương tiện theo mã xe hoặc biển số xe.
- Lọc phương tiện theo loại xe, chi nhánh hoặc trạng thái.
- Thêm phương tiện cứu hộ mới.
- Cập nhật thông tin phương tiện.
- Xóa hoặc ẩn phương tiện.
- Kiểm tra trạng thái phương tiện trước khi xóa.

## 5.6. Dashboard và thống kê

- Thống kê tổng số người dùng.
- Thống kê tổng số kỹ thuật viên.
- Thống kê tổng số yêu cầu cứu hộ.
- Thống kê tỷ lệ hoàn thành yêu cầu.
- Hiển thị các chỉ số tổng quan bằng StatCard.
- Hiển thị biểu đồ hoạt động của hệ thống.

---

## 6. Trạng thái yêu cầu cứu hộ

| Trạng thái | Ý nghĩa |
|---|---|
| `PENDING` | Yêu cầu đang chờ tiếp nhận |
| `MATCHED` | Yêu cầu đã được hệ thống hoặc công ty gán cho kỹ thuật viên |
| `ACCEPTED` | Kỹ thuật viên đã nhận yêu cầu |
| `IN_PROGRESS` | Kỹ thuật viên đang xử lý yêu cầu |
| `COMPLETED` | Yêu cầu đã hoàn thành |
| `CANCELED` | Yêu cầu đã bị hủy |

---

## 7. Công nghệ sử dụng

> Có thể chỉnh lại phần này theo đúng source code thực tế của nhóm.

### Frontend

- ReactJS
- Vite
- HTML
- CSS
- JavaScript

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- RESTful API

### Database

- PostgreSQL

### Công cụ phát triển

- Visual Studio Code
- IntelliJ IDEA
- Git / GitHub
- Postman
- pgAdmin / psql

---

## 8. Cấu trúc thư mục tham khảo

```bash
vehicle-breakdown-assistance-system/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/vbas/
│   │   │   │       ├── config/
│   │   │   │       ├── controller/
│   │   │   │       ├── dto/
│   │   │   │       ├── entity/
│   │   │   │       ├── repository/
│   │   │   │       ├── service/
│   │   │   │       └── security/
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── static/
│   │
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── create_tables.sql
│   ├── insert_sample_data.sql
│   └── dump.sql
│
├── docs/
│   └── SRS.doc
│
└── README.md
