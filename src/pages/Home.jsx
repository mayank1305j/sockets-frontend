import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const Home = () => {
  const [name, setName] = useState("");
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef();

  useEffect(() => {
    if (socket) {
      socket?.on("connect", () => {
        console.log("Connected:", socket.id);
      });

      socket?.on("receive-message", (data) => {
        console.log("Received message:", data);
        setMessages((prevMessages) => [...prevMessages, data]);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      const lastMessage = messagesContainerRef.current.lastChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim() !== "") {
      const newSocket = io(import.meta.env.VITE_SERVER_BASE_URL);
      setSocket(newSocket);
      toast(`Welcome ${name}!`);
    } else {
      toast.error("Please enter your name");
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (text.trim() !== "" && socket && socket.connected) {
      const socketId = socket.id;
      socket.emit("new-message", { text, name, socketId });
      setMessages((prevMessages) => [
        ...prevMessages,
        { text, name, socketId },
      ]);
      setText("");
      // window.scrollTo(0, document.body.scrollHeight);
    }
  };

  return (
    <div className="relative w-full min-h-screen dark:text-white">
      <div
        className={`absolute ${
          socket === null ? "flex" : "opacity-0 blur-lg pointer-events-none"
        } flex-col items-center justify-center w-4/5 gap-4 -translate-x-1/2 -translate-y-1/2 bg-gray-400 top-1/2 left-1/2 h-4/5 duration-1000`}
      >
        <form
          onSubmit={handleSubmit}
          className={
            "h-full w-full flex justify-center items-center flex-col gap-4"
          }
        >
          <input
            type="text"
            value={name}
            placeholder="your name..."
            className="p-2 text-black border border-black rounded focus:outline-none"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-1 italic text-black bg-white border border-black rounded"
          >
            Enter
          </button>
        </form>
      </div>
      <div
        className={`${
          socket === null ? "opacity-0 pointer-events-none" : "opacity-100"
        } duration-1000 delay-500 bg-gradient-to-tr from-black to-indigo-800 p-2 w-full min-h-screen`}
      >
        <div className="p-1 text-center backdrop-blur-sm w-full bg-[#0007] mb-4 sticky top-0 left-0 z-10">
          logged in as <span className="text-blue-400 uppercase">{name}</span>
        </div>
        <div ref={messagesContainerRef} className="max-w-3xl mx-auto pb-[20vh]">
          {messages.length !== 0 && (
            <AllMessages messages={messages} selfSocketId={socket.id} />
          )}
        </div>
        <form
          onSubmit={handleSendMessage}
          className="fixed flex items-center justify-center min-h-[20vh] bg-gradient-to-t from-black w-full gap-2 -translate-x-1/2 bottom-0 left-1/2"
        >
          <input
            type="text"
            value={text}
            className="p-2 text-black bg-white rounded focus:outline-none"
            onChange={(e) => setText(e.target.value)}
          />
          <button className="p-2 italic text-black bg-white rounded">
            send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;

const AllMessages = ({ messages, selfSocketId }) => {
  return (
    <div className="flex flex-col items-start justify-center w-full gap-2">
      {messages.map((user, index) => {
        return (
          <div
            className={`flex flex-col items-start justify-center gap-2 p-2 backdrop-blur-3xl rounded ${
              selfSocketId === user.socketId
                ? "self-end bg-[#ffffff4d]"
                : "bg-[#0007]"
            }`}
            key={index}
          >
            <div className="flex items-center justify-center p-2 text-xs font-bold text-black uppercase bg-red-100 drop-shadow-md">
              {selfSocketId === user.socketId ? "you" : user.name} :
            </div>
            {user.text}
          </div>
        );
      })}
    </div>
  );
};
