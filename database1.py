from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

db_url = "sqlite:///./test.db"

engine = create_engine(db_url, connect_args={"check_same_thread": False})
Base = declarative_base()
Session = sessionmaker(autoflush=False, autocommit=False, bind=engine)

def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()
