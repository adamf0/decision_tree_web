from sqlalchemy import Column, Integer, String
from database import Base

class Dataset(Base):
    __tablename__ = "dataset"

    id = Column(Integer, primary_key=True, index=True)
    NPM = Column(String(50))
    IPK = Column(String(50))
    Pendapatan = Column(String(50))
    JumlahTanggungan = Column(String(50))
    PernahBeasiswa = Column(String(10))
    Keputusan = Column(String(10))
