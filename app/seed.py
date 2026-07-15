from app.db import SessionLocal, DEV_USER_ID
from app.models import IssueType, User

def main():

    with SessionLocal() as session:
        # ensure the dev user exists — create_batch attaches new batches to this id
        if session.get(User, DEV_USER_ID) is None:
            session.add(User(id=DEV_USER_ID, email="dev@slabpal.local"))

        # seed issue types once (skip if already populated)
        if session.query(IssueType).first() is None:
            labels = ["Surface Scratch",
                      "Edge Whitening",
                      "Crease",
                      "Front Centering",
                      "Back Centering",
                      "Dent",
                      "Lifted Corner",
                      "Print Line"]
            for item in labels:
                session.add(IssueType(label=item))

        session.commit()

if __name__ == "__main__":
    main()
