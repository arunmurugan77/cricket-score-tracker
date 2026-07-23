// ==============================
// Match Variables
// ==============================

let totalRuns = 0;
let wickets = 0;
let balls = 0;
let totalOvers = 0;

let strikerName = "";
let nonStrikerName = "";

let strikerRuns = 0;
let strikerBalls = 0;
let strikerFours = 0;
let strikerSixes = 0;

let nonStrikerRuns = 0;
let nonStrikerBalls = 0;
let nonStrikerFours = 0;
let nonStrikerSixes = 0;

let currentOver = [];
let overHistory = [];
let ballHistory = [];


// ==============================
// Start Match
// ==============================

function startMatch() {

    const team = document.getElementById("team").value.trim();
    strikerName = document.getElementById("striker").value.trim();
    nonStrikerName = document.getElementById("non_striker").value.trim();
    totalOvers = parseInt(document.getElementById("total_overs").value);

    if (
        team === "" ||
        strikerName === "" ||
        nonStrikerName === "" ||
        isNaN(totalOvers)
    ) {
        alert("Please fill all details.");
        return;
    }

    document.getElementById("team_name").innerText = team;

    document.getElementById("striker_name").innerHTML =
        "🏏 Striker : " + strikerName + " (0)";
    document.getElementById("non_striker_name").innerHTML =
        "🏏 Non-Striker : " + nonStrikerName + " (0)";

    updateScoreboard();

    enableButtons();

    alert("Match Started!");
}


// ==============================
// Enable Buttons
// ==============================

function enableButtons() {

    document.querySelectorAll("button").forEach(btn => {

        if (!btn.classList.contains("start-btn")) {

            btn.disabled = false;

        }

    });

}


// ==============================
// Add Runs
// ==============================

function addRun(run) {

    totalRuns += run;

    balls++;

    strikerRuns += run;
    strikerBalls++;

    if (run === 4)
        strikerFours++;

    if (run === 6)
        strikerSixes++;

    currentOver.push(run);

    ballHistory.push({
        type: "run",
        run: run
    });

    if (run === 1 || run === 3) {

        changeStrike();

    }

    if (balls % 6 === 0) {

        finishOver();

        changeStrike();

    }

    updateScoreboard();

}


// ==============================
// Strike Change
// ==============================

function changeStrike() {

    let temp;

    temp = strikerName;
    strikerName = nonStrikerName;
    nonStrikerName = temp;

    temp = strikerRuns;
    strikerRuns = nonStrikerRuns;
    nonStrikerRuns = temp;

    temp = strikerBalls;
    strikerBalls = nonStrikerBalls;
    nonStrikerBalls = temp;

    temp = strikerFours;
    strikerFours = nonStrikerFours;
    nonStrikerFours = temp;

    temp = strikerSixes;
    strikerSixes = nonStrikerSixes;
    nonStrikerSixes = temp;

}


// ==============================
// Finish One Over
// ==============================

function finishOver() {

    overHistory.push(currentOver.join(" "));

    document.getElementById("over_history").innerHTML +=
        "<p><b>Over " +
        overHistory.length +
        " :</b> " +
        currentOver.join(" ") +
        "</p>";

    currentOver = [];

}


// ==============================
// Run Rate
// ==============================

function calculateRunRate() {

    if (balls === 0)
        return "0.00";

    return ((totalRuns * 6) / balls).toFixed(2);

}


// ==============================
// Update Scoreboard
// ==============================

function updateScoreboard() {

    document.getElementById("score").innerHTML =
        totalRuns + " / " + wickets;

    let over =
        Math.floor(balls / 6) + "." + (balls % 6);

    document.getElementById("overs").innerHTML =
        "Overs : " + over + " / " + totalOvers;

    document.getElementById("run_rate").innerHTML =
        "Run Rate : " + calculateRunRate();

    document.getElementById("striker_name").innerHTML =
        "🏏 Striker : " +
        strikerName +
        " (" +
        strikerRuns +
        " off " +
        strikerBalls +
        ")";

    document.getElementById("non_striker_name").innerHTML =
        "🏏 Non-Striker : " +
        nonStrikerName +
        " (" +
        nonStrikerRuns +
        " off " +
        nonStrikerBalls +
        ")";

    document.getElementById("current_over").innerHTML =
        currentOver.join(" ");

}

// ==============================
// Wicket
// ==============================

function wicket() {

    wickets++;
    balls++;

    strikerBalls++;

    currentOver.push("W");

    ballHistory.push({
        type: "wicket",
        batsman: strikerName
    });

    updateScoreboard();

    // End innings if all out
    if (wickets >= 10) {

        finishMatch();
        return;

    }

    // End innings if overs completed
    if (balls >= totalOvers * 6) {

        finishMatch();
        return;

    }

    let newPlayer = prompt("Enter New Batsman Name");

    if (newPlayer == null || newPlayer.trim() === "") {

        newPlayer = "Batsman " + (wickets + 2);

    }

    strikerName = newPlayer;
    strikerRuns = 0;
    strikerBalls = 0;
    strikerFours = 0;
    strikerSixes = 0;

    if (balls % 6 === 0) {

        finishOver();
        changeStrike();

    }

    updateScoreboard();

}



// ==============================
// Wide Ball
// ==============================

function wide() {

    totalRuns++;

    currentOver.push("Wd");

    ballHistory.push({
        type: "wide"
    });

    updateScoreboard();

}



// ==============================
// No Ball
// ==============================

function noBall() {

    totalRuns++;

    currentOver.push("Nb");

    ballHistory.push({
        type: "noball"
    });

    updateScoreboard();

}



// ==============================
// Bye
// ==============================

function byeRun() {

    let run = parseInt(prompt("Bye Runs"));

    if (isNaN(run) || run < 0)
        return;

    totalRuns += run;

    balls++;

    strikerBalls++;

    currentOver.push(run + "B");

    ballHistory.push({
        type: "bye",
        run: run
    });

    if (run % 2 == 1)
        changeStrike();

    if (balls % 6 == 0) {

        finishOver();
        changeStrike();

    }

    updateScoreboard();

}



// ==============================
// Leg Bye
// ==============================

function legBye() {

    let run = parseInt(prompt("Leg Bye Runs"));

    if (isNaN(run) || run < 0)
        return;

    totalRuns += run;

    balls++;

    strikerBalls++;

    currentOver.push(run + "LB");

    ballHistory.push({
        type: "legbye",
        run: run
    });

    if (run % 2 == 1)
        changeStrike();

    if (balls % 6 == 0) {

        finishOver();
        changeStrike();

    }

    updateScoreboard();

}



// ==============================
// Check Match Completion
// ==============================

function checkMatchEnd() {

    if (balls >= totalOvers * 6) {

        finishMatch();

        return;

    }

    if (wickets >= 10) {

        finishMatch();

        return;

    }

}
// ==============================
// Undo Last Ball
// ==============================

function undoBall() {

    if (ballHistory.length === 0) {

        alert("Nothing to Undo");
        return;

    }

    let last = ballHistory.pop();

    switch (last.type) {

        case "run":

            totalRuns -= last.run;
            balls--;

            strikerRuns -= last.run;
            strikerBalls--;

            if (last.run === 4)
                strikerFours--;

            if (last.run === 6)
                strikerSixes--;

            currentOver.pop();

            break;


        case "wicket":

            wickets--;
            balls--;

            strikerBalls--;

            currentOver.pop();

            alert("Undo Wicket Completed");
            break;


        case "wide":

            totalRuns--;

            currentOver.pop();

            break;


        case "noball":

            totalRuns--;

            currentOver.pop();

            break;


        case "bye":

            totalRuns -= last.run;
            balls--;

            strikerBalls--;

            currentOver.pop();

            break;


        case "legbye":

            totalRuns -= last.run;
            balls--;

            strikerBalls--;

            currentOver.pop();

            break;

    }

    updateScoreboard();

}



// ==============================
// Refresh Current Over
// ==============================

function updateCurrentOver() {

    document.getElementById("current_over").innerHTML =
        currentOver.join(" ");

}



// ==============================
// Refresh Over History
// ==============================

function refreshOverHistory() {

    let html = "";

    for (let i = 0; i < overHistory.length; i++) {

        html +=
            "<p><b>Over " +
            (i + 1) +
            " :</b> " +
            overHistory[i] +
            "</p>";

    }

    document.getElementById("over_history").innerHTML = html;

}



// ==============================
// Disable All Match Buttons
// ==============================

function disableButtons() {

    document.querySelectorAll("button").forEach(btn => {

        if (!btn.classList.contains("start-btn")) {

            btn.disabled = true;

        }

    });

}



// ==============================
// Finish Match
// ==============================



// ==============================
// Utility Function
// ==============================

function getOversPlayed() {

    return Math.floor(balls / 6) + "." + (balls % 6);

}



// ==============================
// Utility Function
// ==============================

function getMatchSummary() {

    return {

        score: totalRuns,

        wickets: wickets,

        overs: getOversPlayed(),

        runRate: calculateRunRate(),

        striker: {

            name: strikerName,

            runs: strikerRuns,

            balls: strikerBalls,

            fours: strikerFours,

            sixes: strikerSixes

        },

        nonStriker: {

            name: nonStrikerName,

            runs: nonStrikerRuns,

            balls: nonStrikerBalls,

            fours: nonStrikerFours,

            sixes: nonStrikerSixes

        }

    };

}
// ==============================
// Save Match to Flask
// ==============================

async function saveMatch() {

    const data = {

        team_name: document.getElementById("team_name").innerText,

        total_score: totalRuns,

        wickets: wickets,

        total_overs: getOversPlayed(),

        run_rate: calculateRunRate(),

        batsmen: [

            {

                player_name: strikerName,

                runs: strikerRuns,

                balls: strikerBalls,

                fours: strikerFours,

                sixes: strikerSixes,

                strike_rate:
                    strikerBalls === 0
                        ? 0
                        : ((strikerRuns / strikerBalls) * 100).toFixed(2)

            },

            {

                player_name: nonStrikerName,

                runs: nonStrikerRuns,

                balls: nonStrikerBalls,

                fours: nonStrikerFours,

                sixes: nonStrikerSixes,

                strike_rate:
                    nonStrikerBalls === 0
                        ? 0
                        : ((nonStrikerRuns / nonStrikerBalls) * 100).toFixed(2)

            }

        ],

        over_history: overHistory

    };

    try {

        const response = await fetch("/save_match", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        alert(result.message);

    }

    catch (error) {

        console.log(error);

        alert("Unable to save match.");

    }

}



// ==============================
// Finish Match
// ==============================

async function finishMatch() {

    disableButtons();

    let summary =
        "🏏 MATCH FINISHED\n\n" +

        "Score : " +
        totalRuns +
        "/" +
        wickets +

        "\nOvers : " +
        getOversPlayed() +

        "\nRun Rate : " +
        calculateRunRate();

    alert(summary);

    await saveMatch();

    if (confirm("Open Match History?")) {

        window.location.href = "/history";

    }

}



// ==============================
// Reset Match
// ==============================

function resetMatch() {

    totalRuns = 0;

    wickets = 0;

    balls = 0;

    strikerRuns = 0;

    strikerBalls = 0;

    strikerFours = 0;

    strikerSixes = 0;

    nonStrikerRuns = 0;

    nonStrikerBalls = 0;

    nonStrikerFours = 0;

    nonStrikerSixes = 0;

    currentOver = [];

    overHistory = [];

    ballHistory = [];

}



// ==============================
// Console
// ==============================

console.log("🏏 Cricket Score Tracker Loaded Successfully");