const socket = io();
const gameId = "game1"; // Unique game ID

// Join the game
socket.emit("joinGame", gameId);

// DOM elements
const cells = document.querySelectorAll(".cell");
const statusDiv = document.getElementById("status");

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
        ? "It's a draw!"
        : `Player ${gameState.winner} wins!`;
  } else {
    statusDiv.textContent = `Current Player: ${gameState.currentPlayer}`;
  }
}

// Handle cell clicks
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    const index = cell.getAttribute("data-index");
    socket.emit("makeMove", gameId, parseInt(index));
  });
});
