from sqlalchemy import Column, Integer, String
from app.database import Base


class PostView(Base):
    __tablename__ = "post_views"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(String, unique=True, index=True)
    count = Column(Integer, default=0)
