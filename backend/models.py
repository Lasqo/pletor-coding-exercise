from sqlalchemy import Column, DateTime, Integer, String, Index
from sqlalchemy.sql import func

from database import Base


class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    user = Column(String, nullable=False)
    url = Column(String, nullable=False)
    
    __table_args__ = (
        Index('idx_created_at', 'created_at'),
    )
