const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Store game states
const games = {};

// Socket.io connection
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // Join a game room
  socket.on("joinGame", (gameId) => {
    socket.join(gameId);

    // Initialize game state if it doesn't exist
    if (!games[gameId]) {
      games[gameId] = {
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
      };
    }

    // Send the current game state to the player
    socket.emit("gameState", games[gameId]);

    // Notify other players in the room
    socket.to(gameId).emit("gameState", games[gameId]);
  });

  // Handle player moves
  socket.on("makeMove", (gameId, index) => {
    const game = games[gameId];

    // Check if the move is valid
    if (!game.winner && game.board[index] === null) {
      game.board[index] = game.currentPlayer;

      // Check for a winner
      game.winner = checkWinner(game.board);

      // Switch players
      game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";

      // Broadcast the updated game state
      io.to(gameId).emit("gameState", game);
    }
  });

  // Handle restart game
  socket.on("restartGame", (gameId) => {
    if (games[gameId]) {
      // Reset game state
      games[gameId] = {
        board: Array(9).fill(null),
        currentPlayer: "X",
        winner: null,
      };

      // Broadcast the reset game state to all players in the room
      io.to(gameId).emit("gameState", games[gameId]);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

// Check for a winner
function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) {
    return "draw";
  }

  return null;
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
