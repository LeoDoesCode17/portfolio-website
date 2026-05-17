# fastapi/app/schemas/user.py

from pydantic import BaseModel

class UserResponse(BaseModel):
    first_name: str
    last_name: str

class UserCreate(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    password: str

