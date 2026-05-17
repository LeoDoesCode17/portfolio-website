# /fastapi/app/main.py
from fastapi import FastAPI
from app.routers import image

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from Dockerized FastAPI"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(image.router)

