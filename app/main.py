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
    allow_origins=["http://localhost:5173"],   # your frontend's port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/issue-types", response_model=list[IssueTypeOut])
def get_issue_types(session: Session = Depends(get_session)):
    return session.query(IssueType).all()


@app.get("/batches", response_model=list[BatchOut])
def get_batches(limit: int | None = None, session: Session = Depends(get_session)):
    query = (
        session.query(
            Batch,
            func.count(Card.id).label("card_count"),
            func.sum(
                case(
                    (Card.graded_value.isnot(None), Card.graded_value - Card.raw_value),
                    else_=0,
                )
            ).label("value_added"),
            func.count(Card.graded_value).label("graded_count"),
        )
        .outerjoin(Card, Card.batch_id == Batch.id)
        .group_by(Batch.id)
        .order_by(Batch.submitted_at.desc())
    )

    if limit:
        query = query.limit(limit)
    results = query.all()

    batches_out = []
    for batch, card_count, value_added, graded_count in results:
        net_profit = (value_added or 0) - (batch.fees_upfront + (batch.fees_after or 0))
        batch.card_count = card_count
        batch.net_profit = net_profit
        batches_out.append(batch)

    return batches_out



@app.post("/batches", response_model=BatchOut)
def post_batches(batch_data: BatchCreate, session: Session = Depends(get_session)):
    batch = Batch(
        name = batch_data.name,
        grading_company=batch_data.grading_company,
        fees_upfront=batch_data.fees_upfront,
        user_id="0799c44d-8b92-4b4f-b7e1-61e30b3108e2",
    )
    session.add(batch)
    session.commit()
    session.refresh(batch)

    batch.card_count = 0
    batch.net_profit = -(batch.fees_upfront + (batch.fees_after or 0))
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
    # verify the batch exists
    batch = session.get(Batch, id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # validate the submitted issue ids actually exist
    if card_data.issue_type_ids:
        valid_ids = {row.id for row in session.query(IssueType.id).all()}
        invalid = [i for i in card_data.issue_type_ids if i not in valid_ids]
        if invalid:
            raise HTTPException(status_code=422, detail=f"Invalid issue type ids: {invalid}")

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

    # dedupe issue ids so a repeated id doesn't hit the primary-key conflict
    for issue_id in set(card_data.issue_type_ids):
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
        .filter(Card.graded_value.isnot(None), Batch.submitted_at >= cutoff, (Card.graded_value - Card.raw_value) >=0)
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


from sqlalchemy import func

@app.get("/analytics/profit-over-time")
def profit_over_time(session: Session = Depends(get_session)):
    # value added per month from graded cards
    value_rows = (
        session.query(
            func.strftime("%Y-%m", Batch.submitted_at).label("month"),
            func.sum(
                case((Card.graded_value.isnot(None), Card.graded_value - Card.raw_value), else_=0)
            ).label("value_added"),
        )
        .join(Card, Card.batch_id == Batch.id)
        .group_by(func.strftime("%Y-%m", Batch.submitted_at))
    )

    # fees per month from ALL batches
    fee_rows = (
        session.query(
            func.strftime("%Y-%m", Batch.submitted_at).label("month"),
            func.sum(Batch.fees_upfront + func.coalesce(Batch.fees_after, 0)).label("fees"),
        )
        .group_by(func.strftime("%Y-%m", Batch.submitted_at))
    )

    value_by_month = {m: float(v or 0) for m, v in value_rows.all()}
    fees_by_month = {m: float(f or 0) for m, f in fee_rows.all()}

    months = sorted(set(value_by_month) | set(fees_by_month))

    # accumulate a running total
    running = 0.0
    result = []
    for m in months:
        monthly = value_by_month.get(m, 0) - fees_by_month.get(m, 0)
        running += monthly                       # ← add each month to the running total
        result.append({"month": m, "profit": round(running, 2)})

    return result


@app.get("/analytics/issue-outcomes")
def issue_outcomes(session: Session = Depends(get_session)):
    results = (
        session.query(
            IssueType.label.label("issue_name"),
            func.count(CardIssue.card_id).label("flag_count"),
            func.avg(Card.actual_grade).label("avg_grade"),
            func.sum(
                case((Card.actual_grade >= Card.target_grade, 1), else_=0)
            ).label("hits"),
        )
        .outerjoin(CardIssue, CardIssue.issue_type_id == IssueType.id)
        .outerjoin(Card, (Card.id == CardIssue.card_id) & (Card.actual_grade.isnot(None)))
        .group_by(IssueType.id, IssueType.label)
        .order_by(IssueType.id)
        .all()
    )

    out = []
    for issue_name, flag_count, avg_grade, hits in results:
        hit_rate = round((hits / flag_count) * 100) if flag_count and flag_count > 0 else None
        out.append({
            "issue_name": issue_name,
            "flag_count": flag_count or 0,
            "avg_grade": round(float(avg_grade), 1) if avg_grade is not None else None,
            "hit_rate": hit_rate,
        })
    return out