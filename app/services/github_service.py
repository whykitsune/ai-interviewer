import httpx
import logging
from fastapi import HTTPException
from app.core.config import settings


class GithubService:
    @staticmethod
    async def get_user_repos(username: str):
        url = f"https://api.github.com/users/{username}/repos"
        headers = {"Accept": "application/vnd.github.v3+json"}

        if hasattr(settings, "GITHUB_TOKEN") and settings.GITHUB_TOKEN:
            headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, headers=headers, params={"sort": "updated", "per_page": 5})

                if response.status_code == 404:
                    return []

                response.raise_for_status()
                data = response.json()

                normalized_data = [
                    {
                        "name": repo["name"],
                        "url": repo["html_url"],
                        "stars": repo["stargazers_count"],
                        "language": repo["language"]
                    }
                    for repo in data
                ]
                return normalized_data

        except httpx.RequestError as exc:
            logging.error(f"Ошибка соединения с GitHub API: {exc}")
            raise HTTPException(status_code=503, detail="Внешний сервис недоступен")
        except httpx.HTTPStatusError as exc:
            logging.error(f"Ошибка HTTP от GitHub API: {exc}")
            raise HTTPException(status_code=502, detail="Ошибка внешнего сервиса")