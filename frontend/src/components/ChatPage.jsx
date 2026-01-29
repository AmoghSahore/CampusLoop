import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../services/authService';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const prefilledSellerId = searchParams.get('sellerId');
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch all chats
  const fetchChats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChats(response.data || []);
      
      // If sellerId is prefilled and no active chat, create or select chat with that seller
      if (prefilledSellerId && !activeChat) {
        const existingChat = response.data.find(chat => 
          chat.participants?.some(p => p._id === prefilledSellerId)
        );
        if (existingChat) {
          setActiveChat(existingChat);
        }
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      // Use sample data for testing
      setChats([
        {
          _id: '1',
          participants: [
            { _id: 'user1', name: 'Arjun K.', email: 'arjun@university.edu' },
            { _id: 'user2', name: 'You', email: 'you@university.edu' }
          ],
          lastMessage: { text: 'Is the textbook still available?', createdAt: new Date().toISOString() },
          product: { title: 'Operating Systems Concepts', _id: '1' }
        },
        {
          _id: '2',
          participants: [
            { _id: 'user3', name: 'Priya S.', email: 'priya@university.edu' },
            { _id: 'user2', name: 'You', email: 'you@university.edu' }
          ],
          lastMessage: { text: 'Yes, you can pick it up tomorrow', createdAt: new Date(Date.now() - 3600000).toISOString() },
          product: { title: 'Lab coat', _id: '2' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for active chat
  const fetchMessages = async () => {
    if (!activeChat) return;
    
    try {
      const token = getToken();
      const response = await axios.get(`http://localhost:5000/api/chats/${activeChat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      // Sample messages
      setMessages([
        {
          _id: 'm1',
          sender: { _id: 'user1', name: 'Arjun K.' },
          text: 'Hi! Is the textbook still available?',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          _id: 'm2',
          sender: { _id: 'user2', name: 'You' },
          text: 'Yes, it is! Are you interested?',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'm3',
          sender: { _id: 'user1', name: 'Arjun K.' },
          text: 'Great! Can we meet at the library tomorrow?',
          createdAt: new Date(Date.now() - 1800000).toISOString()
        }
      ]);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    setSending(true);
    try {
      const token = getToken();
      const response = await axios.post(
        `http://localhost:5000/api/chats/${activeChat._id}/messages`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Add message locally for demo
      const newMsg = {
        _id: 'm' + Date.now(),
        sender: { _id: 'user2', name: 'You' },
        text: newMessage,
        createdAt: new Date().toISOString()
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  // Polling - fetch new messages every 5 seconds
  useEffect(() => {
    if (!activeChat) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeChat]);

  const currentUserId = 'user2'; // Replace with actual logged-in user ID

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-slate-200 bg-white/80 backdrop-blur">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <Link
              to="/"
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
            >
              ✕
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">No conversations yet</p>
            <Link to="/" className="mt-4 inline-block text-sm text-emerald-600 hover:text-emerald-700">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
            {chats.map((chat) => {
              const otherParticipant = chat.participants?.find(p => p._id !== currentUserId);
              const isActive = activeChat?._id === chat._id;
              
              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                    isActive ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                      {otherParticipant?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{otherParticipant?.name || 'Unknown'}</h3>
                        <span className="text-xs text-slate-500">
                          {chat.lastMessage?.createdAt ? 
                            new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : ''}
                        </span>
                      </div>
                      {chat.product && (
                        <p className="text-xs text-emerald-600">Re: {chat.product.title}</p>
                      )}
                      <p className="truncate text-sm text-slate-600">
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Side - Message History */}
      <div className="flex flex-1 flex-col">
        {!activeChat ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">💬</div>
              <h2 className="text-2xl font-bold text-slate-900">Select a conversation</h2>
              <p className="mt-2 text-slate-600">Choose a chat from the left to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="border-b border-slate-200 bg-white/80 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                  {activeChat.participants?.find(p => p._id !== currentUserId)?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {activeChat.participants?.find(p => p._id !== currentUserId)?.name || 'Unknown'}
                  </h2>
                  {activeChat.product && (
                    <Link 
                      to={`/product/${activeChat.product._id}`}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Regarding: {activeChat.product.title}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender?._id === currentUserId;
                  
                  return (
                    <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2 ${
                        isOwn 
                          ? 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-white' 
                          : 'bg-white text-slate-900 ring-1 ring-slate-200'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`mt-1 text-xs ${isOwn ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-200 bg-white/80 p-4 backdrop-blur">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="rounded-full bg-gradient-to-r from-emerald-600 to-cyan-500 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
