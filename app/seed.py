from app.db import SessionLocal
from app.models import IssueType, User

def main():
    
    with SessionLocal() as session:
        existing = session.query(IssueType).first()
        if existing:
            return
        labels = ["Surface Scratch", 
                  "Edge whitening", 
                  "Crease",
                  "Front Centering", 
                  "Back Centering", 
                  "Dent", 
                  "Lifted Corner", 
                  "Print Line"]
        for item in labels:
            issue = IssueType(label=item)
            session.add(issue)
        session.commit()

if __name__ == "__main__":
    main()