import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    dbname="hotel_reservations",
    user="postgres",
    password="240902",
    host="127.0.0.1",
    port="5432",
    cursor_factory=RealDictCursor
)
cur = conn.cursor()
cur.execute("SELECT * FROM users;")
print(cur.fetchall())
cur.close()
conn.close()
