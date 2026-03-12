import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Send, X, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import { getToken } from '../services/authService';
import API_BASE from '../config/api.js';

const ME = 'user2';

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const prefilledSellerId = searchParams.get('sellerId');
  const [chats,      setChats]      = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [sending,    setSending]    = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/chats`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      setChats(res.data || []);
      if (prefilledSellerId && !activeChat) {
        const existing = res.data.find(c => c.participants?.some(p => p._id === prefilledSellerId));
        if (existing) setActiveChat(existing);
      }
    } catch {
      setChats([
        { _id:'1', participants:[{_id:'user1',name:'Arjun K.',email:'arjun@uni.edu'},{_id:ME,name:'You',email:'you@uni.edu'}], lastMessage:{text:'Is the textbook still available?',createdAt:new Date().toISOString()}, product:{title:'Operating Systems Concepts',_id:'1'} },
        { _id:'2', participants:[{_id:'user3',name:'Priya S.',email:'priya@uni.edu'},{_id:ME,name:'You',email:'you@uni.edu'}], lastMessage:{text:'Yes, pick it up tomorrow',createdAt:new Date(Date.now()-3600000).toISOString()}, product:{title:'Lab coat',_id:'2'} },
      ]);
    } finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      const res = await axios.get(`${API_BASE}/api/chats/${activeChat._id}/messages`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      setMessages(res.data || []);
    } catch {
      setMessages([
        { _id:'m1', sender:{_id:'user1',name:'Arjun K.'}, text:'Hi! Is the textbook still available?', createdAt: new Date(Date.now()-7200000).toISOString() },
        { _id:'m2', sender:{_id:ME,name:'You'}, text:'Yes, it is! Are you interested?', createdAt: new Date(Date.now()-3600000).toISOString() },
        { _id:'m3', sender:{_id:'user1',name:'Arjun K.'}, text:'Great! Can we meet at the library tomorrow?', createdAt: new Date(Date.now()-1800000).toISOString() },
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE}/api/chats/${activeChat._id}/messages`, { text:newMessage }, { headers:{ Authorization:`Bearer ${getToken()}` } });
      setMessages(prev => [...prev, res.data]);
    } catch {
      setMessages(prev => [...prev, { _id:'m'+Date.now(), sender:{_id:ME,name:'You'}, text:newMessage, createdAt:new Date().toISOString() }]);
    } finally { setNewMessage(''); setSending(false); }
  };

  useEffect(() => { fetchChats(); }, []);
  useEffect(() => { if (activeChat) fetchMessages(); }, [activeChat]);
  useEffect(() => {
    if (!activeChat) return;
    const iv = setInterval(fetchMessages, 5000);
    return () => clearInterval(iv);
  }, [activeChat]);

  const ChatItem = ({ chat }) => {
    const other = chat.participants?.find(p => p._id !== ME);
    const isActive = activeChat?._id === chat._id;
    return (
      <button onClick={() => setActiveChat(chat)}
        className={`w-full border-b border-[var(--border)] px-4 py-3.5 text-left transition-all hover:bg-[var(--bg-alt)] ${
          isActive ? 'bg-emerald-50 border-l-[3px] border-l-[var(--primary)]' : ''
        }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background:'var(--grad-primary)' }}>
            {other?.name?.charAt(0) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-[var(--fg)]">{other?.name || 'Unknown'}</p>
              <span className="shrink-0 text-xs text-[var(--fg-subtle)]">
                {chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
              </span>
            </div>
            {chat.product && <p className="text-xs text-[var(--primary)] truncate">Re: {chat.product.title}</p>}
            <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">{chat.lastMessage?.text || 'No messages yet'}</p>
          </div>
        </div>
      </button>
    );
  };

  const otherUser = activeChat?.participants?.find(p => p._id !== ME);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-[var(--border)] flex flex-col bg-white">
        {/* Sidebar header – gradient */}
        <div className="flex items-center justify-between px-4 py-3.5 relative overflow-hidden"
          style={{ background:'var(--grad-hero)' }}>
          <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none"/>
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
              <MessageSquare size={15} className="text-emerald-300"/>
            </div>
            <h1 className="text-base font-bold text-white">Messages</h1>
          </div>
          <Link to="/" className="relative flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition">
            <X size={14}/>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8"><div className="spinner"/></div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--fg-muted)]">No conversations yet</p>
              <Link to="/" className="mt-3 inline-block text-sm font-semibold text-[var(--primary)] hover:underline">Browse listings</Link>
            </div>
          ) : (
            chats.map(chat => <ChatItem key={chat._id} chat={chat}/>)
          )}
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeChat ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background:'var(--grad-primary)', boxShadow:'0 4px 24px var(--primary-glow)' }}>
              <MessageSquare size={28} className="text-white"/>
            </div>
            <h2 className="text-xl font-bold text-[var(--fg)]">Select a conversation</h2>
            <p className="text-sm text-[var(--fg-muted)]">Pick a chat from the left to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background:'var(--grad-primary)' }}>
                {otherUser?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-[var(--fg)]">{otherUser?.name || 'Unknown'}</p>
                {activeChat.product && (
                  <Link to={`/product/${activeChat.product._id}`}
                    className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                    {activeChat.product.title}<ChevronRight size={11}/>
                  </Link>
                )}
              </div>
              <Link to="/" className="ml-auto flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
                <ArrowLeft size={13}/> Back
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
              style={{ background:'linear-gradient(180deg,#f4faf6 0%,#edf7f2 100%)' }}>
              {messages.map(msg => {
                const isOwn = msg.sender?._id === ME;
                return (
                  <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[11px] font-bold text-white"
                        style={{ background:'var(--grad-primary)' }}>
                        {msg.sender?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? 'rounded-br-sm text-white'
                        : 'rounded-bl-sm bg-white border border-[var(--border)] text-[var(--fg)]'
                    }`} style={isOwn ? { background:'var(--grad-primary)', boxShadow:'0 2px 12px var(--primary-glow)' } : {}}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`mt-1 text-right text-[10px] ${isOwn ? 'text-white/60' : 'text-[var(--fg-subtle)]'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div className="border-t border-[var(--border)] bg-white px-5 py-3.5">
              <form onSubmit={handleSend} className="flex gap-2.5">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-2.5 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/15 transition"/>
                <button type="submit" disabled={!newMessage.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white transition disabled:opacity-40"
                  style={{ background:'var(--grad-primary)', boxShadow:'0 2px 10px var(--primary-glow)' }}>
                  <Send size={15}/>
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
