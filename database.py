import os
import psycopg2


# ==========================================
# Database Connection
# ==========================================

def get_connection():
    database_url = os.environ.get("DATABASE_URL")

    if not database_url:
        raise Exception("DATABASE_URL environment variable is not set.")

    return psycopg2.connect(database_url)


# ==========================================
# Create Database Tables
# ==========================================

def create_database():

    conn = get_connection()
    cursor = conn.cursor()

    # Matches table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id SERIAL PRIMARY KEY,
            team_name TEXT NOT NULL,
            total_score INTEGER DEFAULT 0,
            wickets INTEGER DEFAULT 0,
            total_overs TEXT,
            run_rate REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Batsmen table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS batsmen (
            id SERIAL PRIMARY KEY,
            match_id INTEGER NOT NULL,
            player_name TEXT,
            runs INTEGER DEFAULT 0,
            balls INTEGER DEFAULT 0,
            fours INTEGER DEFAULT 0,
            sixes INTEGER DEFAULT 0,
            strike_rate REAL DEFAULT 0,

            FOREIGN KEY (match_id)
            REFERENCES matches(id)
            ON DELETE CASCADE
        )
    """)

    # Over history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS over_history (
            id SERIAL PRIMARY KEY,
            match_id INTEGER NOT NULL,
            over_number INTEGER,
            ball_number INTEGER,
            event TEXT,

            FOREIGN KEY (match_id)
            REFERENCES matches(id)
            ON DELETE CASCADE
        )
    """)

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# Save Match
# ==========================================

def save_match(
    team_name,
    total_score,
    wickets,
    total_overs,
    run_rate
):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO matches
        (
            team_name,
            total_score,
            wickets,
            total_overs,
            run_rate
        )
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (
        team_name,
        total_score,
        wickets,
        total_overs,
        run_rate
    ))

    match_id = cursor.fetchone()[0]

    conn.commit()

    cursor.close()
    conn.close()

    return match_id


# ==========================================
# Save Batsman
# ==========================================

def save_batsman(
    match_id,
    player_name,
    runs,
    balls,
    fours,
    sixes,
    strike_rate
):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO batsmen
        (
            match_id,
            player_name,
            runs,
            balls,
            fours,
            sixes,
            strike_rate
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        match_id,
        player_name,
        runs,
        balls,
        fours,
        sixes,
        strike_rate
    ))

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# Save Ball / Over History
# ==========================================

def save_ball(
    match_id,
    over_number,
    ball_number,
    event
):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO over_history
        (
            match_id,
            over_number,
            ball_number,
            event
        )
        VALUES (%s, %s, %s, %s)
    """, (
        match_id,
        over_number,
        ball_number,
        event
    ))

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# Get All Matches
# ==========================================

def get_all_matches():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id,
            team_name,
            total_score,
            wickets,
            total_overs,
            run_rate,
            created_at
        FROM matches
        ORDER BY id DESC
    """)

    matches = cursor.fetchall()

    cursor.close()
    conn.close()

    return matches


# ==========================================
# Get Match Batsmen
# ==========================================

def get_batsmen(match_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM batsmen
        WHERE match_id = %s
        ORDER BY id ASC
    """, (match_id,))

    players = cursor.fetchall()

    cursor.close()
    conn.close()

    return players


# ==========================================
# Get Over History
# ==========================================

def get_over_history(match_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM over_history
        WHERE match_id = %s
        ORDER BY over_number ASC, ball_number ASC
    """, (match_id,))

    overs = cursor.fetchall()

    cursor.close()
    conn.close()

    return overs


# ==========================================
# Delete Match
# ==========================================

def delete_match(match_id):

    conn = get_connection()
    cursor = conn.cursor()

    # Because ON DELETE CASCADE is enabled,
    # batsmen and over_history will also be deleted.

    cursor.execute("""
        DELETE FROM matches
        WHERE id = %s
    """, (match_id,))

    conn.commit()

    cursor.close()
    conn.close()