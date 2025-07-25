from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from ml_logic import build_decision_tree,train_all_models
from schemas import PredictionRequest
import pandas as pd

# Inisialisasi database
models.Base.metadata.create_all(bind=engine)

# Inisialisasi FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://sibea.unpak.ac.id"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency untuk mendapatkan session database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/train-all-models")
def run_all_models(db: Session = Depends(get_db)):
    data = db.query(models.Dataset).all()
    rows = [vars(row) for row in data]
    for r in rows:
        r.pop("id", None)
        r.pop("_sa_instance_state", None)
    return train_all_models(rows)

@app.post("/api/visualize-tree")
def visualize_tree_manual(request: PredictionRequest, db: Session = Depends(get_db)):
    # 1. Ambil data dari database
    data = db.query(models.Dataset).all()
    rows = [vars(row) for row in data]

    # 2. Bersihkan kolom yang tidak perlu
    for r in rows:
        r.pop("id", None)
        r.pop("_sa_instance_state", None)

    # 3. Konversi ke DataFrame
    df = pd.DataFrame(rows)

    # ================================
    # 5. DISKRETISASI (BINNING)
    # ================================

    # IPK: ≤3.00, 3.1–3.5, >3.5
    df['IPKBin'] = pd.cut(
        df['IPK'],
        bins=[0, 3.0, 3.5, df['IPK'].max()],
        labels=['≤3.00', '3.1-3.5', '>3.5'],
        include_lowest=True
    )

    # Pendapatan: ≤4jt, 4–6jt, >6jt
    df['PendapatanBin'] = pd.cut(
        df['Pendapatan'],
        bins=[0, 4000000, 6000000, df['Pendapatan'].max()],
        labels=['≤4jt', '4-6jt', '>6jt'],
        include_lowest=True
    )

    # Jumlah Tanggungan: <3, 3–4, ≥5
    df['JumlahTanggunganBin'] = pd.cut(
        df['JumlahTanggungan'],
        bins=[0, 2, 4, df['JumlahTanggungan'].max()],
        labels=['<3orang', '3-4orang', '>=5orang'],
        include_lowest=True
    )

    return build_decision_tree(
        data=df[['IPKBin', 'PendapatanBin', 'JumlahTanggunganBin', 'Keputusan']].to_dict(orient='records'),
        new_instance=request.to_tree_input(),
        attributes=['PendapatanBin', 'IPKBin', 'JumlahTanggunganBin'],
        target='Keputusan'
    )