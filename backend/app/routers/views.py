from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/posts", tags=["views"])


@router.post("/{post_id}/views", response_model=schemas.ViewOut)
def increment_view(post_id: str, db: Session = Depends(get_db)):
    view = db.query(models.PostView).filter(models.PostView.post_id == post_id).first()
    if view is None:
        view = models.PostView(post_id=post_id, count=1)
        db.add(view)
    else:
        view.count += 1
    db.commit()
    db.refresh(view)
    return view
