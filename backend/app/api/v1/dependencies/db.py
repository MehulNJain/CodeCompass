"""Shared FastAPI dependencies."""

from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.db.relational.session import get_session

SessionDep = Annotated[Session, Depends(get_session)]


class Pagination:
    def __init__(
        self,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> None:
        self.limit = limit
        self.offset = offset


PaginationDep = Annotated[Pagination, Depends(Pagination)]
