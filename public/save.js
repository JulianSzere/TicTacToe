let currentPlayer = "cross";
let lastSubCell = null;
let nextCell = null;
let currentHighlightedCell;
let previousCell;

var socket = io('http://localhost:5500');
socket.on('cellClicked', (data) => {
    // Do something with the data received from the server
  });

// Create the grids with its cells and sub-cells
const grid = document.getElementById('grid');
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('cellPosition', i)
    cell.setAttribute('markedBy', null);
    for (let j = 0; j < 9; j++) {
        const subCell = document.createElement('div');
        subCell.classList.add('sub-cell');
        subCell.setAttribute('cellPosition', i); 
        subCell.setAttribute('subCellPosition', j);
        subCell.setAttribute('markedBy', null);
        cell.appendChild(subCell);
    }
    grid.appendChild(cell);
}

const subCells = document.querySelectorAll(".sub-cell");
const cells = document.querySelectorAll(".cell");
subCells.forEach(subCell => {
  subCell.addEventListener("click", handleClick);
});

function handleClick(event) {
    const subCell = event.target;
    const cell = cells[subCell.getAttribute('cellPosition')];

    if (canClick(lastSubCell, subCell, cell, nextCell)) {
        // If it is not already marked
        subCell.markedBy = currentPlayer;
        // Server
        socket.emit('cellClicked', subCell.getAttribute('subCellPosition'), subCell.getAttribute('cellPosition'), subCell.markedBy);
        if (currentPlayer === "circle") {
            subCell.classList.add("circle");
            currentPlayer = "cross";
        } else {
            subCell.classList.add("cross");
            currentPlayer = "circle";
        }
        lastSubCell = subCell;
    }


    // Change color of the cell that can be clicked
    nextCell = cells[lastSubCell.getAttribute('subCellPosition')];
    highlightCell(nextCell);

    // Checks for win in a sub-cell
    winnerOfCell = checkForWin(cell.getElementsByClassName("sub-cell"));
    if (winnerOfCell) {
        cell.markedBy = winnerOfCell;
        drawWinnerOfCell(cell, winnerOfCell);
    } 

    // Checks for win in the whole grid
    winner = checkForWin(cells);
    if (winner) {
        // grid.classList.add('win-dash')
        console.log(winner)
    }
  }


function canClick(lastSubCell, subCell, cell, nextCell) {
    // Free turn
    if (lastSubCell == null) {
        return true;
    }

    let nextCellPosition = nextCell.getAttribute('cellPosition');
    let currentCellPosition = cell.getAttribute('cellPosition');
    
    // Marked but obligatory cell
    if ((nextCell.markedBy != null || areAllSubCellsMarked(nextCell)) && currentCellPosition != nextCellPosition) {
        return true;
    }

    let validCell = false;
    if (nextCellPosition == currentCellPosition) {
        validCell = true;
    }

    if (subCell.markedBy == null && cell.markedBy == null && validCell) {
        return true;
    }
}

function areAllSubCellsMarked(nextCell) {
    let subCells = nextCell.querySelectorAll('.sub-cell');
    for (let subCell of subCells) {
      if (subCell.getAttribute('markedBy') == null) {
        return true;
      }
      else {
        return false;
      }
    }
  }
  

function highlightCell(nextCell) {

    // If the move is not valid, don't highlight it 
    if (nextCell.markedBy != null) {
        previousCell.style.backgroundColor = '#eee';
        return
    }

    // If a previous cell was highlighted, reset its background color
    if (previousCell) {
        previousCell.style.backgroundColor = '#eee';
    }

    // Set the new cell's background color
    nextCell.style.backgroundColor = 'rgb(225, 255, 225)';

    // Update the previous cell variable
    previousCell = nextCell;
}


function checkForWin(cells) {
    const winningCombinations = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let i = 0; i < winningCombinations.length; i++) {
        let combination = winningCombinations[i];
        if (cells[combination[0]].markedBy != null && 
            cells[combination[0]].markedBy == cells[combination[1]].markedBy &&
            cells[combination[1]].markedBy == cells[combination[2]].markedBy) {
                // Cell won
                //drawDash(cells, combination)
                return cells[combination[0]].markedBy;
        }
    }
    return false;
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

function drawDash(cells, winningCombination) {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    const start = cells[winningCombination[0]];
    const end = cells[winningCombination[2]];
    
    const startCoordinates = start.getBoundingClientRect();
    const endCoordinates = end.getBoundingClientRect();

    // Set the starting point
    ctx.moveTo(startCoordinates.x, startCoordinates.y);

    // Draw the line
    ctx.lineTo(endCoordinates.x, endCoordinates.y);

    // Set the style of the line
    ctx.strokeStyle = "black";

    // Draw the line on the canvas
    ctx.stroke();
}

