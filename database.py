import sqlite3


DATABASE = "cricket.db"


# ==========================
# Create Database
# ==========================

def create_database():

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    # Match Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matches(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        team_name TEXT,

        total_score INTEGER,

        wickets INTEGER,

        total_overs TEXT,

        run_rate REAL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
    """)

    # Batsman Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batsmen(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        match_id INTEGER,

        player_name TEXT,

        runs INTEGER,

        balls INTEGER,

        fours INTEGER,

        sixes INTEGER,

        strike_rate REAL,

        FOREIGN KEY(match_id) REFERENCES matches(id)

    )
    """)

    # Over History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS over_history(

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        match_id INTEGER,

        over_number INTEGER,

        ball_number INTEGER,

        event TEXT,

        FOREIGN KEY(match_id) REFERENCES matches(id)

    )
    """)

    conn.commit()
    conn.close()


# ==========================
# Save Match
# ==========================

def save_match(team_name,
               total_score,
               wickets,
               total_overs,
               run_rate):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO matches
    (team_name,total_score,wickets,total_overs,run_rate)

    VALUES(?,?,?,?,?)

    """, (

        team_name,

        total_score,

        wickets,

        total_overs,

        run_rate

    ))

    match_id = cursor.lastrowid

    conn.commit()

    conn.close()

    return match_id


# ==========================
# Save Batsman
# ==========================

def save_batsman(match_id,
                 player_name,
                 runs,
                 balls,
                 fours,
                 sixes,
                 strike_rate):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

    INSERT INTO batsmen

    (match_id,
     player_name,
     runs,
     balls,
     fours,
     sixes,
     strike_rate)

    VALUES(?,?,?,?,?,?,?)

    """,

    (

        match_id,

        player_name,

        runs,

        balls,

        fours,

        sixes,

        strike_rate

    ))

    conn.commit()

    conn.close()


# ==========================
# Save Ball History
# ==========================

def save_ball(match_id,
              over_number,
              ball_number,
              event):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

    INSERT INTO over_history

    (match_id,
    over_number,
    ball_number,
    event)

    VALUES(?,?,?,?)

    """,

    (

        match_id,

        over_number,

        ball_number,

        event

    ))

    conn.commit()

    conn.close()


# ==========================
# Get All Matches
# ==========================

def get_all_matches():

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

    SELECT *

    FROM matches

    ORDER BY id DESC

    """)

    matches = cursor.fetchall()

    conn.close()

    return matches


# ==========================
# Get Match Batsmen
# ==========================

def get_batsmen(match_id):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

    SELECT *

    FROM batsmen

    WHERE match_id=?

    """,

    (match_id,))

    players = cursor.fetchall()

    conn.close()

    return players


# ==========================
# Get Over History
# ==========================

def get_over_history(match_id):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""

    SELECT *

    FROM over_history

    WHERE match_id=?

    ORDER BY over_number

    """,

    (match_id,))

    overs = cursor.fetchall()

    conn.close()

    return overs


# ==========================
# Delete Match
# ==========================

def delete_match(match_id):

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute(

        "DELETE FROM matches WHERE id=?",

        (match_id,)

    )

    cursor.execute(

        "DELETE FROM batsmen WHERE match_id=?",

        (match_id,)

    )

    cursor.execute(

        "DELETE FROM over_history WHERE match_id=?",

        (match_id,)

    )

    conn.commit()

    conn.close()