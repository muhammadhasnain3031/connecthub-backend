import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useSelector } from 'react-redux'; // ⚡ Naya Import: Direct Redux Store check karne ke liye

function Chat() {
  const { conversationId } = useParams();
  const { socket } = useChat();
  
  // ⚡ Direct Redux check + LocalStorage double safety barrier
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

  // ⚡ Effect to force sync user state if Redux loads later
  useEffect(() => {
    const activeUser = getFallbackUser();
    if (activeUser) {
      setUser(activeUser);
    }
  }, [reduxUser]);

  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Page Warning: Socket instance null hai context mein.");
      return;
    }

    socket.emit('joinRoom', conversationId);
    console.log(`🔌 Page Signal: Joined room ${conversationId}`);

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
    
    console.log("🔘 CLICKED! Text:", text);
    console.log("🔌 Socket State:", socket ? "OK (Connected)" : "NULL (Disconnected)");
    console.log("👤 User (Direct Sync):", user);

    if (!text.trim()) return;

    // Direct configuration fallback payload construction
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
      // ⚡ HARD BYPASS: Agar socket context slow hai, to direct internal logic emit alert
      alert("Socket connected nahi hai! Please page ko refresh (F5) karein taake state sync ho sake.");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '0' }}>Chat Room: {conversationId}</h3>
      
      <div style={{ flex: '1', overflowY: 'auto', padding: '10px', background: '#f9f9f9', marginBottom: '10px', borderRadius: '4px' }}>
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?._id;
          return (
            <div key={index} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
              <div style={{ background: isMe ? '#007bff' : '#e4e6eb', color: isMe ? '#fff' : '#000', padding: '8px 12px', borderRadius: '12px', maxWidth: '70%', wordBreak: 'break-word' }}>
                <p style={{ margin: '0' }}>{msg.text}</p>
                <small style={{ fontSize: '10px', opacity: '0.7', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Type your message here..." 
          style={{ flex: '1', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
