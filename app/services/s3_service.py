import aioboto3
from fastapi import UploadFile, HTTPException
from app.core.config import settings


class S3Service:
    def __init__(self):
        self.session = aioboto3.Session()
        self.config = {
            "endpoint_url": settings.S3_ENDPOINT_URL,
            "aws_access_key_id": settings.S3_ACCESS_KEY,
            "aws_secret_access_key": settings.S3_SECRET_KEY,
        }
        self.bucket = settings.S3_BUCKET_NAME

    async def upload_file(self, file: UploadFile, filename: str) -> str:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")

        if file.content_type not in ["application/pdf",
                                     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            raise HTTPException(status_code=400, detail="Invalid file type. PDF or DOCX only.")

        await file.seek(0)

        async with self.session.client("s3", **self.config) as s3:
            await s3.upload_fileobj(
                file.file,
                self.bucket,
                filename,
                ExtraArgs={"ContentType": file.content_type}
            )
        return filename

    async def get_presigned_url(self, filename: str) -> str:
        async with self.session.client("s3", **self.config) as s3:
            url = await s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': filename},
                ExpiresIn=3600
            )
        return url

    async def delete_file(self, filename: str):
        async with self.session.client("s3", **self.config) as s3:
            await s3.delete_object(Bucket=self.bucket, Key=filename)