import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import Base, get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    """Создает и удаляет таблицы перед/после КАЖДОГО теста (Очистка состояния)"""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    """Выдает сессию тестовой БД"""
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session):
    """Подменяет реальную БД на тестовую и выдает HTTP-клиент"""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    from app.services.github_service import GithubService
    from app.services.s3_service import S3Service

    GithubService.get_user_repos = lambda x: [{"name": "test-repo", "url": "http", "stars": 5, "language": "Python"}]
    S3Service.upload_file = lambda self, f, k: "test_key.pdf"
    S3Service.get_presigned_url = lambda self, k: "http://test-s3-url.com"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()
