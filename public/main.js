//import {handleClick} from 'game.js';
let currentPlayer;
let currentTurn = 'cross';
let previousCell;
const cells = document.querySelectorAll(".cell");
const subCells = document.querySelectorAll(".sub-cell");
const grid = document.getElementById('grid');
const socket = io('ws://localhost:5500');


// Create the grids with its cells and sub-cells

let subCellId = 0;
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.cellPosition = i;
    cell.markedBy = null;
    for (let j = 0; j < 9; j++) {
        const subCell = document.createElement('div');
        subCell.classList.add('sub-cell');
        subCell.cellPosition = i;
        subCell.subCellPosition = j;
        subCell.markedBy = null;
        subCell.id = subCellId;
        cell.appendChild(subCell);

        subCellId+=1;
    }
    grid.appendChild(cell);
}



//var socket = io('http://192.168.1.213:5500');
socket.on('connect', () => {
  socket.emit('serverStart', subCells, cells);
});

socket.on('assignPlayer', (player) => {
  console.log(player)
  currentPlayer = player;
});

socket.on('validMove', (subCellId, markedBy) => {
  const subCell = document.getElementById(subCellId);
  drawSymbol(subCell, markedBy);
});

socket.on('cellWon', (cellId, winnerOfCell) => {
  const cell = cells[cellId];
  cell.markedBy = winnerOfCell;
  drawWinnerOfCell(cell, winnerOfCell);
})

socket.on('gameOver', winner => {
  console.log(winner);
})


// listen for the 'opponentDisconnected' event
// socket.on('opponentDisconnected', () => {
//   console.log(`Your opponent has disconnected from the room.`);
// });



subCells.forEach(subCell => {
  subCell.addEventListener("click", sendClick);
});

function sendClick(event) {
  if (currentPlayer == currentTurn) {
    const subCell = event.target;
    socket.emit('cellClicked', subCell.id);
  }
}

// game.js
function drawSymbol(subCell, markedBy) {
  const cell = cells[subCell.cellPosition];

  subCell.markedBy = markedBy;
  if (markedBy === "circle") {
      subCell.classList.add("circle");
      currentTurn = 'cross';
  } else {
      subCell.classList.add("cross");
      currentTurn = 'circle';
  }
  lastSubCell = subCell;


  // Change color of the cell that can be clicked
  highlightCell(cells[lastSubCell.subCellPosition]);
}

function highlightCell(nextCell) {
  // If the move is not valid, don't highlight it 
  if (nextCell.markedBy != null) {
      previousCell.style.backgroundColor = '#eee';
      return
  }

  // If a previous cell was highlighted, reset its background color
  else if (previousCell) {
      previousCell.style.backgroundColor = '#eee';
  }

  // Set the new cell's background color
  nextCell.style.backgroundColor = 'rgb(225, 255, 225)';

  // Update the previous cell variable
  previousCell = nextCell;
}

function drawWinnerOfCell(cell, winner) {
  if (winner === 'circle') {
      cell.classList.add('win-circle');
    } else if (winner === 'cross') {
      cell.classList.add('win-cross');
    }
    // Remove the sub-cells
    let subCells = cell.querySelectorAll(".sub-cell");
    for (let i = 0; i < subCells.length; i++) {
      subCells[i].remove();
    }
}
