from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ganti dengan detail MariaDB di XAMPP lokal
DATABASE_URL = "mysql+pymysql://sibea:s1b34unp4kAPPS@host.docker.internal:3306/unpak_sibea"

# Jika root punya password, ganti menjadi: mysql+pymysql://root:password@127.0.0.1:3306/decision_tree

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
