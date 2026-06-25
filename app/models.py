from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, Integer, String, ForeignKey, Enum as SQLEnum, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from enum import Enum
from decimal import Decimal


class BatchStatus(Enum):
    SUBMITTED = "submitted"
    COMPLETE = "complete"

class GradingCompany(Enum):
    PSA = "PSA"
    CGC = "CGC"
    BGS = "BGS"
    SGC = "SGC"
    TAG = "TAG"

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), default = lambda: str(uuid4()), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique =True, nullable=False)


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(String(36), default = lambda: str(uuid4()), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    grading_company: Mapped[GradingCompany] = mapped_column(SQLEnum(GradingCompany))
    status: Mapped[BatchStatus] = mapped_column(SQLEnum(BatchStatus),  default=BatchStatus.SUBMITTED)
    fees_upfront: Mapped[Decimal] = mapped_column(Numeric(10,2))
    fees_after: Mapped[Decimal | None] = mapped_column(Numeric(10,2))
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default = lambda: datetime.now(timezone.utc))
    returned_at: Mapped[datetime | None] = mapped_column(DateTime)
    cards: Mapped[list["Card"]] = relationship(back_populates="batch")

class Card(Base):
    __tablename__ = "cards"

    id: Mapped[str] = mapped_column(String(36), default = lambda: str(uuid4()), primary_key=True)
    batch_id: Mapped[str] = mapped_column(String(36), ForeignKey("batches.id"))
    pokemon_name: Mapped[str] = mapped_column(String(255))
    set_string: Mapped[str] = mapped_column(String(255))
    raw_value: Mapped[Decimal] = mapped_column(Numeric(10,2))
    target_grade: Mapped[int] = mapped_column(Integer)
    actual_grade: Mapped[int | None] = mapped_column(Integer)
    graded_value: Mapped[Decimal | None] = mapped_column(Numeric(10,2))
    confidence: Mapped[int] = mapped_column(Integer)
    front_photo_key: Mapped[str | None] = mapped_column(String(1024))
    back_photo_key: Mapped[str | None] = mapped_column(String(1024))
    batch: Mapped["Batch"] = relationship(back_populates="cards")

class IssueType(Base):
    __tablename__ = "issue_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    label: Mapped[str] = mapped_column(String(100), unique=True)

class CardIssue(Base):
    __tablename__ = "card_issues"

    card_id: Mapped[str] = mapped_column(String(36), ForeignKey("cards.id"), primary_key=True)
    issue_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("issue_types.id"), primary_key=True)