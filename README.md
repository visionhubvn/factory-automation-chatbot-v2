# AI Chatbot Lead Collection Landing Page (v2)

Hệ thống hạ tầng Landing Page tích hợp AI Chatbot thông minh, tự động phân tích khách hàng tiềm năng và gửi cảnh báo về email.

## Tính năng chính
- **AI Chatbot**: Tự động bóc tách Tên, SĐT, Email từ hội thoại.
- **Lead Analysis**: AI tự phân tích mức độ quan tâm (Interest) và xếp hạng tiềm năng (Hot/Warm/Cold).
- **Email Alert**: Tự động gửi email cảnh báo cho khách hàng "Hot" thông qua Google Apps Script.
- **Google Sheets Sync**: Dữ liệu được đồng bộ và cập nhật theo Session ID vào Google Sheets.

## Cấu hình môi trường (Environment Variables)
Cần cấu hình các biến sau trên Vercel:
- `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`: URL Web App của Google Apps Script.
- `NINEROUTER_API_KEY`: API Key của 9Router (OpenAI-compatible).
- `NINEROUTER_BASE_URL`: Base URL của 9Router.

## Backend
- Script xử lý nằm trong thư mục `google-apps-script/Code.gs`.
