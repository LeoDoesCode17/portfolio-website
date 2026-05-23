# fastapi/app/routers/tech.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserResponse
from typing import Annotated
from app.auth import get_current_user

from app.schemas.tech import TechResponse, TechCreate, TechUpdate, TechDelete
from app.repositories import tech as repository

router = APIRouter(
    prefix='/techs',
    tags=['Techs'],
    dependencies=[Depends(get_current_user)]
)

@router.get('/', response_model=list[TechResponse])
def read_all_techs(db: Session = Depends(get_db)):
    return repository.get(db)

@router.post('/', response_model=TechResponse, status_code=status.HTTP_201_CREATED)
def create_a_tech(
    tech: TechCreate,
    db: Session = Depends(get_db)
):
    return repository.create(db, tech.model_dump())

@router.get("/{id}", response_model=TechResponse)
def get_a_tech(
    id: int,
    db: Session = Depends(get_db),
):
    return repository.get_by_id(db, id)

@router.patch('/{id}', response_model=TechResponse)
def update_a_tech(
    id: int,
    tech: TechUpdate,
    db: Session = Depends(get_db)
):
    return repository.update(db, id, tech.model_dump(exclude_unset=True))

@router.delete('/{id}', response_model=TechDelete)
def delete_a_tech(
    id: int,
    db: Session = Depends(get_db)
):
    return repository.delete(db, id)