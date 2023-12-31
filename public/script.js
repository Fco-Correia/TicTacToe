const socket = io();
const cells = document.querySelectorAll('.cell');
const symbol = document.querySelector('.symbol');
const win = document.querySelector('.win')
const connected =  document.querySelector('.connected')
const quantWins = document.querySelector('.qntWins')
socket.on('symbol',function(value){
    symbol.textContent = "Seu simbolo: " + value
})

for(let i = 0;i < cells.length;i++){// se nao usar o let fica tipo como se fosse uma variavel global
    cells[i].addEventListener('click',function(){
        socket.emit("cellClicked",i)
    })
}

socket.on('markPosition', ({ position, symbol }) => {
    cells[position].textContent = symbol;
});

socket.on('cleanTable', function() {
    for(let i = 0;i < cells.length;i++){// se nao usar o let fica tipo como se fosse uma variavel global
        cells[i].textContent = "";
    }    
});

socket.on('winner',function(value){
    win.textContent= "Vencedor da passada: "+ value
})

socket.on("cleanWin",function(){
    win.textContent = ""
})

socket.on("playersConnected",function(value){
    connected.textContent = "Jogadores conectados: " + value
})

socket.on("qntWins",function([qntWinsO,qntWinsX]){
    quantWins.textContent = "Vitorias de O: " + qntWinsO + " / X: " + qntWinsX
})

socket.on("cleanQuant",function(){
    quantWins.textContent = ""
})
