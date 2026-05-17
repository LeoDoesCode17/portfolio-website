# fastapi/app/repositories/user.py

from sqlalchemy.orm import Session
from app.models.user import User

def get(db: Session):
    return db.query(User).filter(User.disabled == False).all()

def get_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.disabled == False).filter(User.username == username).first()