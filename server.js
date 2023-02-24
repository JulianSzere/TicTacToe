//const game = require('./public/game.js');

let crossPlayer;
let lastSubCell = null;
let currentCell;
let nextCell;

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: '*' }
});
const cors = require('cors');

// Serve the client files
app.use(express.static(__dirname + '/public'));
// Enable CORS
//app.use(cors({ origin: '*' }));
  
const rooms = {};
let roomId = 0;

let subCells;
let cells;


// Start the server
const port = 5500;
// server.listen(port, '192.168.1.213')
// console.log('Server listening on port', port)
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

io.on('connection', (socket) => {
    joinRoom(socket);
    
    socket.on('serverStart', (sCs, cs) => {
        console.log('server started')
        subCells = sCs;
        cells = cs;
    });

    socket.on('cellClicked', (subCellId) => {
        // Handle the event and update the game state
        let currentSubCell = subCells[subCellId];
        currentCell = cells[currentSubCell.cellPosition];
        console.log("Cell clicked: ", currentSubCell);
        if (canClick(currentSubCell)) {
            lastSubCell = currentSubCell;
            currentSubCell.markedBy = currentPlayer;
            io.emit('validMove', subCellId, currentPlayer);
            checkForWinInCell(currentCell);
            if (checkForWin(cells)) {
                io.emit('gameOver', winner);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('A player has disconnected:', socket.id);
        Object.keys(rooms).forEach(roomId => {
            if (rooms[roomId].players[socket.id]) {
              delete rooms[roomId].players[socket.id];
              socket.to(roomId).emit('player-disconnected');
            }
        })
    });
});



function joinRoom(socket) {
  // Check if there are any existing rooms with less than two players
  let foundRoom = false;
  for (let room in rooms) {
    if (rooms[room].players.length < 2) {
      foundRoom = true;
      rooms[room].players.push({ id: socket.id, symbol: rooms[room].players.length === 0 ? 'cross' : 'circle' });
      socket.join(room);
      console.log('User', socket.id, 'connected to room', roomId)
      break;
    }
  }

  // If no existing room with less than two players was found, create a new room
  if (!foundRoom) {
    roomId++;
    rooms[roomId] = { players: [{ id: socket.id, symbol: 'cross' }] };
    socket.join(roomId);
  }
}




// game.js
function canClick(currentSubCell) {
    // Free turn
    if (lastSubCell == null) {
        return true;
    }

    nextCell = Object.values(cells).find(cell => cell.cellPosition == lastSubCell.subCellPosition);

    // Marked but obligatory cell. 
    // True if the next cell is marked or all of the sub-cells of the next cell are marked (so the next cell is invalid)
    if ((nextCell.markedBy != null || areAllSubCellsMarked(nextCell))) {
        return true;
    }

    // True if the current cell is the next cell
    if (nextCell.cellPosition == currentCell.cellPosition) {
        // and the sub-cell and cell you want to click is not already marked
        if (currentSubCell.markedBy == null && currentCell.markedBy == null) {
            return true;
        }
    }
}

function areAllSubCellsMarked(nextCell) {
    let nextSubCells = Object.values(subCells).filter(subCell => subCell.cellPosition === nextCell.cellPosition);
    for (let nextSubCell of nextSubCells) {
      if (nextSubCell.markedBy == null) {
        return false;
      }
    }
    return true;
}

function checkForWinInCell(currentCell) {
    // Checks for win of sub-cells
    let currentSubCells = Object.values(subCells).filter(subCell => subCell.cellPosition == currentCell.cellPosition);
    let winnerOfCell = checkForWin(currentSubCells);
    if (winnerOfCell) {
        currentCell.markedBy = winnerOfCell;
        io.emit('cellWon', currentCell.cellPosition, winnerOfCell);
    } 
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
