const board = document.getElementById("chessboard");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const modeSelect = document.getElementById("mode");
const diffLabel = document.getElementById("diffLabel");
const difficultySelect = document.getElementById("difficulty");
const colorLabel = document.getElementById("colorLabel");
const playerColorSelect = document.getElementById("playerColor");
const overlay = document.getElementById("gameOverOverlay");
const winnerText = document.getElementById("winnerText");
const playAgainBtn = document.getElementById("playAgainBtn");

let squares = [];
let selectedSquare = null;
let currentPlayer = "white";
let mode = "pvp";
let playerColor = "white";
let gameOver = false;

const pieces = {
  white: {
    king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙",
  },
  black: {
    king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟︎",
  },
};

function createBoard() {
  board.innerHTML = "";
  squares = [];
  gameOver = false;
  overlay.classList.add("hidden");

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      square.dataset.row = row;
      square.dataset.col = col;
      square.addEventListener("click", onSquareClick);
      board.appendChild(square);
      squares.push(square);
    }
  }
}

function getSquare(row, col) {
  return squares.find(sq => parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col);
}

function setupPieces() {
  for (const sq of squares) sq.textContent = "";
  const layout = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

  for (let c = 0; c < 8; c++) {
    getSquare(0, c).textContent = pieces.black[layout[c]];
    getSquare(1, c).textContent = pieces.black.pawn;
    getSquare(6, c).textContent = pieces.white.pawn;
    getSquare(7, c).textContent = pieces.white[layout[c]];
  }
}

function onSquareClick(e) {
  if (gameOver) return;
  const square = e.target;

  if (selectedSquare) {
    movePiece(square);
  } else if (square.textContent) {
    if (
      (currentPlayer === "white" && isWhitePiece(square.textContent)) ||
      (currentPlayer === "black" && isBlackPiece(square.textContent))
    ) {
      selectedSquare = square;
      square.classList.add("selected");
    }
  }
}

function showGameOverScreen(text, color = "#f87171") {
  winnerText.textContent = text;
  winnerText.style.color = color;
  overlay.classList.remove("hidden");
  overlay.classList.add("show");
  gameOver = true;
}

function movePiece(targetSquare) {
  if (!selectedSquare || gameOver) return;

  const piece = selectedSquare.textContent;
  const startRow = parseInt(selectedSquare.dataset.row);
  const startCol = parseInt(selectedSquare.dataset.col);
  const endRow = parseInt(targetSquare.dataset.row);
  const endCol = parseInt(targetSquare.dataset.col);

  if ((isWhitePiece(piece) && isWhitePiece(targetSquare.textContent)) ||
      (isBlackPiece(piece) && isBlackPiece(targetSquare.textContent))) {
    selectedSquare.classList.remove("selected");
    selectedSquare = null;
    return;
  }

  if (!isValidMove(piece, startRow, startCol, endRow, endCol)) {
    selectedSquare.classList.remove("selected");
    selectedSquare = null;
    return;
  }

  const backup = targetSquare.textContent;
  targetSquare.textContent = piece;
  selectedSquare.textContent = "";

  if (isKingInCheck(currentPlayer)) {
    selectedSquare.textContent = piece;
    targetSquare.textContent = backup;
    selectedSquare.classList.remove("selected");
    selectedSquare = null;
    return;
  }

  selectedSquare.classList.remove("selected");
  selectedSquare = null;
  currentPlayer = currentPlayer === "white" ? "black" : "white";

  if (isKingInCheckmate(currentPlayer)) {
    showGameOverScreen(`${capitalize(currentPlayer === "white" ? "Black" : "White")} Wins!`);
    return;
  }

  if (!hasAnyLegalMove(currentPlayer)) {
    if (isKingInCheck(currentPlayer)) {
      showGameOverScreen(`${capitalize(currentPlayer === "white" ? "Black" : "White")} Wins!`);
    } else {
      showGameOverScreen("Game Over! Draw (Stalemate)", "#fbbf24");
    }
    return;
  }

  statusEl.textContent = `${capitalize(currentPlayer)}'s Turn${isKingInCheck(currentPlayer) ? " (Check!)" : ""}`;
}

function isKingInCheckmate(color) {
  if (!isKingInCheck(color)) return false;

  for (const sq of squares) {
    const p = sq.textContent;
    if (!p) continue;
    if ((color === "white" && isWhitePiece(p)) || (color === "black" && isBlackPiece(p))) {
      const sr = parseInt(sq.dataset.row);
      const sc = parseInt(sq.dataset.col);
      for (const target of squares) {
        const tr = parseInt(target.dataset.row);
        const tc = parseInt(target.dataset.col);
        if ((isWhitePiece(p) && isWhitePiece(target.textContent)) ||
            (isBlackPiece(p) && isBlackPiece(target.textContent))) continue;
        if (isValidMove(p, sr, sc, tr, tc)) {
          const backupFrom = sq.textContent;
          const backupTo = target.textContent;
          target.textContent = p;
          sq.textContent = "";
          const stillInCheck = isKingInCheck(color);
          sq.textContent = backupFrom;
          target.textContent = backupTo;
          if (!stillInCheck) return false;
        }
      }
    }
  }
  return true;
}

/* ✅ Supporting Logic */
function hasAnyLegalMove(color) {
  for (const sq of squares) {
    const p = sq.textContent;
    if (!p) continue;
    if ((color === "white" && isWhitePiece(p)) || (color === "black" && isBlackPiece(p))) {
      const sr = parseInt(sq.dataset.row);
      const sc = parseInt(sq.dataset.col);
      for (const target of squares) {
        const tr = parseInt(target.dataset.row);
        const tc = parseInt(target.dataset.col);
        if ((isWhitePiece(p) && isWhitePiece(target.textContent)) ||
            (isBlackPiece(p) && isBlackPiece(target.textContent))) continue;
        if (isValidMove(p, sr, sc, tr, tc)) {
          const backupFrom = sq.textContent;
          const backupTo = target.textContent;
          target.textContent = p;
          sq.textContent = "";
          const stillInCheck = isKingInCheck(color);
          sq.textContent = backupFrom;
          target.textContent = backupTo;
          if (!stillInCheck) return true;
        }
      }
    }
  }
  return false;
}

function isValidMove(piece, sr, sc, er, ec) {
  const dR = er - sr, dC = ec - sc, aR = Math.abs(dR), aC = Math.abs(dC);
  const isW = isWhitePiece(piece);
  const dir = isW ? -1 : 1;

  if (piece === pieces.white.pawn || piece === pieces.black.pawn) {
    const startRank = isW ? 6 : 1;
    const forward = getSquare(er, ec);
    if (dC === 0 && dR === dir && forward.textContent === "") return true;
    if (dC === 0 && sr === startRank && dR === 2 * dir &&
        forward.textContent === "" && getSquare(sr + dir, sc).textContent === "") return true;
    if (aC === 1 && dR === dir && forward.textContent !== "" &&
        ((isW && isBlackPiece(forward.textContent)) || (!isW && isWhitePiece(forward.textContent)))) return true;
    return false;
  }

  if (piece === pieces.white.rook || piece === pieces.black.rook)
    return (dR === 0 || dC === 0) && pathClear(sr, sc, er, ec);

  if (piece === pieces.white.bishop || piece === pieces.black.bishop)
    return aR === aC && pathClear(sr, sc, er, ec);

  if (piece === pieces.white.queen || piece === pieces.black.queen)
    return (dR === 0 || dC === 0 || aR === aC) && pathClear(sr, sc, er, ec);

  if (piece === pieces.white.knight || piece === pieces.black.knight)
    return (aR === 2 && aC === 1) || (aR === 1 && aC === 2);

  if (piece === pieces.white.king || piece === pieces.black.king)
    return aR <= 1 && aC <= 1;

  return false;
}

function pathClear(sr, sc, er, ec) {
  const stepR = Math.sign(er - sr);
  const stepC = Math.sign(ec - sc);
  let r = sr + stepR, c = sc + stepC;
  while (r !== er || c !== ec) {
    if (getSquare(r, c).textContent !== "") return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

function isKingInCheck(color) {
  const kingSymbol = color === "white" ? pieces.white.king : pieces.black.king;
  const kingSq = squares.find(sq => sq.textContent === kingSymbol);
  if (!kingSq) return false;
  const row = parseInt(kingSq.dataset.row);
  const col = parseInt(kingSq.dataset.col);
  for (const sq of squares) {
    const p = sq.textContent;
    if (!p) continue;
    if ((color === "white" && isBlackPiece(p)) || (color === "black" && isWhitePiece(p))) {
      const sr = parseInt(sq.dataset.row);
      const sc = parseInt(sq.dataset.col);
      if (isValidMove(p, sr, sc, row, col)) return true;
    }
  }
  return false;
}

function isWhitePiece(s) {
  return Object.values(pieces.white).includes(s);
}
function isBlackPiece(s) {
  return Object.values(pieces.black).includes(s);
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

restartBtn.addEventListener("click", () => {
  currentPlayer = "white";
  selectedSquare = null;
  createBoard();
  setupPieces();
  statusEl.textContent = "White's Turn";
});

playAgainBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  restartBtn.click();
});

modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;
  restartBtn.click();
});

playerColorSelect.addEventListener("change", () => {
  playerColor = playerColorSelect.value;
  restartBtn.click();
});

createBoard();
setupPieces();
