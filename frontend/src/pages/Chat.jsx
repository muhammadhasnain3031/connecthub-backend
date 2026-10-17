import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useSelector } from 'react-redux';

function Chat() {
  const { conversationId } = useParams();
  const { socket } = useChat();
  const reduxUser = useSelector((state) => state.auth?.user);

  const getFallbackUser = () => {
    if (reduxUser && reduxUser._id) return reduxUser;
    const localData = localStorage.getItem('user');
    if (localData && localData !== "undefined") {
      try { return JSON.parse(localData); } catch (e) { return null; }
    }
    return null;
  };

  const [user, setUser] = useState(getFallbackUser());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const activeUser = getFallbackUser();
    if (activeUser) setUser(activeUser);
  }, [reduxUser]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinRoom', conversationId);
    socket.on('receiveMessage', (newMessageData) => {
      setMessages((prev) => [...prev, newMessageData]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageData = {
      conversationId,
      senderId: user?._id || "anonymous",
      text: text.trim(),
      createdAt: new Date()
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
      setMessages((prev) => [...prev, messageData]);
      setText("");
    } else {
      alert("Socket connected nahi hai! Please page ko refresh (F5) karein taake state sync ho sake.");
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-head">💬 Chat Room: {conversationId}</div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?._id;
          return (
            <div key={index} className={`msg-row ${isMe ? 'me' : ''}`}>
              <div className="bubble">
                <p>{msg.text}</p>
                <small>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <input className="input" type="text" value={text}
          onChange={(e) => setText(e.target.value)} placeholder="Type your message here..." />
        <button type="submit" className="btn">Send</button>
      </form>
    </div>
  );
}

export default Chat;