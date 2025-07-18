from sqlalchemy import Column, Integer, String, Float
from database import Base

class Dataset(Base):
    __tablename__ = "dataset"

    id = Column(Integer, primary_key=True, index=True)
    NPM = Column(String(50), nullable=False)
    IPK = Column(Float, nullable=False)
    Pendapatan = Column(Integer, nullable=False)
    JumlahTanggungan = Column(Integer, nullable=False)
    Keputusan = Column(String(100), nullable=False)
