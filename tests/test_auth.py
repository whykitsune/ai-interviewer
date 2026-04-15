import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_register_user_success(client: AsyncClient):
    """Проверка успешной регистрации (Граничный случай: новые данные)"""
    response = await client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@mail.com", "password": "strongpassword"}
    )
    assert response.status_code == 200
    assert response.json() == {"msg": "User created successfully"}


async def test_register_user_duplicate_email(client: AsyncClient):
    """Проверка ошибки валидации: дубликат email"""
    await client.post("/auth/register", json={"username": "user1", "email": "dup@mail.com", "password": "123"})

    response = await client.post("/auth/register",
                                 json={"username": "user2", "email": "dup@mail.com", "password": "123"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


async def test_login_and_access_protected_route(client: AsyncClient):
    """Сквозная проверка: Регистрация -> Логин -> Доступ к защищенному профилю"""
    await client.post("/auth/register", json={"username": "user", "email": "login@mail.com", "password": "123"})

    login_resp = await client.post("/auth/login", json={"email": "login@mail.com", "password": "123"})
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert "access_token" in tokens

    me_resp = await client.get("/users/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "login@mail.com"