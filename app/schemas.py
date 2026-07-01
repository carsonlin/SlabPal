from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from app.models import GradingCompany, BatchStatus
from typing import Annotated


class IssueTypeOut(BaseModel):
    id: int
    label: str

    model_config = {"from_attributes": True}


class BatchOut(BaseModel):
    id: str
    user_id: str
    name: str
    grading_company: GradingCompany
    status: BatchStatus
    fees_upfront: Decimal
    fees_after: Decimal | None
    submitted_at: datetime
    returned_at: datetime | None
    card_count: int = 0
    net_profit: Decimal
    model_config = {"from_attributes": True}

class BatchCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    grading_company: GradingCompany
    fees_upfront: Decimal = Field(ge=0, le=99999999.99)


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
    pokemon_name: str = Field(min_length=1, max_length=255)
    set_string: str = Field(min_length=1, max_length=255)
    raw_value: Decimal = Field(ge=0, le=99999999.99)
    target_grade: int = Field(ge=1, le=10)
    confidence: int = Field(ge=1, le=10)
    issue_type_ids: list[int] = []

class BatchDetailOut(BatchOut):
    cards: list[CardOut]
    model_config = {"from_attributes": True}

class CardUpdate(BaseModel):
    actual_grade: int | None = Field(default=None, ge=1, le=10)
    graded_value: Decimal | None = Field(default=None, ge=0, le=99999999.99)

class BatchUpdate(BaseModel):
    status: BatchStatus | None = None
    fees_after: Decimal | None = Field(default=None, ge=0, le=99999999.99)

class CalibrationPoint(BaseModel):
    confidence: int
    hit_rate: int
    category: str

class HighestProfitCard(BaseModel):
    pokemon_name: str
    profit: Decimal

class SummaryOut(BaseModel):
    net_grading_profit: Decimal
    cards_graded: int
    total_batches: int
    grade_hit_rate: int
    highest_profit_card: HighestProfitCard | None




class UserCreate(BaseModel):
    email: str

class UserOut(BaseModel):
    id: str
    email: str
    model_config = {"from_attributes": True}