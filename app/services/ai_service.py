import asyncio
from gpt4all import GPT4All
import os

model = None
model_lock = asyncio.Lock()

model_name = "Phi-3-mini-4k-instruct.Q4_0.gguf"
model_path = os.path.join(os.getcwd(), "app", "models")


def get_model():
    """
    Загружает модель один раз.
    """
    global model
    if model is None:
        print("⏳ Инициализация AI модели...")
        os.makedirs(model_path, exist_ok=True)

        full_path = os.path.join(model_path, model_name)
        if not os.path.exists(full_path):
            raise FileNotFoundError(
                f"\n❌ ОШИБКА: Файл модели не найден локально!\n"
                f"1. Скачайте файл: https://gpt4all.io/models/gguf/{model_name}\n"
                f"2. Положите его в папку: {model_path}\n"
            )

        model = GPT4All(model_name, model_path=model_path, allow_download=False, device='cpu')
        print("✅ AI модель загружена и готова!")
    return model


class AIService:
    @staticmethod
    async def get_chat_response(messages: list) -> str:
        async with model_lock:
            current_model = await asyncio.to_thread(get_model)

            system_prompt = "Ты технический интервьюер. Задавай вопросы по теме. Будь краток. Пиши на русском."

            full_prompt = f"<|system|>\n{system_prompt}<|end|>\n"
            for msg in messages:
                role = "user" if msg['role'] == "user" else "assistant"
                full_prompt += f"<|{role}|>\n{msg['content']}<|end|>\n"
            full_prompt += "<|assistant|>\n"

            print("🤖 ИИ думает над ответом...")

            def _generate():
                with current_model.chat_session():
                    return current_model.generate(
                        full_prompt,
                        max_tokens=20,
                        temp=0.7
                    )

            response = await asyncio.to_thread(_generate)
            return response.strip()

    @staticmethod
    async def generate_feedback(messages: list) -> str:
        async with model_lock:
            current_model = await asyncio.to_thread(get_model)

            system_prompt = "Ты старший разработчик. Проанализируй диалог и дай краткий фидбэк кандидату (Pass/Fail) и советы. Пиши на русском."

            full_prompt = f"<|system|>\n{system_prompt}<|end|>\n"
            for msg in messages:
                role = "user" if msg['role'] == "user" else "assistant"
                full_prompt += f"<|{role}|>\n{msg['content']}<|end|>\n"
            full_prompt += "<|assistant|>\nФидбэк:"

            print("📊 Генерация фидбэка...")

            def _generate():
                with current_model.chat_session():
                    return current_model.generate(
                        full_prompt,
                        max_tokens=20,
                        temp=0.5
                    )

            response = await asyncio.to_thread(_generate)
            return response.strip()