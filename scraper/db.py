import psycopg2
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv("../.env")

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def get_company_id(cursor, company_name: str) -> str | None:
    cursor.execute(
        'SELECT id FROM "Company" WHERE LOWER(name) LIKE %s',
        (f"%{company_name.lower()}%",)
    )
    row = cursor.fetchone()
    return row[0] if row else None

def insert_pyqs(company_key: str, questions: list[dict]):
    if not questions:
        print(f"  No questions to insert for {company_key}")
        return

    conn = get_connection()
    cur = conn.cursor()

    company_name_map = {
    "tcs": "tata",
    "infosys": "infosys",
    "amazon": "amazon",
    "wipro": "wipro",
    "google": "google",
    "microsoft": "microsoft",
    "cognizant": "cognizant",
    "hcl": "hcl",
    "accenture": "accenture",
    "flipkart": "flipkart",
    "atlassian": "atlassian",
    "uber": "uber",
    "visa": "visa",
    "jpmorgan": "jp morgan",
    "natwest": "natwest",
    "goldmansachs": "goldman",
    "deutschebank": "deutsche",
    "amex": "american",
}

    company_id = get_company_id(cur, company_name_map.get(company_key, company_key))
    if not company_id:
        print(f"  Company '{company_key}' not found in DB — skipping")
        cur.close()
        conn.close()
        return

    inserted = 0
    for q in questions:
        try:
            cur.execute("""
                INSERT INTO "PYQ" (id, "companyId", question, difficulty, category, tags, "askedCount", "lastSeen", verified, source, "createdAt")
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, 1, %s, false, %s, NOW())
                ON CONFLICT DO NOTHING
            """, (
                company_id,
                q["question"],
                q["difficulty"],
                q["category"],
                q["tags"],
                datetime.now(),
                q["source"],
            ))
            inserted += 1
        except Exception as e:
            print(f"  Insert error: {e}")
            conn.rollback()

    conn.commit()
    cur.close()
    conn.close()
    print(f"  ✅ Inserted {inserted} questions for {company_key}")