import os
from google import genai
from dotenv import load_dotenv

# Nạp API Key từ file .env
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("Không tìm thấy API Key!")
else:
    client = genai.Client(api_key=api_key)

    print("DANH SÁCH CÁC MODEL BẠN CÓ THỂ SỬ DỤNG:\n")

    for m in client.models.list():
        print(f"Tên Model: {m.name}")
        print(f"Mô tả: {m.description}")
        print("-" * 40)
