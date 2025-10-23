from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/upload")
def upload_resume(file: UploadFile = File(...)):
    # TODO: загрузить и сохранить файл
    return {"filename": file.filename}

@router.get("/")
def get_resume():
    # TODO: вернуть резюме пользователя
    return {"message": "Resume view (stub)"}
