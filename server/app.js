const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io  = require('socket.io')(server, {
  cors:{
    origin:'*'
  }
});


let BOARD = new Array(9).fill('empty');
let playerInfo = {
  player1:'',
  player2:'',
  turn:'',
  isCircleTurn:true,
}

let winningPlayer = '';

const winningPattern = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// const checkWinner = (socket, room) =>{
//   if (
//     BOARD[0] === BOARD[1] &&
//     BOARD[0] === BOARD[2] &&
//     BOARD[0] !== 'empty'
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[3] !== 'empty' &&
//     BOARD[3] === BOARD[4] &&
//     BOARD[4] === BOARD[5]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[6] !== 'empty' &&
//     BOARD[6] === BOARD[7] &&
//     BOARD[7] === BOARD[8]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[0] !== 'empty' &&
//     BOARD[0] === BOARD[3] &&
//     BOARD[3] === BOARD[6]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[1] !== 'empty' &&
//     BOARD[1] === BOARD[4] &&
//     BOARD[4] === BOARD[7]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[2] !== 'empty' &&
//     BOARD[2] === BOARD[5] &&
//     BOARD[5] === BOARD[8]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[0] !== 'empty' &&
//     BOARD[0] === BOARD[4] &&
//     BOARD[4] === BOARD[8]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   } else if (
//     BOARD[2] !== 'empty' &&
//     BOARD[2] === BOARD[4] &&
//     BOARD[4] === BOARD[6]
//   ) {
//     winningPlayer = playerInfo.turn;
//     io.in(room).emit("game_over",{winningPlayer});
//   }else if(BOARD.every((val)=>val !=='empty')){
//     winningPlayer = 'Tie';
//     io.in(room).emit("game_over",{winningPlayer});
//   }else{
//     playerInfo.turn = playerInfo.player1 === playerInfo.turn ? playerInfo.player2 : playerInfo.player1;
//   }
// }

//New Winning Logic

const checkWinner = (socket, room) =>{
  for(i=0;i<winningPattern.length;i++){
    const winningMatch = winningPattern[i];
    const a = BOARD[winningMatch[0]];
    const b = BOARD[winningMatch[1]];
    const c = BOARD[winningMatch[2]];
    console.log(a,b,c)
    if(a==='empty' || b === 'empty' || c === 'empty'){
      //can continue
      continue;
    }
    if(a==b && a==c){
      winningPlayer = playerInfo.turn;
      io.in(room).emit("game_over",{winningPlayer});
      return;
    }
  }
  if(BOARD.every((val)=>val !=='empty')){
    winningPlayer = 'Tie';
    io.in(room).emit("game_over",{winningPlayer});
  }else{
    playerInfo.turn = playerInfo.player1 === playerInfo.turn ? playerInfo.player2 : playerInfo.player1;
  }
}

io.on('connection',(socket)=>{
    console.log(`User Connected: ${socket.id}`);
    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
        if(!playerInfo.player1){
          playerInfo.player1 = data.username;
          playerInfo.turn = data.username;
        }else{
          playerInfo.player2 = data.username;
        }
        io.in(data.room).emit("get_info",{BOARD,playerInfo});
      });
      socket.on("move", (payload)=>{
        // if(BOARD[payload.position]!=='empty'){
        //   io.in(payload.room).emit("position_filled",{message:'Position is already filled'});
        // }else{
          BOARD[payload.position] = playerInfo.turn === playerInfo.player1 ? 'O' : 'X';
          checkWinner(socket, payload.room);
          io.in(payload.room).emit("updated_move",{BOARD,playerInfo});
        // }
      });
      socket.on("send_message", (payload)=>{
        socket.to(payload.room).emit("receive_message",payload);
      });
      socket.on("disconnect", ()=>{
        BOARD = new Array(9).fill('empty');
        playerInfo = {player1:'', player2:'', turn:''}
        winningPlayer='';
      })
});

app.get('/ping', (req, res) => {
  res.send('<h1>ping success</h1>');
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});