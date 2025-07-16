from pydantic import BaseModel, validator
from typing import Literal

class DataEntry(BaseModel):
    NPM: str
    IPK: float
    Pendapatan: int
    JumlahTanggungan: int
    # PernahBeasiswa: str
    Keputusan: str

    class Config:
        orm_mode = True

class PredictionRequest(BaseModel):
    IPK: float
    Pendapatan: int
    JumlahTanggungan: int
    # PernahBeasiswa: Literal["ya", "tidak"]

    @validator("IPK", pre=True)
    def validate_ipk_range(cls, v):
        if v < 0 or v > 4:
            raise ValueError("IPK harus antara 0.00 sampai 4.00")
        return v

    @validator("Pendapatan", pre=True)
    def validate_pendapatan_range(cls, v):
        if v < 0:
            raise ValueError("Pendapatan tidak valid")
        return v

    @validator("JumlahTanggungan", pre=True)
    def validate_tanggungan(cls, v):
        if v < 0:
            raise ValueError("Jumlah tanggungan tidak valid")
        return v

    def to_tree_input(self):
        return {
            "IPK": self.IPK,
            "Pendapatan": self.Pendapatan,
            "JumlahTanggungan": self.JumlahTanggungan,
            # "PernahBeasiswa": self.PernahBeasiswa
        }
