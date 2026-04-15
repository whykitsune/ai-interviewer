import asyncio
import os
from dotenv import load_dotenv
import aioboto3

# Загружаем настройки из .env
load_dotenv()

ENDPOINT = os.getenv("S3_ENDPOINT_URL")
ACCESS_KEY = os.getenv("S3_ACCESS_KEY")
SECRET_KEY = os.getenv("S3_SECRET_KEY")
BUCKET = os.getenv("S3_BUCKET_NAME")


async def check_minio():
    print(f"--- Проверка подключения к MinIO ---")
    print(f"URL: {ENDPOINT}")
    print(f"Bucket: {BUCKET}")

    session = aioboto3.Session()
    try:
        async with session.client("s3", endpoint_url=ENDPOINT,
                                  aws_access_key_id=ACCESS_KEY,
                                  aws_secret_access_key=SECRET_KEY) as s3:

            # 1. Пробуем получить список бакетов
            print("1. Попытка соединения...")
            response = await s3.list_buckets()
            buckets = [b['Name'] for b in response['Buckets']]
            print(f"✅ Успешно! Найдены бакеты: {buckets}")

            # 2. Проверяем наш бакет
            if BUCKET in buckets:
                print(f"✅ Бакет '{BUCKET}' существует.")
            else:
                print(f"❌ Бакет '{BUCKET}' НЕ НАЙДЕН! Вам нужно создать его.")
                print("   Создаю бакет автоматически...")
                await s3.create_bucket(Bucket=BUCKET)
                print(f"✅ Бакет '{BUCKET}' создан.")

    except Exception as e:
        print(f"\n❌ ОШИБКА ПОДКЛЮЧЕНИЯ: {e}")
        print("Проверьте:")
        print("1. Запущен ли MinIO (docker ps или minio.exe)")
        print("2. Совпадают ли порты (обычно API это 9000)")
        print("3. Правильные ли логин/пароль в .env")


if __name__ == "__main__":
    asyncio.run(check_minio())