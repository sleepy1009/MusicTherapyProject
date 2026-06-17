<div align="center">
  
  # MindMelody
  **Personalized Music Therapy System**

  <p>
    Hệ thống tham vấn tâm lý và điều hướng cảm xúc tự động bằng âm nhạc, <br>
    được kiến trúc dựa trên thuật toán Khoảng cách Euclid có trọng số kết hợp nguyên lý ISO trong âm nhạc và Mô hình ngôn ngữ lớn (LLMs).
  </p>

  [Live Demo](https://music-therapy-project.vercel.app/)

</div>

---

## Table of Contents
- [Home page](#home-page)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Data](#data)


## Home page

<p align="center">

  <img src="https://private-user-images.githubusercontent.com/176700192/609400137-b5690f88-6700-4f0d-b0cb-8eff2b68b29e.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODE3MjA3ODgsIm5iZiI6MTc4MTcyMDQ4OCwicGF0aCI6Ii8xNzY3MDAxOTIvNjA5NDAwMTM3LWI1NjkwZjg4LTY3MDAtNGYwZC1iMGNiLThlZmYyYjY4YjI5ZS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjE3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxN1QxODIxMjhaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iMTIwMTA5MzVmZDU5MGRiNWNiMzYxOTRkZmNmMjdlNGFlNjQyMDZhM2YzMDMzZmZmZDU4MGU1ZDA1NzI2YmNkJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.-gOPY3yYyBk9LpiAgo9MJxyyzPazI-JB0j_hPxtcxJM" alt="MindMelody Workspace" width="100%">

  
</p>
<p align="center">
  <i>i'll update Gif how to use when i have time xD</i>
</p>

---

## Features


- **Cấu trúc hóa Dữ liệu Tâm lý:** Tích hợp thang đo lâm sàng DASS-21, lượng hóa trạng thái Căng thẳng, Lo âu, Trầm cảm thành Vector không gian.
- **Thuật toán Euclid có trọng số:** Tự động tính toán và điều hướng nhịp sinh học (Tempo, Energy, Valence + Instrumentless) dựa trên nguyên lý trị liệu âm nhạc ISO.
- **Safety Gatekeeper & RAG:** Tự động nhận diện ý định tự hại (SOS Trigger) và chặn đứng các lỗ hổng Prompt Injection thông qua Gemini 3.0.
- **Implicit Feedback:** Hệ thống tự học và cập nhật trọng số cá nhân hóa thông qua hành vi nghe nhạc (Skip/Listen) và phân tích ngữ nghĩa tin nhắn.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | ReactJS (Vite), TailwindCSS, TanStack Query |
| **Backend** | Python, Django REST Framework |
| **Database** | PostgreSQL (Supabase Cloud) |
| **AI Engine** | Google Gemini API, YouTube oEmbed API |
| **Deployment** | Vercel (Client), Render (API Server) |

## Quick Start

<details>
<summary><b>1. Khởi chạy Backend (Django)</b></summary>
<br>

Di chuyển vào thư mục `backend` và thiết lập môi trường:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Hoặc: venv\Scripts\activate trên Windows
pip install -r requirements.txt
cp .env.example .env
```

Cấu hình file `.env` với các khóa API của bạn (Supabase, Gemini, Google OAuth). Sau đó khởi chạy:

```bash
python manage.py runserver
```
</details>

<details>
<summary><b>2. Khởi chạy Frontend (React)</b></summary>
<br>

Mở một Terminal mới, di chuyển vào `frontend`:

```bash
cd frontend
npm install
cp .env.example .env
```

Trỏ `VITE_API_URL` về localhost trong file `.env` và chạy:

```bash
npm run dev
```
</details>

## Data

Dữ liệu được lấy từ Kaggle: 🎹 Spotify Tracks Dataset by MaharshiPandya - "A dataset of Spotify songs with different genres and their audio features". 
Với hơn 115.000 bài hát và hơn 125 thể loại âm nhạc cùng 21 trường dữ liệu.

<p align="center">

  <img src="https://private-user-images.githubusercontent.com/176700192/609404587-f2536c95-14a4-473c-9946-a8b9c0ebb287.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODE3MjEzMTksIm5iZiI6MTc4MTcyMTAxOSwicGF0aCI6Ii8xNzY3MDAxOTIvNjA5NDA0NTg3LWYyNTM2Yzk1LTE0YTQtNDczYy05OTQ2LWE4YjljMGViYjI4Ny5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjE3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxN1QxODMwMTlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1hZjhiY2MxZTMyNmNlZDI5YmQ5ZDJkODhhMWUxYmJhMDMyNmViNWJhMWU5ZjM3YTY2MDc1NTRmMTk0MGEyMmQ3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.1vhgBKDfQDoVyIS5bzSbDN11ZMi4lJPDJtOgXVX8BZ4" alt="MindMelody Workspace" width="100%">

</p>

Đề tài tiến hành lọc và loại bỏ 10 trường dữ liệu không phục vụ mục đích, Final Data:

<p align="center">

  <img src="https://private-user-images.githubusercontent.com/176700192/609405613-85188d90-6bd6-4a15-8f4e-cae0c99c7bff.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3ODE3MjE0NzcsIm5iZiI6MTc4MTcyMTE3NywicGF0aCI6Ii8xNzY3MDAxOTIvNjA5NDA1NjEzLTg1MTg4ZDkwLTZiZDYtNGExNS04ZjRlLWNhZTBjOTljN2JmZi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwNjE3JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDYxN1QxODMyNTdaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mYjZiYzNhOWUyZDliZDVjNDZmNjhiZDM3MTAxM2I1ZGM1MmIwNWVhMTQyNDlhZjVmMjUwOGY2ZDZhNzUxNTI5JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.om8cyeE4_cWgeAzShBwp4_tY0C3l1uQMi7syFKPxnwY" alt="MindMelody Workspace" width="100%">

</p>

---
<div align="center">
  <p><i>- algernon -</i></p>
</div>