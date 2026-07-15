from datetime import datetime, timezone, timedelta
from decimal import Decimal
 
from app.db import SessionLocal, DEV_USER_ID
from app.models import Batch, Card, BatchStatus, GradingCompany


def make_batch(session, name, company, days_ago, fees_upfront, fees_after, cards):
    """Create one batch dated `days_ago` days in the past, with its cards."""
    submitted = datetime.now(timezone.utc) - timedelta(days=days_ago)
 
    batch = Batch(
        user_id=DEV_USER_ID,
        name=name,
        grading_company=company,
        status=BatchStatus.COMPLETE,
        fees_upfront=Decimal(fees_upfront),
        fees_after=Decimal(fees_after),
        submitted_at=submitted,
        returned_at=submitted + timedelta(days=14),
    )
    session.add(batch)
    session.flush()  # get batch.id
 
    for c in cards:
        card = Card(
            batch_id=batch.id,
            pokemon_name=c["name"],
            set_string=c["set"],
            raw_value=Decimal(c["raw"]),
            target_grade=c["target"],
            actual_grade=c["actual"],
            graded_value=Decimal(c["graded"]),
            confidence=c["confidence"],
        )
        session.add(card)
 
 
def main():
    with SessionLocal() as session:
        make_batch(
            session, "Summer Holos", GradingCompany.SGC,
            days_ago=100, fees_upfront="70", fees_after="35",
            cards=[
                {"name": "penusaur", "set": "Base Set", "raw": "110", "target": 9, "actual": 8, "graded": "60", "confidence": 7},
            ],
        )
        session.commit()

 
if __name__ == "__main__":
    main()
 