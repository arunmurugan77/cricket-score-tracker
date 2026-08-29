from flask import Flask, render_template, request, jsonify

from database import (
    create_database,
    save_match,
    save_batsman,
    save_ball,
    get_all_matches,
    get_batsmen,
    get_over_history,
    delete_match,
    save_player,
    get_player_suggestions
)


app = Flask(__name__)


# ==========================================
# Create Database Tables
# ==========================================

create_database()


# ==========================================
# Home Page
# ==========================================

@app.route("/")
def home():

    return render_template("index.html")

@app.route("/score")
def score():
    return render_template("score.html")


# ==========================================
# Player Suggestions
# ==========================================
# Example:
#
# /players?search=A
#
# Returns:
# ["Ajay", "Anil", "Arun"]
#
# ==========================================

@app.route("/players")
def players():

    search = request.args.get("search", "").strip()

    if not search:

        return jsonify([])

    suggestions = get_player_suggestions(search)

    return jsonify(suggestions)


# ==========================================
# Match History
# ==========================================

@app.route("/history")
def history():

    matches = get_all_matches()

    return render_template(
        "history.html",
        matches=matches
    )


# ==========================================
# Match Details
# ==========================================

@app.route("/match/<int:match_id>")
def match_details(match_id):

    matches = get_all_matches()

    match = None

    for m in matches:

        if m[0] == match_id:

            match = m

            break


    if match is None:

        return "Match Not Found", 404


    batsmen = get_batsmen(match_id)

    overs = get_over_history(match_id)


    return render_template(
        "match_details.html",
        match=match,
        batsmen=batsmen,
        overs=overs
    )


# ==========================================
# Save Match
# ==========================================

@app.route("/save_match", methods=["POST"])
def save_match_api():

    data = request.get_json()


    if data is None:

        return jsonify({

            "success": False,

            "message": "No data received."

        }), 400


    # ======================================
    # Save Match
    # ======================================

    match_id = save_match(

        data["team_name"],

        data["total_score"],

        data["wickets"],

        data["total_overs"],

        data["run_rate"]

    )


    # ======================================
    # Save Batsmen
    # ======================================

    for player in data.get("batsmen", []):

        player_name = player["player_name"].strip()


        # Save player name for future
        # autocomplete suggestions

        save_player(player_name)


        # Save batsman statistics

        save_batsman(

            match_id,

            player_name,

            player["runs"],

            player["balls"],

            player.get("dots", 0),

            player["fours"],

            player["sixes"],

            player["strike_rate"]

        )


    # ======================================
    # Save Over History
    # ======================================

    for over_no, over in enumerate(
        data.get("over_history", []),
        start=1
    ):

        balls = str(
            over.get("balls", "")
        )

        score = over.get(
            "score",
            0
        )

        wickets = over.get(
            "wickets",
            0
        )


        event = (
            f"{balls} -> "
            f"{score}/{wickets}"
        )


        save_ball(

            match_id,

            over_no,

            0,

            event

        )


    # ======================================
    # Response
    # ======================================

    return jsonify({

        "success": True,

        "message": "🏏 Match Saved Successfully!",

        "match_id": match_id

    })


# ==========================================
# Delete Match
# ==========================================

@app.route("/delete/<int:match_id>")
def delete(match_id):

    delete_match(match_id)


    return jsonify({

        "success": True,

        "message": "Match Deleted Successfully"

    })


# ==========================================
# 404 Error
# ==========================================

@app.errorhandler(404)
def page_not_found(error):

    return "<h2>404 - Page Not Found</h2>", 404


# ==========================================
# Run Flask
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )