import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import CryptoJS from "crypto-js";
import "../styles/floatchat.css";

// --- Encryption Utils ----------------------------------------------------

const getEncryptionKey = (senderId, receiverId) => {
  const sorted = [senderId, receiverId || "admin"].sort();
  return CryptoJS.SHA256(sorted.join("-")).toString();
};

const encryptMessage = (text, key) => CryptoJS.AES.encrypt(text, key).toString();

const decryptMessage = (encrypted, key) => {
  if (!encrypted) return "[No message]";
  try {
    if (!encrypted.includes("U2FsdGVkX1")) return encrypted;
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const dec = bytes.toString(CryptoJS.enc.Utf8);
    return dec || "[Encrypted]";
  } catch {
    return "[Encrypted]";
  }
};

// -------------------------------------------------------------------------

export default function FloatingChat() {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [showToolkit, setShowToolkit] = useState(false);
 const [toolkitPosition, setToolkitPosition] = useState({ x: 0, y: 0 });
 const [showTooltip, setShowTooltip] = useState(false);

  // --- Fetch Admin -------------------------------------------------------

  useEffect(() => {
    if (!user) return;

    const fetchAdmin = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("is_admin", true)
        .single();

      if (data) setAdminId(data.user_id);
    };

    fetchAdmin();
  }, [user]);

  // --- Fetch Messages ----------------------------------------------------

  const fetchMessages = useCallback(async () => {
    if (!user || !adminId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (error) {
      setIsLoading(false);
      return;
    }

    const decrypted = data.map((msg) => {
      const key = getEncryptionKey(msg.sender_id, msg.receiver_id);
      return { ...msg, message: decryptMessage(msg.message, key) };
    });

    setMessages(decrypted);
    setIsLoading(false);
  }, [user, adminId]);

  // Load messages once admin is known
  useEffect(() => {
    if (user && adminId) fetchMessages();
  }, [user, adminId, fetchMessages]);

  // --- Realtime Listener -------------------------------------------------

  useEffect(() => {
    if (!user || !adminId) return;

    const channel = supabase
      .channel(`chat-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const newMsg = payload.new;

          // Ignore unrelated messages
          if (
            newMsg.sender_id !== user.id &&
            newMsg.receiver_id !== user.id
          ) {
            return;
          }

          const key = getEncryptionKey(
            newMsg.sender_id,
            newMsg.receiver_id
          );

          const decrypted = decryptMessage(newMsg.message, key);

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;

            return [...prev, { ...newMsg, message: decrypted }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, adminId]);

  // --- Auto scroll -------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send Message ------------------------------------------------------

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !adminId) return;

    const key = getEncryptionKey(user.id, adminId);
    const encrypted = encryptMessage(text, key);

    const tempId = `temp-${Date.now()}`;

    // Optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender_id: user.id,
        receiver_id: adminId,
        message: text,
        created_at: new Date().toISOString(),
        isSending: true,
      },
    ]);

    setMessage("");

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: user.id,
        receiver_id: adminId,
        message: encrypted,
        is_admin_message: false,
      })
      .select("*")
      .single();

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Failed to send message");
      return;
    }

    // Replace temp message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempId
          ? {
              ...m,
              id: data.id,
              created_at: data.created_at,
              isSending: false,
            }
          : m
      )
    );
  };

  if (!user) return null;

  // -----------------------------------------------------------------------
  // ----------------------------- UI (unchanged) --------------------------
  // -----------------------------------------------------------------------

// Add this effect after your other effects
useEffect(() => {
  const timer = setInterval(() => {
    setShowToolkit(true);
    
    // Hide the toolkit after 5 seconds
    setTimeout(() => {
      setShowToolkit(false);
    }, 5000);
  }, 60000); // Show every 1 minute

  return () => clearInterval(timer);
}, []);

// Add this function to handle toolkit clicks
const handleToolkitClick = (action) => {
  switch(action) {
    case 'help':
      setMessage("I need some help with...");
      break;
    case 'order':
      setMessage("Can you check my order status?");
      break;
    case 'info':
      setMessage("I need more information about...");
      break;
    default:
      break;
  }
  setShowToolkit(false);
};


  return (
    <>
      <div className="floating-chat-container">
        <button
          onClick={() => setShowChat(!showChat)}
          className="floating-chat-button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onTouchStart={() => setShowTooltip(true)}
          onTouchEnd={() => setShowTooltip(false)}
        >
          {showChat ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
        {showTooltip && (
          <div className="floating-chat-tooltip show">
            {showChat ? "Close Chat" : "Chat with Support"}
          </div>
        )}
      </div>

      {showChat && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-icon">
                <MessageCircle size={16} />
              </div>
              <div>
                <div className="chat-title">Secure Chat</div>
                <div className="chat-status">
                  Messages are end-to-end encrypted
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="chat-close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages">
            {isLoading ? (
              <div>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Start a secure conversation
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender_id === user.id
                      ? "message-outgoing"
                      : "message-incoming"
                  }`}
                >
                  <div className="message-inner">
                    {msg.message}
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="quick-replies">
              <button
                type="button"
                onClick={() => setMessage("I need help with my order")}
                className="quick-reply"
              >
                Order Help
              </button>
              <button
                type="button"
                onClick={() =>
                  setMessage("What's the status of my application?")
                }
                className="quick-reply"
              >
                Application Status
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-wrapper">
              <input
                type="text"
                value={message}
                placeholder="Type your secure message..."
                onChange={(e) => setMessage(e.target.value)}
                className="chat-input"
              />
              <button type="submit" disabled={!message.trim()} className="chat-send">
                <ArrowUp size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
