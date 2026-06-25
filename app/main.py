from fastapi import FastAPI, HTTPException
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db import get_session
from app.models import IssueType, Batch, Card
from app.schemas import IssueTypeOut, BatchOut, BatchCreate, CardOut, CardCreate, BatchDetailOut

app = FastAPI()

@app.get("/issue-types", response_model=list[IssueTypeOut])
def get_issue_types(session: Session = Depends(get_session)):
    issue_types = session.query(IssueType).all()
    return issue_types

@app.get("/batches", response_model=list[BatchOut])
def get_batches(session: Session = Depends(get_session)):
    batches = session.query(Batch).all()
    return batches

@app.post("/batches", response_model=BatchOut)
def post_batches(batch_data: BatchCreate, session: Session = Depends(get_session)):
    batch = Batch(
        grading_company=batch_data.grading_company,
        fees_upfront=batch_data.fees_upfront,
        user_id="e02d460a-c0f5-4236-9799-e7e62a73d26c")
    session.add(batch)
    session.commit()
    session.refresh(batch)
    return batch

@app.delete("/batches/{id}")
def delete_batch(id: str, session: Session = Depends(get_session)):
    session.query(Batch).filter(Batch.id == id).delete()
    session.commit()

@app.get("/batches/{id}", response_model= BatchDetailOut)
def get_batch(id: str, session: Session = Depends(get_session)):
    batch = session.get(Batch, id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

@app.post("/batches/{id}/cards", response_model=CardOut)
def create_card(id: str, card_data: CardCreate, session: Session = Depends(get_session)):
    card = Card(pokemon_name=card_data.pokemon_name,
        set_string=card_data.set_string,
        raw_value=card_data.raw_value,
        target_grade=card_data.target_grade,
        confidence=card_data.confidence,
        batch_id=id,)
    session.add(card)
    session.commit()
    session.refresh(card)
    return card

