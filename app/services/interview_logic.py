# Логика хода собеседования

def start_interview_session(user_id: int, topic: str, level: str):
    # TODO: создать запись о сессии собеседования
    return {"session_id": 1, "topic": topic, "level": level}

def end_interview_session(session_id: int):
    # TODO: завершить сессию собеседования
    return {"status": "finished"}
