from pydantic import BaseModel, validator
from typing import Literal

class DataEntry(BaseModel):
    NPM: str
    IPK: float
    Pendapatan: int
    JumlahTanggungan: int
    Keputusan: str

    class Config:
        orm_mode = True

class PredictionRequest(BaseModel):
    IPK: float
    Pendapatan: int
    JumlahTanggungan: int

    def to_tree_input(self):
        return {
            "IPKBin": self.transform_ipk(),
            "PendapatanBin": self.transform_pendapatan(),
            "JumlahTanggunganBin": self.transform_tanggungan()
        }

    def transform_ipk(self) -> str:
        if self.IPK <= 3.0:
            return "≤3.00"
        elif 3.1 <= self.IPK <= 3.5:
            return "3.1-3.5"
        else:
            return ">3.5"

    def transform_pendapatan(self) -> str:
        if self.Pendapatan <= 4_000_000:
            return "≤4jt"
        elif 4_000_000 < self.Pendapatan <= 6_000_000:
            return "4-6jt"
        else:
            return ">6jt"

    def transform_tanggungan(self) -> str:
        if self.JumlahTanggungan < 3:
            return "<3orang"
        elif 3 <= self.JumlahTanggungan <= 4:
            return "3-4orang"
        else:
            return ">=5orang"

class DataRequest(BaseModel):
    NPM: str