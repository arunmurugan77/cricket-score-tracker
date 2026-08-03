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

    const overData = {
        balls: [...currentOver],
        score: totalRuns,
        wickets: wickets
    };

    overHistory.push(overData);

    const overNumber = overHistory.length;

    const ballsHTML = overData.balls.map(ball => {

        let ballClass = "over-ball";

        if (ball === "4") {
            ballClass += " four";
        }

        if (ball === "6") {
            ballClass += " six";
        }

        if (String(ball).includes("W")) {
            ballClass += " wicket-ball";
        }

        if (
            String(ball).includes("Wd") ||
            String(ball).includes("Nb")
        ) {
            ballClass += " extra-ball";
        }

        return `<span class="${ballClass}">${ball}</span>`;

    }).join("");

    document.getElementById("over_history").innerHTML += `
        <div class="over-item">
            <div class="over-row">

                <strong class="over-number">
                    Over ${overNumber}
                </strong>

                <div class="over-balls">
                    ${ballsHTML}
                </div>

                <strong class="over-score">
                    ${overData.score}/${overData.wickets}
                </strong>

            </div>
        </div>
    `;

    currentOver = [];

    updateCurrentOver();
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

    updateCurrentOver();
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

    let batRuns = prompt(
        "No Ball - Enter batsman runs:\n\n" +
        "0 = No Ball only (+1)\n" +
        "1 = No Ball + 1 run (+2)\n" +
        "2 = No Ball + 2 runs (+3)\n" +
        "3 = No Ball + 3 runs (+4)\n" +
        "4 = No Ball + FOUR (+5)\n" +
        "6 = No Ball + SIX (+7)"
    );

    if (batRuns === null) {
        return;
    }

    batRuns = parseInt(batRuns);

    if (![0, 1, 2, 3, 4, 6].includes(batRuns)) {
        alert("Please enter 0, 1, 2, 3, 4 or 6.");
        return;
    }

    // 1 automatic extra run for No Ball
    totalRuns += 1 + batRuns;

    // Batsman receives only bat runs
    strikerRuns += batRuns;

    // No Ball counts as a ball faced by batsman,
    // but NOT as a legal delivery in the over
    strikerBalls++;

    if (batRuns === 4) {
        strikerFours++;
    }

    if (batRuns === 6) {
        strikerSixes++;
    }

    // Example: Nb, Nb+1, Nb+4, Nb+6
    let display = "Nb";

    if (batRuns > 0) {
        display = "Nb+" + batRuns;
    }

    currentOver.push(display);

    ballHistory.push({
        type: "noball",
        batRuns: batRuns
    });

    // Odd batsman runs change strike
    if (batRuns === 1 || batRuns === 3) {
        changeStrike();
    }

    // IMPORTANT:
    // Do NOT increase balls here.
    // A No Ball is not a legal delivery.

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

// ==============================
// Undo Last Ball
// ==============================

function undoBall() {

    if (ballHistory.length === 0) {
        alert("Nothing to Undo");
        return;
    }

    const last = ballHistory.pop();

    // =====================================
    // If previous ball completed an over,
    // reopen that completed over first
    // =====================================

    if (currentOver.length === 0 && overHistory.length > 0) {

        const lastOver = overHistory.pop();

        currentOver = lastOver.balls
            ? lastOver.balls.split(" ")
            : [];

        // At the end of an over we changed strike.
        // Reverse that change before undoing the ball.
        changeStrike();

        refreshOverHistory();
    }


    // =====================================
    // NORMAL RUN
    // =====================================

    if (last.type === "run") {

        // If odd run changed strike,
        // reverse the strike first.
        if (last.run === 1 || last.run === 3) {
            changeStrike();
        }

        totalRuns -= last.run;
        balls--;

        strikerRuns -= last.run;
        strikerBalls--;

        if (last.run === 4) {
            strikerFours--;
        }

        if (last.run === 6) {
            strikerSixes--;
        }

        currentOver.pop();
    }


    // =====================================
    // WICKET
    // =====================================

    else if (last.type === "wicket") {

        wickets--;
        balls--;

        /*
           The wicket function replaces the striker
           with a new batsman.

           Your current ballHistory only stores the
           dismissed batsman's name, so restore that
           batsman's name here.
        */

        strikerName = last.batsman;

        strikerRuns = 0;
        strikerBalls = 0;
        strikerFours = 0;
        strikerSixes = 0;

        currentOver.pop();
    }


    // =====================================
    // WIDE
    // =====================================

    else if (last.type === "wide") {

        totalRuns--;

        // Wide does NOT reduce legal balls.
        currentOver.pop();
    }


    // =====================================
    // NO BALL
    // =====================================

    else if (last.type === "noball") {

        // Odd bat runs changed strike.
        if (last.batRuns === 1 || last.batRuns === 3) {
            changeStrike();
        }

        totalRuns -= (1 + last.batRuns);

        strikerRuns -= last.batRuns;
        strikerBalls--;

        if (last.batRuns === 4) {
            strikerFours--;
        }

        if (last.batRuns === 6) {
            strikerSixes--;
        }

        // No Ball was not a legal delivery,
        // so do NOT decrease balls.
        currentOver.pop();
    }


    // =====================================
    // BYE
    // =====================================

    else if (last.type === "bye") {

        // Odd bye changed strike.
        if (last.run % 2 === 1) {
            changeStrike();
        }

        totalRuns -= last.run;
        balls--;

        strikerBalls--;

        currentOver.pop();
    }


    // =====================================
    // LEG BYE
    // =====================================

    else if (last.type === "legbye") {

        // Odd leg bye changed strike.
        if (last.run % 2 === 1) {
            changeStrike();
        }

        totalRuns -= last.run;
        balls--;

        strikerBalls--;

        currentOver.pop();
    }


    // =====================================
    // Safety
    // =====================================

    if (totalRuns < 0) {
        totalRuns = 0;
    }

    if (balls < 0) {
        balls = 0;
    }

    if (wickets < 0) {
        wickets = 0;
    }


    // =====================================
    // Refresh Screen
    // =====================================

    refreshOverHistory();
    updateCurrentOver();
    updateScoreboard();
}



// ==============================
// Refresh Current Over
// ==============================

function updateCurrentOver() {

    const currentOverElement =
        document.getElementById("current_over");

    if (currentOver.length === 0) {

        currentOverElement.innerHTML =
            '<span class="no-balls">No balls yet</span>';

        return;
    }

    let html = "";

    currentOver.forEach(ball => {

        let ballClass = "ball";

        // Wicket
        if (ball === "W") {
            ballClass += " wicket-ball";
        }

        // Four
        else if (ball === 4 || ball === "4") {
            ballClass += " four-ball";
        }

        // Six
        else if (ball === 6 || ball === "6") {
            ballClass += " six-ball";
        }

        // Wide
        else if (
            String(ball).toLowerCase().includes("wd")
        ) {
            ballClass += " wide-ball";
        }

        // No Ball
        else if (
            String(ball).toLowerCase().includes("nb")
        ) {
            ballClass += " noball-ball";
        }

        // Bye
        else if (
            String(ball).endsWith("B") &&
            !String(ball).endsWith("LB")
        ) {
            ballClass += " bye-ball";
        }

        // Leg Bye
        else if (
            String(ball).endsWith("LB")
        ) {
            ballClass += " legbye-ball";
        }

        html +=
            '<span class="' +
            ballClass +
            '">' +
            ball +
            '</span>';
    });

    currentOverElement.innerHTML = html;
}



// ==============================
// Refresh Over History
// ==============================

function refreshOverHistory() {

    const historyDiv =
        document.getElementById("over_history");

    historyDiv.innerHTML = "";

    if (overHistory.length === 0) {

        historyDiv.innerHTML =
            '<p class="history-placeholder">' +
            'No completed overs yet' +
            '</p>';

        return;
    }

    overHistory.forEach((over, index) => {

        const row = document.createElement("div");

        row.className = "over-item";


        // ==========================
        // Ball circles
        // ==========================

        let ballsHTML = "";

        const balls = over.balls
            ? over.balls.split(" ")
            : [];


        balls.forEach(ball => {

            let ballClass = "history-ball";


            // Wicket
            if (ball === "W") {

                ballClass += " history-wicket";

            }

            // Four
            else if (ball === "4") {

                ballClass += " history-four";

            }

            // Six
            else if (ball === "6") {

                ballClass += " history-six";

            }

            // Wide
            else if (
                ball.toLowerCase().includes("wd")
            ) {

                ballClass += " history-wide";

            }

            // No Ball
            else if (
                ball.toLowerCase().includes("nb")
            ) {

                ballClass += " history-noball";

            }


            ballsHTML +=
                '<span class="' +
                ballClass +
                '">' +
                ball +
                '</span>';
        });


        // ==========================
        // Complete Over Row
        // ==========================

        row.innerHTML = `

            <div class="over-number">
                Over ${index + 1}
            </div>

            <div class="history-balls">
                ${ballsHTML}
            </div>

            <div class="over-total">
                ${over.totalScore}/${over.wickets}
            </div>

        `;


        historyDiv.appendChild(row);

    });

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