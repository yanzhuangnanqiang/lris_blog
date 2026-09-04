from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import views

app = FastAPI()

# 允许前端跨域访问（本地开发 5173 + 线上域名）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://www.thineiris.top"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(views.router)


@app.get("/api/ping")
def ping():
    return {"message": "pong"}
