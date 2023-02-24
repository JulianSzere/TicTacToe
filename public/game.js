let currentPlayer = "cross";
let lastSubCell = null;
let currentHighlightedCell;
let previousCell;


function handleClick(subCell) {
    //const cell = subCell.parentNode;

    subCell.markedBy = currentPlayer;
    if (currentPlayer === "circle") {
        subCell.classList.add("circle");
        currentPlayer = "cross";
    } else {
        subCell.classList.add("cross");
        currentPlayer = "circle";
    }
    lastSubCell = subCell;


    // // Change color of the cell that can be clicked
    // nextCell = cells[lastSubCell.getAttribute('subCellPosition')];
    // highlightCell(nextCell);

    // // Checks for win in a sub-cell
    // winnerOfCell = checkForWin(cell.getElementsByClassName("sub-cell"));
    // if (winnerOfCell) {
    //     cell.markedBy = winnerOfCell;
    //     drawWinnerOfCell(cell, winnerOfCell);
    // } 

    // // Checks for win in the whole grid
    // winner = checkForWin(cells);
    // if (winner) {
    //     // grid.classList.add('win-dash')
    //     console.log(winner)
    // }
  }


function canClick(subCells, cells, subCell) {
    // Free turn
    if (lastSubCell == null) {
        return true;
    }

    let nextCell = cells[lastSubCell.getAttribute('subCellPosition')];
    let nextCellPosition = nextCell.getAttribute('cellPosition');
    let currentCell = cells[subCell.getAttribute('cellPosition')];
    let currentCellPosition = currentCell.getAttribute('cellPosition');
    lastSubCell = subCell;

    // Marked but obligatory cell
    if ((nextCell.markedBy != null || areAllSubCellsMarked(subCells, nextCell)) && currentCellPosition != nextCellPosition) {
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

function areAllSubCellsMarked(subCells, nextCell) {
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




module.exports = { canClick }
