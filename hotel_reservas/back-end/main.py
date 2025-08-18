from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["http://localhost:3000"] para mais segurança
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Conexão com o banco
def get_connection():
    conn = psycopg2.connect(
        dbname="hotel_reservations",
        user="postgres",
        password="240902",
        host="localhost",
        port="5432",
        cursor_factory=RealDictCursor
    )
    return conn

# Modelos Pydantic
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Rota de registro
@app.post("/register")
def register(user: UserRegister):
    conn = get_connection()
    cur = conn.cursor()
    hashed_password = pwd_context.hash(user.password)
    
    try:
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s,%s,%s) RETURNING id, name, email",
            (user.name, user.email, hashed_password)
        )
        new_user = cur.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email já registrado")
    finally:
        cur.close()
        conn.close()
    
    return new_user

# Rota de login
@app.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (user.email,))
    db_user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not db_user:
        # Usuário não existe → frontend vai redirecionar para registro
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if not pwd_context.verify(user.password, db_user['password']):
        raise HTTPException(status_code=401, detail="Senha incorreta")
    
    return {"id": db_user["id"], "name": db_user["name"], "email": db_user["email"]}


# Modelo para reservas
class Reservation(BaseModel):
    user_id: int
    room_id: int
    check_in: str
    check_out: str

# Rota para listar hotéis
@app.get("/hotels")
def get_hotels():
    conn = get_connection()
    cur = conn.cursor()
    # Busca todos os hotéis
    cur.execute("SELECT * FROM hotels")
    hotels = cur.fetchall()
    
    # Para cada hotel, busca os quartos
    for hotel in hotels:
        cur.execute("SELECT * FROM rooms WHERE hotel_id = %s", (hotel["id"],))
        hotel["rooms"] = cur.fetchall()
    
    cur.close()
    conn.close()
    return hotels


# Rota para criar reservas

@app.post("/reservations")
def create_reservation(reservation: Reservation):
    conn = get_connection()
    cur = conn.cursor()

    # Verifica se já existe conflito de datas
    cur.execute("""
        SELECT * FROM reservations
        WHERE room_id = %s
        AND check_in < %s
        AND check_out > %s
    """, (reservation.room_id, reservation.check_out, reservation.check_in))
    
    conflict = cur.fetchone()
    if conflict:
        cur.close()
        conn.close()
        raise HTTPException(
            status_code=400, 
            detail="Já existe uma reserva nesse quarto para o período selecionado."
        )

    # Se não houver conflito → cria a reserva
    cur.execute(
        "INSERT INTO reservations (user_id, room_id, check_in, check_out) VALUES (%s,%s,%s,%s) RETURNING *",
        (reservation.user_id, reservation.room_id, reservation.check_in, reservation.check_out)
    )
    new_reservation = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return new_reservation



@app.get("/dbinfo")
def dbinfo():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT current_database() AS db, current_user AS user;")
    info = cur.fetchone()
    cur.close()
    conn.close()
    return info


from datetime import date

@app.delete("/reservations/cleanup")
def cleanup_expired_reservations():
    today = date.today()
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Deleta reservas cujo checkout já passou
        cur.execute("DELETE FROM reservations WHERE check_out < %s RETURNING *;", (today,))
        removed = cur.fetchall()
        conn.commit()
    finally:
        cur.close()
        conn.close()
    
    return {"message": f"{len(removed)} reservas expiradas foram removidas", "removed_reservations": removed}
