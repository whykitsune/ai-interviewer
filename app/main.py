from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, Response
from app.core.database import engine, Base

from app.api.routes import auth, user, interview

app = FastAPI(title="AI Interview Platform")

origins =[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/robots.txt", response_class=PlainTextResponse)
def get_robots_txt():
    content = """User-agent: *
Disallow: /dashboard
Disallow: /interviews
Disallow: /admin
Disallow: /interview/
Allow: /
Sitemap: http://localhost:5173/sitemap.xml
"""
    return content

@app.get("/sitemap.xml", response_class=Response)
def get_sitemap_xml():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>http://localhost:5173/</loc>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>http://localhost:5173/login</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>
   <url>
      <loc>http://localhost:5173/register</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>
</urlset>"""
    return Response(content=content, media_type="application/xml")


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(interview.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Interview Backend"}