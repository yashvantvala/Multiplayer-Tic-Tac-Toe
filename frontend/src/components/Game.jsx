import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const Game = ({ socket, username, room }) => {
  const [playerInfo, setPlayerInfo] = useState({});
  const [winningPlayer, setWinningPlayer] = useState("");
  const [board, setBoard] = useState([]);

  const handleMove = (position) => {
    if(board[position]!=='empty') return alert('Position is already filled')
    if(winningPlayer) return;
    if(playerInfo.turn !== username){
        return alert('It is not your turn');
    }else if(!playerInfo.player1 || !playerInfo.player2){
        return alert('Please wait for the other player to join.');
    }
    const payload = {
      player: username,
      position,
      room,
      turn: username
    };
    socket.emit("move", payload);
  };

  useEffect(() => {
    socket.on("get_info", (payload) => {
      console.log(payload)
      setBoard(payload["BOARD"]);
      setPlayerInfo(payload['playerInfo']);
    });
    socket.on("updated_move", (data) => {
      setBoard(data["BOARD"]);
      setPlayerInfo(data["playerInfo"]);
    });
    socket.on("game_over", (payload) => {
      console.log(payload);
      setWinningPlayer(payload["winningPlayer"]);
    });
    socket.on("position_filled", (payload) => {
      alert(payload['message']);
    });
    socket.on("disconnected", (payload) => {
        console.log("disconencted")
      alert(payload['message']);
    });
  }, [socket]);

  const getItem = (position) => {
    if (!board[position] || board[position] === "empty") {
      return <span></span>;
    }
    return <span>{board[position]}</span>;
  };

  if (!board.length) {
    return <p>Setting up the game, please wait...</p>;
  }

  const getWinningInfo = () => {
    switch (winningPlayer) {
      case "Tie":
        return <p>It's a Tie</p>;
        default:
        return <p>{winningPlayer === username ? 'You' : winningPlayer} Won</p>;
    }
  };

  return (
    <div className="container">
      <p>Welcome {username}</p>
      {winningPlayer && getWinningInfo()}
      {!winningPlayer && playerInfo.turn && <div className="player-turn">{playerInfo.turn === username ? 'your' : playerInfo.turn} Turn</div>}
      <div className="wrapper">
        <div onClick={() => handleMove(0)}>{getItem(0)}</div>
        <div onClick={() => handleMove(1)}>{getItem(1)}</div>
        <div onClick={() => handleMove(2)}>{getItem(2)}</div>
      </div>
      <div className="wrapper">
        <div onClick={() => handleMove(3)}>{getItem(3)}</div>
        <div onClick={() => handleMove(4)}>{getItem(4)}</div>
        <div onClick={() => handleMove(5)}>{getItem(5)}</div>
      </div>
      <div className="wrapper">
        <div className="border-bottom-none" onClick={() => handleMove(6)}>{getItem(6)}</div>
        <div className="border-bottom-none" onClick={() => handleMove(7)}>{getItem(7)}</div>
        <div className="border-bottom-none" onClick={() => handleMove(8)}>{getItem(8)}</div>
      </div>
    </div>
  );
};

export default Game;
