from fastapi import FastAPI, HTTPException
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.db import get_session
from app.models import IssueType, Batch, Card, User, BatchStatus, CardIssue
from app.schemas import (
    IssueTypeOut, BatchOut, BatchCreate, CardOut, CardCreate,
    BatchDetailOut, CardUpdate, BatchUpdate, CalibrationPoint, SummaryOut, UserOut, UserCreate
)
from datetime import datetime, timezone, timedelta
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],   # your frontend's port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/issue-types", response_model=list[IssueTypeOut])
def get_issue_types(session: Session = Depends(get_session)):
    return session.query(IssueType).all()


@app.get("/batches", response_model=list[BatchOut])
def get_batches(session: Session = Depends(get_session)):
    return session.query(Batch).all()


@app.post("/batches", response_model=BatchOut)
def post_batches(batch_data: BatchCreate, session: Session = Depends(get_session)):
    batch = Batch(
        grading_company=batch_data.grading_company,
        fees_upfront=batch_data.fees_upfront,
        user_id="9374aac3-d864-4bd8-bda2-497de048acbb",
    )
    session.add(batch)
    session.commit()
    session.refresh(batch)
    return batch


@app.delete("/batches/{id}")
def delete_batch(id: str, session: Session = Depends(get_session)):
    batch = session.get(Batch, id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    session.delete(batch)
    session.commit()
    return {"deleted": True}


@app.delete("/cards/{id}")
def delete_card(id: str, session: Session = Depends(get_session)):
    card = session.get(Card, id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    session.delete(card)
    session.commit()
    return {"deleted": True}


@app.delete("/users/{id}")
def delete_user(id: str, session: Session = Depends(get_session)):
    user = session.get(User, id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"deleted": True}


@app.get("/batches/{id}", response_model=BatchDetailOut)
def get_batch(id: str, session: Session = Depends(get_session)):
    batch = session.get(Batch, id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@app.post("/batches/{id}/cards", response_model=CardOut)
def create_card(id: str, card_data: CardCreate, session: Session = Depends(get_session)):
    card = Card(
        pokemon_name=card_data.pokemon_name,
        set_string=card_data.set_string,
        raw_value=card_data.raw_value,
        target_grade=card_data.target_grade,
        confidence=card_data.confidence,
        batch_id=id,
    )
    session.add(card)
    session.flush()
    for issue_id in card_data.issue_type_ids:
        session.add(CardIssue(card_id=card.id, issue_type_id=issue_id))
    session.commit()
    session.refresh(card)
    return card


@app.patch("/cards/{id}", response_model=CardOut)
def update_card(id: str, card_data: CardUpdate, session: Session = Depends(get_session)):
    card = session.get(Card, id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    update_data = card_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(card, field, value)
    session.commit()
    session.refresh(card)
    return card


@app.patch("/batches/{id}", response_model=BatchOut)
def update_batch(id: str, batch_data: BatchUpdate, session: Session = Depends(get_session)):
    batch = session.get(Batch, id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    update_data = batch_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(batch, field, value)
    session.commit()
    session.refresh(batch)
    return batch


@app.get("/analytics/calibration", response_model=list[CalibrationPoint])
def get_calibration(session: Session = Depends(get_session)):
    results = (
        session.query(
            Card.confidence,
            func.count().label("total"),
            func.sum(
                case((Card.actual_grade >= Card.target_grade, 1), else_=0)
            ).label("hits"),
        )
        .filter(Card.actual_grade.isnot(None))
        .group_by(Card.confidence)
        .all()
    )
    calibration = []
    for confidence, total, hits in results:
        hit_rate = round(hits / total * 100)
        expected = confidence * 10
        if hit_rate < expected - 10:
            category = "over"
        elif hit_rate > expected + 10:
            category = "under"
        else:
            category = "well-calibrated"
        calibration.append(
            {"confidence": confidence, "hit_rate": hit_rate, "category": category}
        )
    return calibration


@app.get("/analytics/summary", response_model=SummaryOut)
def get_summary(period: str = "all", session: Session = Depends(get_session)):
    now = datetime.now(timezone.utc)
    if period == "90d":
        cutoff = now - timedelta(days=90)
    elif period == "year":
        cutoff = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    else:
        cutoff = datetime(2000, 1, 1, tzinfo=timezone.utc)

    cards_graded = (
        session.query(func.count())
        .select_from(Card)
        .join(Batch, Card.batch_id == Batch.id)
        .filter(Card.actual_grade.isnot(None), Batch.submitted_at >= cutoff)
        .scalar()
    )

    total_value_added = (
        session.query(func.sum(Card.graded_value - Card.raw_value))
        .join(Batch, Card.batch_id == Batch.id)
        .filter(Card.graded_value.isnot(None), Batch.submitted_at >= cutoff)
        .scalar()
    ) or 0

    total_fees = (
        session.query(func.sum(Batch.fees_upfront + func.coalesce(Batch.fees_after, 0)))
        .filter(Batch.submitted_at >= cutoff)
        .scalar()
    ) or 0

    net_profit = total_value_added - total_fees

    total_hits = (
        session.query(func.count())
        .select_from(Card)
        .join(Batch, Card.batch_id == Batch.id)
        .filter(
            Card.actual_grade.isnot(None),
            Card.actual_grade >= Card.target_grade,
            Batch.submitted_at >= cutoff,
        )
        .scalar()
    )

    grade_hit_rate = round(total_hits / cards_graded * 100) if cards_graded > 0 else 0

    total_batches = (
        session.query(func.count())
        .select_from(Batch)
        .filter(Batch.submitted_at >= cutoff, Batch.status == BatchStatus.COMPLETE)
        .scalar()
    )

    best_card = (
        session.query(Card)
        .join(Batch, Card.batch_id == Batch.id)
        .filter(Card.graded_value.isnot(None), Batch.submitted_at >= cutoff)
        .order_by((Card.graded_value - Card.raw_value).desc())
        .first()
    )

    if best_card is not None:
        highest_profit_card = {
            "pokemon_name": best_card.pokemon_name,
            "profit": best_card.graded_value - best_card.raw_value,
        }
    else:
        highest_profit_card = None

    return SummaryOut(
        net_grading_profit=net_profit,
        cards_graded=cards_graded,
        total_batches=total_batches,
        grade_hit_rate=grade_hit_rate,
        highest_profit_card=highest_profit_card,
    )


@app.post("/users", response_model=UserOut)
def create_user(user_data: UserCreate, session: Session = Depends(get_session)):
    user = User(email=user_data.email)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user