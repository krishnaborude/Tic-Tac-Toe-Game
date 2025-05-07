const playWithAIButton = document.getElementById("playWithAI");
const playWithPlayerButton = document.getElementById("playWithPlayer");
const gameModeSection = document.getElementById("game-mode");
const gameBoard = document.getElementById("gameBoard");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");

let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let gameMode = null; // Can be "AI" or "Player"

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

playWithAIButton.addEventListener("click", () => {
  startGame("AI");
});

playWithPlayerButton.addEventListener("click", () => {
  startGame("Player");
});

function startGame(mode) {
  gameModeSection.classList.add("d-none"); // Hide the mode selection
  gameBoard.classList.remove("d-none"); // Show the game board
  resetBtn.classList.remove("d-none"); // Show reset button
  statusText.classList.remove("d-none"); // Show status text

  gameMode = mode;
  currentPlayer = "X"; // Player X always starts
  createBoard();
}

function createBoard() {
  gameBoard.innerHTML = ""; // Clear the board
  gameState.forEach((cell, index) => {
    const cellDiv = document.createElement("div");
    cellDiv.classList.add("cell");
    cellDiv.dataset.index = index;
    cellDiv.textContent = cell;
    cellDiv.addEventListener("click", handleCellClick);
    gameBoard.appendChild(cellDiv); // Append each cell to the board
  });
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (gameState[index] !== "" || !isGameActive || currentPlayer !== "X") return;

  // Player makes a move
  gameState[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add(currentPlayer);
  checkResult();

  if (isGameActive && gameMode === "AI") {
    // AI's turn
    currentPlayer = "O";
    setTimeout(() => aiMove(), 500); // Add a delay for the AI to make its move
  } else if (isGameActive) {
    currentPlayer = "O"; // Change turn to AI or player
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function aiMove() {
  const bestMove = minimax(gameState, "O");
  gameState[bestMove.index] = "O";

  // Update the UI
  const cell = document.querySelector(`[data-index="${bestMove.index}"]`);
  cell.textContent = "O";
  cell.classList.add("O");

  checkResult();
}

function minimax(board, player) {
  const availableCells = board
    .map((cell, index) => (cell === "" ? index : null))
    .filter((index) => index !== null);

  if (checkWinner(board, "X")) return { score: -1 }; // Player wins
  if (checkWinner(board, "O")) return { score: 1 };  // AI wins
  if (availableCells.length === 0) return { score: 0 }; // Draw

  const moves = [];
  for (let i = 0; i < availableCells.length; i++) {
    const move = {};
    move.index = availableCells[i];
    board[availableCells[i]] = player;

    if (player === "O") {
      const result = minimax(board, "X");
      move.score = result.score;
    } else {
      const result = minimax(board, "O");
      move.score = result.score;
    }

    board[availableCells[i]] = ""; // Undo the move
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }

  return bestMove;
}

function checkWinner(board, player) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

function checkResult() {
  let roundWon = false;
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      roundWon = true;

      // Highlight winning cells
      const cells = document.querySelectorAll(".cell");
      cells[a].classList.add("win");
      cells[b].classList.add("win");
      cells[c].classList.add("win");

      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `🎉 Player ${currentPlayer} wins!`;
    statusText.classList.add("text-success");
    isGameActive = false;
    return;
  }

  if (!gameState.includes("")) {
    statusText.textContent = "😐 It's a draw!";
    statusText.classList.add("text-warning");
    isGameActive = false;
    return;
  }

  // Switch turns
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

resetBtn.addEventListener("click", () => {
  gameState = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  currentPlayer = "X";
  createBoard();
  statusText.className = "";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
});
