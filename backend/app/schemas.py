from pydantic import BaseModel


class ViewOut(BaseModel):
    post_id: str
    count: int

    class Config:
        from_attributes = True
