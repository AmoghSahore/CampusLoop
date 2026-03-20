import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Send, X, MessageSquare, ArrowLeft, User } from 'lucide-react';
import { getToken, getUser } from '../services/authService';
import API_BASE from '../config/api.js';

// ──────────────────────────────────────────────────────────────
// ChatPage – wired to real backend:
//   POST /api/messages               → send a message
//   GET  /api/messages/:pid/:uid     → fetch conversation
//
// A "conversation" is uniquely keyed by (product_id + other_user_id).
// URL params: ?sellerId=X&productId=Y to auto-open a conversation.
// ──────────────────────────────────────────────────────────────

const conversationKey = (conv) => `${conv.productId}-${conv.otherUserId}`;

const mergeConversations = (primaryList, secondaryList = []) => {
  const seen = new Set();
  const merged = [];

  [...primaryList, ...secondaryList].forEach((conv) => {
    if (!conv?.productId || !conv?.otherUserId) return;
    const key = conversationKey(conv);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(conv);
  });

  return merged;
};

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const prefilledSeller = searchParams.get('sellerId');
  const prefilledProduct = searchParams.get('productId');

  // Logged-in user (from JWT stored in localStorage)
  const currentUser = getUser();
  const myId = currentUser?._id;

  // Active conversation state: { productId, otherUserId, otherUserName, productTitle }
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // history: array of { productId, otherUserId, otherUserName, productTitle }
  // We keep this as a local list so the sidebar shows past conversations this session
  const [history, setHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Open a conversation ──────────────────────────────────────
  const openConversation = (conv) => {
    setActiveConv(conv);
    setMessages([]);
    setHistory((prev) => mergeConversations([conv], prev));
  };

  const fetchConversationList = async () => {
    if (!myId || !getToken()) return;
    try {
      const res = await axios.get(`${API_BASE}/api/chats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const incoming = res.data?.conversations || [];
      setHistory((prev) => mergeConversations(incoming, prev));
    } catch (_err) {
      // Keep existing history if inbox fetch fails
    }
  };

  useEffect(() => {
    fetchConversationList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  useEffect(() => {
    if (!myId || !getToken()) return undefined;
    const iv = setInterval(fetchConversationList, 5000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  // ── Auto-open from URL params ────────────────────────────────
  useEffect(() => {
    if (prefilledSeller && prefilledProduct && myId) {
      // Don't open a chat with yourself
      if (String(prefilledSeller) === String(myId)) return;

      // Fetch product title for display
      axios.get(`${API_BASE}/api/products/${prefilledProduct}`)
        .then(r => {
          openConversation({
            productId: prefilledProduct,
            otherUserId: prefilledSeller,
            otherUserName: r.data?.seller?.name || 'Seller',
            productTitle: r.data?.title || 'Item',
          });
        })
        .catch(() => {
          // If product fetch fails, open with minimal info
          openConversation({
            productId: prefilledProduct,
            otherUserId: prefilledSeller,
            otherUserName: 'Seller',
            productTitle: 'Item',
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledSeller, prefilledProduct, myId]);

  // ── Fetch messages for active conversation ───────────────────
  const fetchMessages = async () => {
    if (!activeConv || !myId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/messages/${activeConv.productId}/${activeConv.otherUserId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessages(res.data?.messages || []);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load messages.';
      setError(msg);
    }
  };

  useEffect(() => {
    if (activeConv) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv]);

  // Poll for new messages every 5 s
  useEffect(() => {
    if (!activeConv) return;
    const iv = setInterval(fetchMessages, 5000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv]);

  // ── Send a message ───────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      await axios.post(
        `${API_BASE}/api/messages`,
        {
          receiver_id: activeConv.otherUserId,
          product_id: activeConv.productId,
          message: newMessage.trim(),
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setNewMessage('');
      await fetchMessages(); // reload to get the saved message with correct IDs
      await fetchConversationList();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // ── Sidebar conversation item ────────────────────────────────
  const ConvItem = ({ conv }) => {
    const isActive = activeConv &&
      String(activeConv.productId) === String(conv.productId) &&
      String(activeConv.otherUserId) === String(conv.otherUserId);
    return (
      <button onClick={() => openConversation(conv)}
        className={`w-full border-b border-[var(--border)] px-4 py-3.5 text-left transition-all hover:bg-[var(--bg-alt)] ${isActive ? 'bg-indigo-50 border-l-[3px] border-l-[var(--primary)]' : ''
          }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'var(--grad-primary)' }}>
            {conv.otherUserName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--fg)]">{conv.otherUserName}</p>
            <p className="text-xs text-[var(--primary)] truncate">Re: {conv.productTitle}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-[var(--border)] flex flex-col bg-white">
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3.5 relative overflow-hidden"
          style={{ background: 'var(--grad-hero)' }}>
          <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <MessageSquare size={15} className="text-violet-300" />
            </div>
            <h1 className="text-base font-bold text-white">Messages</h1>
          </div>
          <Link to="/" className="relative flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition">
            <X size={14} />
          </Link>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <User size={32} className="mx-auto mb-3 text-[var(--fg-subtle)]" />
              <p className="text-sm text-[var(--fg-muted)]">No conversations yet</p>
              <Link to="/" className="mt-3 inline-block text-sm font-semibold text-[var(--primary)] hover:underline">
                Browse listings
              </Link>
            </div>
          ) : (
            history.map(conv => (
              <ConvItem key={`${conv.productId}-${conv.otherUserId}`} conv={conv} />
            ))
          )}
        </div>
      </div>

      {/* ── Main panel ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeConv ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 24px var(--primary-glow)' }}>
              <MessageSquare size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-[var(--fg)]">Select a conversation</h2>
            <p className="text-sm text-[var(--fg-muted)]">
              Pick a chat from the left, or click "Chat with Seller" on any listing.
            </p>
            <Link to="/" className="btn-primary mt-2 px-6 py-2.5 text-sm">Browse listings</Link>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'var(--grad-primary)' }}>
                {activeConv.otherUserName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-[var(--fg)]">{activeConv.otherUserName}</p>
                <Link to={`/product/${activeConv.productId}`}
                  className="text-xs text-[var(--primary)] hover:underline">
                  Re: {activeConv.productTitle}
                </Link>
              </div>
              <Link to="/" className="ml-auto flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
                <ArrowLeft size={13} /> Back
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
              style={{ background: 'linear-gradient(180deg,#f4faf6 0%,#edf7f2 100%)' }}>

              {loading && (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
                  {error}
                </div>
              )}

              {!loading && !error && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                  <MessageSquare size={32} className="text-[var(--fg-subtle)]" />
                  <p className="text-sm text-[var(--fg-muted)]">No messages yet — say hello!</p>
                </div>
              )}

              {messages.map(msg => {
                const isOwn = String(msg.sender_id) === String(myId);
                return (
                  <div key={msg.chat_id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[11px] font-bold text-white"
                        style={{ background: 'var(--grad-primary)' }}>
                        {msg.sender?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${isOwn
                        ? 'rounded-br-sm text-white'
                        : 'rounded-bl-sm bg-white border border-[var(--border)] text-[var(--fg)]'
                      }`} style={isOwn ? { background: 'var(--grad-primary)', boxShadow: '0 2px 12px var(--primary-glow)' } : {}}>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`mt-1 text-right text-[10px] ${isOwn ? 'text-white/60' : 'text-[var(--fg-subtle)]'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--border)] bg-white px-5 py-3.5">
              {error && !loading && (
                <p className="mb-2 text-xs text-rose-600">{error}</p>
              )}
              <form onSubmit={handleSend} className="flex gap-2.5">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-2.5 text-sm text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/15 transition"
                />
                <button type="submit" disabled={!newMessage.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white transition disabled:opacity-40"
                  style={{ background: 'var(--grad-primary)', boxShadow: '0 2px 10px var(--primary-glow)' }}>
                  <Send size={15} />
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
