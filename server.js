const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const socket = socketIO(server);
server.listen(PORT, function() {
  console.log(`Servidor rodando na porta ${PORT}`);
});

combinations =[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
clientsOrder = [];
symbols = ["O","X"];
totalCellsMarked = [];
plays = 1
PlayerCellsMarked={}
qntWinsO = 0
qntWinsX = 0
socket.on('connection', function(clientSocket) {
  PlayerCellsMarked[clientSocket.id] = [];
  clientsOrder.push(clientSocket);
  resetQntWins()
  resetCellsMarked();
  clearData();
  resetMarksPosition()
  playersConnected();
  assignSymbol();
  clientSocket.on('disconnect',function(){
    const disconnectedIndex = clientsOrder.indexOf(clientSocket);
    plays = 1
    if (disconnectedIndex !== -1) {
      clientsOrder.splice(disconnectedIndex, 1);
    }
  })
  clientSocket.on('cellClicked',function(position){
    markPosition(position,clientSocket);
    checkWin(clientSocket);
    checkTie();
  })
});

function assignSymbol(){
  for(i=0;i<clientsOrder.length;i++){
    aux = clientsOrder[i]
    if(i===0){
      aux.emit('symbol',"O")
    }
    if(i===1){
      aux.emit('symbol',"X")
    }
  }
}

function markPosition(position,client){
  if(!totalCellsMarked.includes(position)){
    if(client===clientsOrder[0] && (plays % 2 != 0)){
      symbol = symbols[0]
      PlayerCellsMarked[client.id].push(position)
      socket.emit("markPosition",{position,symbol})
      plays+=1
      totalCellsMarked.push(position)
    } else if(client===clientsOrder[1] && (plays % 2 == 0)){
      symbol = symbols[1]
      PlayerCellsMarked[client.id].push(position)
      socket.emit("markPosition",{position,symbol})
      plays+=1
      totalCellsMarked.push(position)
    }
  }
}

function resetCellsMarked(){
  totalCellsMarked = [];
  plays = 1
}

function resetMarksPosition(){
  for(i=0;i<clientsOrder.length;i++){
    if(clientsOrder[i]){
      aux = clientsOrder[i]
      PlayerCellsMarked[aux.id] = [];
    }
  }
}

function checkWin(client){
  cont = 0
  for(i=0;i<combinations.length;i++){
    combination = combinations[i]
    for(j=0;j<combination.length;j++){
        if(PlayerCellsMarked[client.id].includes(combination[j])){
          cont+=1
        }
    }
    if(cont===3){
      if(client===clientsOrder[1]){
        symbol = symbols[1]
        socket.emit("winner",symbol)
        resetCellsMarked()
        resetMarksPosition()
        socket.emit("cleanTable");
        qntWinsX += 1
        cont=0
        qntWins()
      }
      else if(client===clientsOrder[0]){
        symbol = symbols[0]
        socket.emit("winner",symbol)
        resetCellsMarked()
        resetMarksPosition()
        socket.emit("cleanTable");
        qntWinsO += 1
        cont=0
        qntWins()
      }
    }
    cont = 0
  }
}

function playersConnected(){
  quant = clientsOrder.length
  socket.emit("playersConnected",quant)
}

function checkTie(){
  if(totalCellsMarked.length === 9){
    console.log("empate")
  }
}

function qntWins(){
  socket.emit("qntWins",[qntWinsO,qntWinsX])
}

function resetQntWins(){
  socket.emit("cleanQuant")
  qntWinsO = 0
  qntWinsX = 0
}

function clearData(){
  socket.emit("cleanTable");
  socket.emit("cleanWin");
}
