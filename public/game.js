const socket = io();
// localStorage.clear();
let mode = null;
let locked = false;
let roomId = "";
let score = localStorage.getItem("score") || 0;

document.getElementById("score").innerText = score;
setStatus("👉 Please choose a mode to start");

function setMode(m) {
    mode = m;
    resetUI();

    if (m === "player") {
        roomId = prompt("Enter Room ID:");
        socket.emit("join-room", roomId);
        setStatus("Waiting for opponent...");
    } else {
        setStatus("Playing with Computer");
    }
}

socket.on("joined", () => {
    setStatus("Joined room. Waiting...");
});

socket.on("start-game", () => {
    setStatus("Game Started! Make your move");
});

socket.on("result", ({ you, opp }) => {
    showPick("oppPicked", opp);
    decide(you, opp);
    locked = false;
});

function play(choice) {
    if (!mode) {
        setStatus("⚠️ Please choose a mode first");
        return;
    }

    if (locked) {
        return;
    }
    locked = true;

    clearCircles();
    showPick("youPicked", choice);

    if (mode === "computer") {
        const options = ["rock", "paper", "scissors", "lizard", "spock"];
        const comp = options[Math.floor(Math.random() * options.length)];
        showPick("oppPicked", comp);
        decide(choice, comp);
        locked = false;
    } else {
        setStatus("Waiting for opponent...");
        socket.emit("pick", { roomId, choice });
    }
}

function decide(a, b) {
    const rules = {
        rock: ["scissors", "lizard"],
        paper: ["rock", "spock"],
        scissors: ["paper", "lizard"],
        lizard: ["paper", "spock"],
        spock: ["rock", "scissors"]
    };

    if (a === b) {
        color("draw");
        setStatus("🤝 DRAW");
    }
    else if (rules[a].includes(b)) {
        score++;
        localStorage.setItem("score", score);
        document.getElementById("score").innerText = score;

        color("win");
        setStatus("🎉 YOU WIN");
    }
    else {
        color("lose");
        setStatus("❌ YOU LOSE");
    }
}

function showPick(id, choice) {
    document.getElementById(id).innerHTML =
        `<img src="images/icon-${choice}.svg" width="60">`;
}

function color(res) {
    const you = document.getElementById("youPicked");
    const opp = document.getElementById("oppPicked");

    you.classList.add(res);
    opp.classList.add(res === "win" ? "lose" : res === "lose" ? "win" : "draw");
}

function clearCircles() {
    ["youPicked", "oppPicked"].forEach(id => {
        const el = document.getElementById(id);
        el.className = "circle";
        el.innerHTML = "";
    });
}

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}

function resetUI() {
    clearCircles();
    locked = false;
}

function resetScore() {
    score = 0;
    localStorage.setItem("score", score);
    document.getElementById("score").innerText = score;
}
