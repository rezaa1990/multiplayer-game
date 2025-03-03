const socket = io();
const gameId = "game1"; // Unique game ID

// DOM elements
const cells = document.querySelectorAll(".cell");
const statusDiv = document.getElementById("status");
const restartButton = document.getElementById("restartButton");

// Join the game
socket.emit("joinGame", gameId);

// Handle game state updates
socket.on("gameState", (gameState) => {
  updateBoard(gameState.board);
  updateStatus(gameState);
});

// Update the board
function updateBoard(board) {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
  });
}

// Update the game status
function updateStatus(gameState) {
  if (gameState.winner) {
    statusDiv.textContent =
      gameState.winner === "draw"
        ? "مساوی!"
        : `بازیکن ${gameState.winner} برنده شد!`;
  } else {
    statusDiv.textContent = `نوبت بازیکن: ${gameState.currentPlayer}`;
  }
}

// Handle cell clicks
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = cell.getAttribute("data-index");
    socket.emit("makeMove", gameId, parseInt(index));
  });
});

// Handle restart button click
restartButton.addEventListener("click", () => {
  socket.emit("restartGame", gameId);
});
