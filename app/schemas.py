from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from app.models import GradingCompany, BatchStatus

class IssueTypeOut(BaseModel):
    id: int
    label: str

    model_config = {"from_attributes": True}


class BatchOut(BaseModel):
    id: str
    user_id: str
    grading_company: GradingCompany
    status: BatchStatus
    fees_upfront: Decimal
    fees_after: Decimal | None
    submitted_at: datetime
    returned_at: datetime | None

    model_config = {"from_attributes": True}

class BatchCreate(BaseModel):
    grading_company: GradingCompany
    fees_upfront: Decimal

class CardOut(BaseModel):
    id: str
    batch_id: str
    pokemon_name: str
    set_string: str
    raw_value: Decimal
    target_grade: int
    actual_grade: int | None
    graded_value: Decimal | None
    confidence: int
    front_photo_key: str | None
    back_photo_key: str | None
    model_config = {"from_attributes": True}

class CardCreate(BaseModel):
    pokemon_name: str
    set_string: str
    raw_value: Decimal
    target_grade: int
    confidence: int

class BatchDetailOut(BatchOut):
    cards: list[CardOut]
    model_config = {"from_attributes": True}