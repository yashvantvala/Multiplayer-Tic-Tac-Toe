import React, { useState, useEffect } from "react";

const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const payload = {
        room: room,
        username,
        message: currentMessage,
      };

      await socket.emit("send_message", payload);
      setMessages((list) => [...list, payload]);
      setCurrentMessage("");
    }
  };
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data)
      setMessages((prevMessages) => [...prevMessages, data]);
    });
  }, [socket]);

  return (
    <div className="chat">
      <h4>Chat</h4>
      <div className="chat-body">
        {messages.map((message, index)=>{
            return(
                <div key={index} className={`chat-message ${message.username === username ? 'pull-right':'pull-left'}`}>
                    <p>{message.message}</p><span>{message.username === username ? 'you' : message.username}</span>
                </div>
            )
        })}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};

export default Chat;
