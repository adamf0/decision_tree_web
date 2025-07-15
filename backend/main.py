from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from ml_logic import train_all_models, build_and_visualize_manual_tree, predict_manual
from schemas import PredictionRequest

# Inisialisasi database
models.Base.metadata.create_all(bind=engine)

# Inisialisasi FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
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

@app.get("/train-all-models")
def run_all_models(db: Session = Depends(get_db)):
    data = db.query(models.Dataset).all()
    rows = [vars(row) for row in data]
    for r in rows:
        r.pop("id", None)
        r.pop("_sa_instance_state", None)
    return train_all_models(rows)

# @app.get("/visualize-tree")
# def visualize_tree_manual(db: Session = Depends(get_db)):
#     data = db.query(models.Dataset).all()
#     rows = [vars(row) for row in data]
#     for r in rows:
#         r.pop("id", None)
#         r.pop("_sa_instance_state", None)
#     tree = build_and_visualize_manual_tree(rows)
#     prediction = predict_manual(tree, {
#         "IPK": "<3.0",
#         "Pendapatan": "3000000-5000000",
#         "JumlahTanggungan": ">3",
#         "PernahBeasiswa": "ya"
#     })
#     return {"message": "Tree built and visualized.", "example_prediction": prediction}

@app.post("/visualize-tree")
def visualize_tree_manual(request: PredictionRequest, db: Session = Depends(get_db)):
    data = db.query(models.Dataset).all()
    rows = [vars(row) for row in data]
    for r in rows:
        r.pop("id", None)
        r.pop("_sa_instance_state", None)

    tree, json_b64, image_b64 = build_and_visualize_manual_tree(rows)

    prediction = predict_manual(tree, request.to_tree_input())

    return {
        "message": "Tree built and visualized.",
        "prediction": prediction,
        "tree_json_base64": json_b64,
        "tree_image_base64": image_b64
    }
