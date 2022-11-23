import React, { useState } from "react";
import io from "socket.io-client";
import "./App.css";
import Chat from "./components/Chat";
import Game from "./components/Game";

const socket = io.connect("http://localhost:5000");

const App = () => {
  const [username, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const joinRoom = () => {
    if(!username || !room){
      return alert("Please fill those details");
    }
    socket.emit("join_room", {room, username});
    setIsJoined(true);
  };

  return (
    <div className="App">
      {!isJoined ? (
      <div className="join-room">
        <h3>Tic Tac Toe</h3>
        <input
          type="text"
          placeholder="John..."
          onChange={(event) => {
            setUserName(event.target.value);
          }}
        />
        <br/>
        <input
          type="text"
          placeholder="Room ID..."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <br/>
        <button onClick={joinRoom}>Join A Room</button>
      </div>):
      <div className="board-container">
      <Game socket={socket} username={username} room={room} />  
      <Chat socket={socket} username={username} room={room} />  
      </div>}
    </div>
  );
};

export default App;
