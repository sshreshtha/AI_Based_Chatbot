from sqlalchemy import Column, Integer, String
from database import Base

class QueryModel(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    email = Column(String)
    answer = Column(String, nullable=True)
    status = Column(String)