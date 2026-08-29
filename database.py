import os
import sqlite3
from datetime import datetime, timezone, timedelta

try:
    import psycopg2
except ImportError:
    psycopg2 = None


# ==========================================
# Chennai Timezone (IST - UTC+5:30)
# ==========================================

IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_time():
    """Get current time in India Standard Time (IST, UTC+5:30)"""
    return datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")


# ==========================================
# Database Connection
# ==========================================

def get_connection():

    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        if database_url.startswith("sqlite://"):
            sqlite_path = database_url.replace("sqlite:///", "", 1)
            if not os.path.isabs(sqlite_path):
                sqlite_path = os.path.join(
                    os.path.dirname(__file__),
                    sqlite_path
                )
            conn = sqlite3.connect(sqlite_path)
            conn.row_factory = sqlite3.Row
            return conn

        if psycopg2 is None:
            raise RuntimeError(
                "PostgreSQL support is unavailable because psycopg2 is not installed."
            )

        return psycopg2.connect(database_url)

    sqlite_path = os.path.join(
        os.path.dirname(__file__),
        "cricket.db"
    )
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    return conn


# ==========================================
# Create Database Tables
# ==========================================

def create_database():

    conn = get_connection()
    cursor = conn.cursor()

    if psycopg2 is not None and not isinstance(conn, sqlite3.Connection):
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

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS players (
                id SERIAL PRIMARY KEY,
                player_name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

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

        cursor.execute("""
            ALTER TABLE batsmen
            ADD COLUMN IF NOT EXISTS dots INTEGER DEFAULT 0
        """)

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

    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_name TEXT NOT NULL,
                total_score INTEGER DEFAULT 0,
                wickets INTEGER DEFAULT 0,
                total_overs TEXT,
                run_rate REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS batsmen (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                player_name TEXT,
                runs INTEGER DEFAULT 0,
                balls INTEGER DEFAULT 0,
                dots INTEGER DEFAULT 0,
                fours INTEGER DEFAULT 0,
                sixes INTEGER DEFAULT 0,
                strike_rate REAL DEFAULT 0,
                FOREIGN KEY (match_id)
                REFERENCES matches(id)
                ON DELETE CASCADE
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS over_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                over_number INTEGER,
                ball_number INTEGER,
                event TEXT,
                FOREIGN KEY (match_id)
                REFERENCES matches(id)
                ON DELETE CASCADE
            )
        """)

        cursor.execute("PRAGMA table_info(batsmen)")
        columns = [row[1] for row in cursor.fetchall()]
        if "dots" not in columns:
            cursor.execute("""
                ALTER TABLE batsmen
                ADD COLUMN dots INTEGER DEFAULT 0
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

    created_at = get_ist_time()

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            INSERT INTO matches
            (
                team_name,
                total_score,
                wickets,
                total_overs,
                run_rate,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            team_name,
            total_score,
            wickets,
            total_overs,
            run_rate,
            created_at
        ))
        match_id = cursor.lastrowid
    else:
        cursor.execute("""
            INSERT INTO matches
            (
                team_name,
                total_score,
                wickets,
                total_overs,
                run_rate,
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            team_name,
            total_score,
            wickets,
            total_overs,
            run_rate,
            created_at
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
    dots,
    fours,
    sixes,
    strike_rate
):

    conn = get_connection()
    cursor = conn.cursor()

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            INSERT INTO batsmen
            (
                match_id,
                player_name,
                runs,
                balls,
                dots,
                fours,
                sixes,
                strike_rate
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            match_id,
            player_name,
            runs,
            balls,
            dots,
            fours,
            sixes,
            strike_rate
        ))
    else:
        cursor.execute("""
            INSERT INTO batsmen
            (
                match_id,
                player_name,
                runs,
                balls,
                dots,
                fours,
                sixes,
                strike_rate
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            match_id,
            player_name,
            runs,
            balls,
            dots,
            fours,
            sixes,
            strike_rate
        ))

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# Save Player Name
# ==========================================
# This stores every player name so that
# we can show suggestions in future matches.
# ==========================================

def save_player(player_name):

    player_name = player_name.strip()

    if not player_name:
        return

    conn = get_connection()
    cursor = conn.cursor()

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            INSERT OR IGNORE INTO players
            (
                player_name
            )
            VALUES (?)
        """, (
            player_name,
        ))
    else:
        cursor.execute("""
            INSERT INTO players
            (
                player_name
            )
            VALUES (%s)
            ON CONFLICT (player_name)
            DO NOTHING
        """, (
            player_name,
        ))

    conn.commit()

    cursor.close()
    conn.close()


# ==========================================
# Get Player Suggestions
# ==========================================
# Example:
#
# Search = "A"
#
# Result:
# Arun
# Ajay
# Anil
#
# Search = "Ar"
#
# Result:
# Arun
#
# ==========================================

def get_player_suggestions(search):

    search = search.strip()

    if not search:
        return []

    conn = get_connection()
    cursor = conn.cursor()

    if isinstance(conn, sqlite3.Connection):
        query = """
            SELECT DISTINCT player_name
            FROM players
            WHERE LOWER(player_name) LIKE LOWER(?)
            ORDER BY player_name ASC
            LIMIT 10
        """
        cursor.execute(query, (search + "%",))
    else:
        cursor.execute("""
            SELECT DISTINCT player_name
            FROM players
            WHERE player_name ILIKE %s
            ORDER BY player_name ASC
            LIMIT 10
        """, (
            search + "%",
        ))

    players = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        player[0]
        for player in players
    ]


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

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            INSERT INTO over_history
            (
                match_id,
                over_number,
                ball_number,
                event
            )
            VALUES (?, ?, ?, ?)
        """, (
            match_id,
            over_number,
            ball_number,
            event
        ))
    else:
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

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            SELECT
                id,
                match_id,
                player_name,
                runs,
                balls,
                fours,
                sixes,
                strike_rate,
                dots
            FROM batsmen
            WHERE match_id = ?
            ORDER BY id ASC
        """, (
            match_id,
        ))
    else:
        cursor.execute("""
            SELECT
                id,
                match_id,
                player_name,
                runs,
                balls,
                fours,
                sixes,
                strike_rate,
                dots
            FROM batsmen
            WHERE match_id = %s
            ORDER BY id ASC
        """, (
            match_id,
        ))

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

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            SELECT *
            FROM over_history
            WHERE match_id = ?
            ORDER BY over_number ASC, ball_number ASC
        """, (
            match_id,
        ))
    else:
        cursor.execute("""
            SELECT *
            FROM over_history
            WHERE match_id = %s
            ORDER BY over_number ASC, ball_number ASC
        """, (
            match_id,
        ))

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

    if isinstance(conn, sqlite3.Connection):
        cursor.execute("""
            DELETE FROM matches
            WHERE id = ?
        """, (
            match_id,
        ))
    else:
        cursor.execute("""
            DELETE FROM matches
            WHERE id = %s
        """, (
            match_id,
        ))

    conn.commit()

    cursor.close()
    conn.close()