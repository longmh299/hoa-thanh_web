# Website Hòa Thành (giao diện B – bán hàng)

Công ty TNHH XNK máy móc thiết bị Hòa Thành. Project **độc lập** với McBrother: code riêng, database riêng, ảnh riêng.

## Chạy lần đầu

```bash
npm install
copy .env.example .env        # Windows (Mac/Linux: cp .env.example .env) rồi điền thông tin
npx prisma db push            # tạo bảng trong database MỚI (rỗng)
npm run dev                   # mở http://localhost:3000
```

Trang quản trị: `http://localhost:3000/admin/login` (tài khoản = ADMIN_USER / ADMIN_PASS trong .env).
Database mới rỗng → vào admin tạo danh mục, sản phẩm, bài viết.

## Sửa thông tin công ty – 1 chỗ duy nhất

`lib/site.ts`: hotline, Zalo, email, địa chỉ, MST, giờ làm việc, mạng xã hội, logo, watermark.
Các dòng có chữ **ĐIỀN** là thông tin tạm, phải sửa trước khi đưa lên mạng.

- Logo ảnh: chép file vào `public/images/` rồi đặt `logo: "/images/ten-file.png"`. Để `""` thì hiện ô chữ "HT".
- Ảnh chia sẻ Facebook/Zalo mặc định: `public/images/og-default.jpg` (1200×630) – đang là ảnh tạm.
- Watermark ảnh sản phẩm: đặt `watermark: "/images/logo-wm.png"`. Để `""` thì không đóng watermark.

## Màu & font giao diện

- Màu: `app/globals.css` → khối `:root` (xanh logo #0B57C2, cam mặt trời #F26B1D, xanh link #0A4AA0, giá #E5361B).
- Font: Inter (chữ thường) + Manrope (tiêu đề, nút, giá) – `app/layout.tsx`.
- Trang chủ: `components/home/HomeB.tsx` (dữ liệu lấy ở `app/page.tsx`).

## Đưa lên Vercel

Tạo project Vercel mới từ repo này, khai báo các biến trong `.env` ở mục Environment Variables, gắn tên miền riêng.

## Nhập / xuất sản phẩm bằng Excel

Admin → Sản phẩm → **Nhập từ Excel** (`/admin/products/import`).

1. Tải file .xlsx lên (tải file mẫu ngay trên trang, hoặc dùng file xuất từ web cũ Sapo/Bizweb).
2. Web kiểm tra từng dòng (mới / cập nhật / cảnh báo / lỗi) – chưa ghi gì vào database.
3. Bấm Nhập: tự tạo danh mục, chép ảnh về Cloudinary (cần điền CLOUDINARY_* trong .env), tạo hoặc cập nhật sản phẩm theo đường dẫn (slug).

Nút **Xuất sản phẩm hiện có** tải toàn bộ sản phẩm ra Excel cùng định dạng → sửa hàng loạt rồi nhập lại để cập nhật.
