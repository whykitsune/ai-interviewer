# Заглушка для будущей логики ИИ-фидбэка

def generate_feedback_from_interview(interview_transcript: str):
    """
    На вход подаётся текст диалога собеседования.
    На выходе — фидбэк от ИИ.
    """
    # TODO: подключение к OpenAI API / собственной модели
    feedback_text = "Хорошие знания Python, стоит подтянуть алгоритмы и базы данных."
    score = 8.0
    return {"text": feedback_text, "score": score}
