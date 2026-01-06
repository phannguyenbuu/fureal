from pydantic import BaseModel
from typing import Optional

class ModelItem(BaseModel):
    type: str
    file: str
    preview: str
    name: str
    cost: int
    color: str

class ModelItemUpdate(BaseModel):
    type: Optional[str] = None
    file: Optional[str] = None
    preview: Optional[str] = None
    name: Optional[str] = None
    cost: Optional[int] = None
    color: Optional[str] = None
