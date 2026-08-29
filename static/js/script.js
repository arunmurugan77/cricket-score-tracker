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
let strikerDots = 0;
let strikerFours = 0;
let strikerSixes = 0;

let nonStrikerRuns = 0;
let nonStrikerBalls = 0;
let nonStrikerDots = 0;
let nonStrikerFours = 0;
let nonStrikerSixes = 0;

let currentOver = [];
let overHistory = [];
let ballHistory = [];
let dismissedBatsmen = [];


// ==============================
// Start Match
// ==============================

function startMatch() {

    const teamInput = document.getElementById("team");
    const strikerInput = document.getElementById("striker");
    const nonStrikerInput = document.getElementById("non_striker");
    const oversInput = document.getElementById("total_overs");

    if (!teamInput || !strikerInput || !nonStrikerInput || !oversInput) {
        return;
    }

    const team = teamInput.value.trim();
    const newStriker = strikerInput.value.trim();
    const newNonStriker = nonStrikerInput.value.trim();
    const newTotalOvers = parseInt(oversInput.value, 10);

    if (
        team === "" ||
        newStriker === "" ||
        newNonStriker === "" ||
        isNaN(newTotalOvers) ||
        newTotalOvers <= 0
    ) {
        alert("Please fill all details correctly.");
        return;
    }

    sessionStorage.setItem(
        "cricketMatchSetup",
        JSON.stringify({
            team: team,
            striker: newStriker,
            nonStriker: newNonStriker,
            totalOvers: newTotalOvers
        })
    );

    window.location.href = "/score";
}

// ==============================
// Initialize Score Page
// ==============================

function initializeScorePage() {

    const scorePage = document.getElementById("score");

    if (!scorePage) {
        return;
    }

    const saved = sessionStorage.getItem("cricketMatchSetup");

    if (!saved) {
        alert("Match details are missing.");
        window.location.href = "/";
        return;
    }

    const setup = JSON.parse(saved);

    totalRuns = 0;
    wickets = 0;
    balls = 0;
    totalOvers = parseInt(setup.totalOvers, 10) || 0;

    strikerName = setup.striker || "";
    nonStrikerName = setup.nonStriker || "";

    strikerRuns = 0;
    strikerBalls = 0;
    strikerDots = 0;
    strikerFours = 0;
    strikerSixes = 0;

    nonStrikerRuns = 0;
    nonStrikerBalls = 0;
    nonStrikerDots = 0;
    nonStrikerFours = 0;
    nonStrikerSixes = 0;

    currentOver = [];
    overHistory = [];
    ballHistory = [];
    dismissedBatsmen = [];

    document.getElementById("team_name").textContent = setup.team;
    const stickyTeam = document.getElementById("sticky_team_name");
    if (stickyTeam) {
        stickyTeam.textContent = setup.team;
    }

    updateScoreboard();
    enableButtons();
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
    if (run === 0) {
        strikerDots++;
    }

    if (run === 4) {
        strikerFours++;
    }

    if (run === 6) {
        strikerSixes++;
    }

    currentOver.push(run);

    ballHistory.push({
        type: "run",
        run: run
    });

    // Change strike for odd runs (1, 3, 5)
    if (run === 1 || run === 3 || run === 5) {
        changeStrike();
    }

    // Complete the over
    if (balls % 6 === 0) {

        finishOver();

        // =====================================
        // CHECK IF MATCH OVERS ARE COMPLETED
        // =====================================

        if (balls >= totalOvers * 6) {

            updateScoreboard();

            finishMatch();

            return;
        }

        // Only change strike when another over remains
        changeStrike();
    }

    updateScoreboard();
}


// ==============================
// Strike Change
// ==============================

function changeStrike() {

    let temp;

    // Name
    temp = strikerName;
    strikerName = nonStrikerName;
    nonStrikerName = temp;


    // Runs
    temp = strikerRuns;
    strikerRuns = nonStrikerRuns;
    nonStrikerRuns = temp;


    // Balls
    temp = strikerBalls;
    strikerBalls = nonStrikerBalls;
    nonStrikerBalls = temp;


    // DOT BALLS
    temp = strikerDots;
    strikerDots = nonStrikerDots;
    nonStrikerDots = temp;


    // Fours
    temp = strikerFours;
    strikerFours = nonStrikerFours;
    nonStrikerFours = temp;


    // Sixes
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

function renderDismissedBatsmen() {

    const batsmenHistoryEl = document.getElementById("batsmen_history");

    if (!batsmenHistoryEl) {
        return;
    }

    if (!dismissedBatsmen.length) {
        batsmenHistoryEl.innerHTML =
            '<p class="history-placeholder">Dismissed batsmen will appear here.</p>';
        return;
    }

    batsmenHistoryEl.innerHTML = dismissedBatsmen.map(item => {
        const runs = item.runs ?? 0;
        const balls = item.balls ?? 0;
        return `
            <div class="dismissed-item">
                <span class="dismissed-player">${item.player_name}</span>
                <span class="dismissed-score">${runs} (${balls})</span>
            </div>
        `;
    }).join("");
}

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

    renderDismissedBatsmen();
    updateCurrentOver();

    // Update sticky scoreboard if elements exist
    const stickyScore = document.getElementById("sticky_score");
    if (stickyScore) {
        stickyScore.innerHTML = totalRuns + " / " + wickets;
    }
    const stickyOvers = document.getElementById("sticky_overs");
    if (stickyOvers) {
        stickyOvers.innerHTML = over + " ov";
    }
    const stickyRunRate = document.getElementById("sticky_run_rate");
    if (stickyRunRate) {
        stickyRunRate.innerHTML = "RR: " + calculateRunRate();
    }
}

// ==============================
// Wicket
// ==============================

function wicket() {

    wickets++;
    balls++;

    strikerBalls++;
    strikerDots++;

    currentOver.push("W");

    // Save dismissed batsman BEFORE replacing him
    dismissedBatsmen.push({
        player_name: strikerName,
        runs: strikerRuns,
        balls: strikerBalls,
        dots: strikerDots,
        fours: strikerFours,
        sixes: strikerSixes,

        strike_rate:
            strikerBalls === 0
                ? 0
                : ((strikerRuns / strikerBalls) * 100).toFixed(2)
    });

    ballHistory.push({
        type: "wicket",
        batsman: strikerName
    });

    renderDismissedBatsmen();
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


    // Ask for new batsman
    let newPlayer = prompt("Enter New Batsman Name");

    if (newPlayer == null || newPlayer.trim() === "") {

        newPlayer = "Batsman " + (wickets + 2);
    }


    // Replace dismissed striker
    strikerName = newPlayer;

    strikerRuns = 0;
    strikerBalls = 0;
    strikerDots = 0;
    strikerFours = 0;
    strikerSixes = 0;


    // Complete over if wicket was 6th legal ball
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

    if (isNaN(run) || run < 0) {
        return;
    }

    totalRuns += run;
    balls++;

    // Batsman faced the delivery
    strikerBalls++;

    // No runs scored from the bat
    strikerDots++;

    currentOver.push(run + "B");

    ballHistory.push({
        type: "bye",
        run: run
    });

    if (run % 2 === 1) {
        changeStrike();
    }

    if (balls % 6 === 0) {

        finishOver();

        if (balls >= totalOvers * 6) {

            updateScoreboard();
            finishMatch();

            return;
        }

        changeStrike();
    }

    updateScoreboard();
}



// ==============================
// Leg Bye
// ==============================

function legBye() {

    let run = parseInt(prompt("Leg Bye Runs"));

    if (isNaN(run) || run < 0) {
        return;
    }

    totalRuns += run;
    balls++;

    // Batsman faced the delivery
    strikerBalls++;

    // No runs scored from the bat
    strikerDots++;

    currentOver.push(run + "LB");

    ballHistory.push({
        type: "legbye",
        run: run
    });

    if (run % 2 === 1) {
        changeStrike();
    }

    if (balls % 6 === 0) {

        finishOver();

        if (balls >= totalOvers * 6) {

            updateScoreboard();
            finishMatch();

            return;
        }

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
    // REOPEN COMPLETED OVER
    // =====================================

    if (currentOver.length === 0 && overHistory.length > 0) {

        const lastOver = overHistory.pop();

        currentOver = lastOver.balls
            ? [...lastOver.balls]
            : [];

        // Reverse end-of-over strike change
        changeStrike();

        refreshOverHistory();
    }


    // =====================================
    // NORMAL RUN
    // =====================================

    if (last.type === "run") {

        // Reverse strike for odd runs
        if (last.run === 1 || last.run === 3) {
            changeStrike();
        }

        totalRuns -= last.run;
        balls--;

        strikerRuns -= last.run;
        strikerBalls--;


        // Undo Dot Ball
        if (last.run === 0) {
            strikerDots--;
        }


        // Undo Four
        if (last.run === 4) {
            strikerFours--;
        }


        // Undo Six
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


        const dismissedPlayer = dismissedBatsmen.pop();


        if (dismissedPlayer) {

            // Restore dismissed batsman
            strikerName = dismissedPlayer.player_name;

            strikerRuns = dismissedPlayer.runs;

            // Remove wicket delivery from balls faced
            strikerBalls = Math.max(
                0,
                dismissedPlayer.balls - 1
            );

            // Remove wicket delivery from dots
            strikerDots = Math.max(
                0,
                (dismissedPlayer.dots || 0) - 1
            );

            strikerFours = dismissedPlayer.fours;

            strikerSixes = dismissedPlayer.sixes;

        } else {

            // Safety fallback
            strikerName = last.batsman;

            strikerRuns = 0;
            strikerBalls = 0;
            strikerDots = 0;
            strikerFours = 0;
            strikerSixes = 0;
        }


        currentOver.pop();
    }


    // =====================================
    // WIDE
    // =====================================

    else if (last.type === "wide") {

        totalRuns--;

        // Wide is not a legal delivery
        currentOver.pop();
    }


    // =====================================
    // NO BALL
    // =====================================

    else if (last.type === "noball") {

        // Reverse strike change
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


        currentOver.pop();
    }


    // =====================================
    // BYE
    // =====================================

    else if (last.type === "bye") {

        // Reverse strike for odd bye runs
        if (last.run % 2 === 1) {
            changeStrike();
        }

        totalRuns -= last.run;

        balls--;

        strikerBalls--;

        // Undo dot ball
        strikerDots--;

        currentOver.pop();
    }


    // =====================================
    // LEG BYE
    // =====================================

    else if (last.type === "legbye") {

        // Reverse strike for odd leg-bye runs
        if (last.run % 2 === 1) {
            changeStrike();
        }

        totalRuns -= last.run;

        balls--;

        strikerBalls--;

        // Undo dot ball
        strikerDots--;

        currentOver.pop();
    }


    // =====================================
    // SAFETY CHECKS
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

    if (strikerRuns < 0) {
        strikerRuns = 0;
    }

    if (strikerBalls < 0) {
        strikerBalls = 0;
    }

    if (strikerDots < 0) {
        strikerDots = 0;
    }

    if (strikerFours < 0) {
        strikerFours = 0;
    }

    if (strikerSixes < 0) {
        strikerSixes = 0;
    }


    // =====================================
    // REFRESH SCREEN
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

    const historyDiv = document.getElementById("over_history");

    historyDiv.innerHTML = "";

    if (overHistory.length === 0) {
        historyDiv.innerHTML =
            '<p class="history-placeholder">No completed overs yet</p>';
        return;
    }

    overHistory.forEach((over, index) => {

        let ballsHTML = "";

        // over.balls is now an ARRAY
        const overBalls = Array.isArray(over.balls)
            ? over.balls
            : [];

        overBalls.forEach(ball => {

            let ballClass = "over-ball";

            if (String(ball) === "W") {
                ballClass += " wicket-ball";
            }
            else if (String(ball) === "4") {
                ballClass += " four";
            }
            else if (String(ball) === "6") {
                ballClass += " six";
            }
            else if (String(ball).toLowerCase().includes("wd")) {
                ballClass += " extra-ball";
            }
            else if (String(ball).toLowerCase().includes("nb")) {
                ballClass += " extra-ball";
            }

            ballsHTML += `
                <span class="${ballClass}">
                    ${ball}
                </span>
            `;
        });

        historyDiv.innerHTML += `
            <div class="over-item">

                <div class="over-row">

                    <strong class="over-number">
                        Over ${index + 1}
                    </strong>

                    <div class="over-balls">
                        ${ballsHTML}
                    </div>

                    <strong class="over-score">
                        ${over.score}/${over.wickets}
                    </strong>

                </div>

            </div>
        `;
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

            // =====================================
            // DISMISSED BATSMEN
            // =====================================

            ...dismissedBatsmen,


            // =====================================
            // CURRENT STRIKER
            // =====================================

            {

                player_name: strikerName,

                runs: strikerRuns,

                balls: strikerBalls,

                dots: strikerDots,

                fours: strikerFours,

                sixes: strikerSixes,

                strike_rate:
                    strikerBalls === 0
                        ? 0
                        : ((strikerRuns / strikerBalls) * 100).toFixed(2)

            },


            // =====================================
            // CURRENT NON-STRIKER
            // =====================================

            {

                player_name: nonStrikerName,

                runs: nonStrikerRuns,

                balls: nonStrikerBalls,

                dots: nonStrikerDots,

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

    }

    catch (error) {

        console.log(error);

    }

}



// ==============================
// Finish Match
// ==============================

async function finishMatch() {

    disableButtons();

    await saveMatch();

    const goToHistory = confirm("📊 Open Match History?");

    if (goToHistory) {
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

document.addEventListener("DOMContentLoaded", function () {
    initializeScorePage();

    // Add sticky scorebar scroll listener
    const scorePage = document.getElementById("score");
    if (scorePage) {
        window.addEventListener('scroll', function() {
            const mainScoreboard = document.querySelector('.scoreboard-card');
            const stickyBar = document.getElementById('sticky_score_bar');
            if (mainScoreboard && stickyBar) {
                const scoreboardBottom = mainScoreboard.getBoundingClientRect().bottom;
                // Show sticky bar when the main scoreboard starts to scroll out of view (using 60px as buffer)
                if (scoreboardBottom < 60) {
                    stickyBar.classList.add('visible');
                } else {
                    stickyBar.classList.remove('visible');
                }
            }
        });
    }
});

console.log("🏏 Cricket Score Tracker Loaded Successfully");