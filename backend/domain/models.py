from sqlalchemy import Column, Integer, String, DateTime, Date, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    images = relationship("Image", back_populates="owner")
    quotas = relationship("UserQuota", back_populates="user_relation")

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="images")

class UserQuota(Base):
    __tablename__ = "user_quotas"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    count = Column(Integer, default=0)

    user_relation = relationship("User", back_populates="quotas")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_user_date'),
    )

class GlobalDailyStats(Base):
    __tablename__ = "global_daily_stats"
    date = Column(Date, primary_key=True, nullable=False)
    total_count = Column(Integer, default=0)
