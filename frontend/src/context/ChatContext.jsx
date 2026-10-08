import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const ChatContext = createContext(null);
const SOCKET_URL = "http://localhost:5000";

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const reduxUser = useSelector((state) => state.auth?.user); 
  
  const getActiveUser = () => {
    if (reduxUser && reduxUser._id) return reduxUser;
    const localData = localStorage.getItem('user');
    if (localData && localData !== "undefined" && localData !== "null") {
      try { return JSON.parse(localData); } catch (e) { return null; }
    }
    return null;
  };

  const currentUser = getActiveUser();

  useEffect(() => {
    if (!currentUser || !currentUser._id) {
      console.log("⚠️ ChatProvider: No valid user _id found yet. Connection holding.");
      return;
    }

    // Singleton Connection Instance
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      query: { userId: currentUser._id }
    });

    setSocket(newSocket);
    console.log("⚡ Global Socket Connected Successfully for User ID:", currentUser._id);

    return () => {
      newSocket.disconnect();
      console.log("❌ Global Socket Connection Closed.");
    };
  }, [reduxUser]); 

  return (
    <ChatContext.Provider value={{ socket, user: currentUser }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext) || { socket: null, user: null };
