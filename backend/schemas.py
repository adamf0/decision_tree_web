from pydantic import BaseModel, validator
from typing import Literal

class DataEntry(BaseModel):
    NPM: str
    IPK: str
    Pendapatan: str
    JumlahTanggungan: str
    PernahBeasiswa: str
    Keputusan: str

    class Config:
        orm_mode = True

class PredictionRequest(BaseModel):
    IPK: float
    Pendapatan: int
    JumlahTanggungan: int
    PernahBeasiswa: Literal["ya", "tidak"]

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
            "IPK": (
                "<3.0" if self.IPK < 3.0 else
                "3.0-3.5" if self.IPK <= 3.5 else
                ">3.5"
            ),
            "Pendapatan": (
                "<3000000" if self.Pendapatan < 3000000 else
                "3000000-5000000" if self.Pendapatan <= 5000000 else
                ">5000000"
            ),
            "JumlahTanggungan": (
                "1" if self.JumlahTanggungan == 1 else
                "2-3" if 2 <= self.JumlahTanggungan <= 3 else
                ">3"
            ),
            "PernahBeasiswa": self.PernahBeasiswa
        }
