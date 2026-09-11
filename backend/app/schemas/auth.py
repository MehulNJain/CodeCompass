"""API contract for authentication. Mirrored in `frontend/src/types/api.ts`."""

from datetime import datetime
from typing import Annotated

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    StringConstraints,
)

PASSWORD_MIN_LENGTH = 8
# Argon2 has no 72-byte ceiling the way bcrypt does, but hashing is expensive
# on purpose, so an unbounded password is a cheap way to burn server CPU.
PASSWORD_MAX_LENGTH = 256

# Lowercased so that Ada@Example.com and ada@example.com are one account. The
# local part is technically case-sensitive; no mainstream provider treats it
# that way, and two accounts differing only in case would be a support mess.
Email = Annotated[EmailStr, AfterValidator(str.lower)]


class SignUpRequest(BaseModel):
    name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=2, max_length=255)
    ]
    email: Email
    password: str = Field(
        ..., min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH
    )


class SignInRequest(BaseModel):
    email: Email
    # No minimum beyond "present": sign-in checks the password, it does not
    # grade it.
    password: str = Field(..., min_length=1, max_length=PASSWORD_MAX_LENGTH)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    created_at: datetime
