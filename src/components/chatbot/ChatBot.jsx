import { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { formatResponse, formatTypes } from "./responseFormatter";
import "./ChatBot.css";

// Constants
const CHATS_STORAGE_KEY = "saved_chats";
<<<<<<< HEAD
const API_ENDPOINT = "http://localhost:7070/generate";
const CURRENT_CHAT_KEY = "current_chat"; // Key for storing the active chat ID
=======
const API_ENDPOINT = "https://chatbotapi-myqe.onrender.com/generate";
const CURRENT_CHAT_KEY = "current_chat"; 
>>>>>>> 77b3c0f (project setup)

const generateChatId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const INITIAL_MESSAGE = {
  type: "bot",
  text: "***Hey! I am Thami, your assistant for today! What's on your mind?***",
  timestamp: new Date().toISOString(),
};

const BOT_PERSONALITY = {
  traits: ["direct", "engaging", "knowledgeable"],
  context: "Custom AI assistant built with Gemini API, focused on real-world discussions",
  creator: "user-defined custom bot",
  preferences: {
    topics: ["current events", "technology", "trends", "explicit content", "real-time news"],
    style: "aggressive and engaging",
  },
  responseFormats: {
    code: { prefix: "```", suffix: "```" },
    bold: { prefix: "***", suffix: "***" },
    readme: { prefix: "# README\n", suffix: "" },
  },
};

// Message Content Component
const MessageContent = ({ message }) => {
  const formatted = formatResponse(message.text);

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  switch (formatted.type) {
    case formatTypes.BOLD:
      return <div className="message-content bold">{formatted.content}</div>;
    case formatTypes.CODE:
      return (
        <div className="message-content code">
          {formatted.language && (
            <div className="code-header">
              <span className="language-tag">{formatted.language}</span>
              <button className="copy-button" onClick={() => handleCopy(formatted.content)}>
                Copy
              </button>
            </div>
          )}
          <pre>{formatted.content?.trim()}</pre>
        </div>
      );
    case formatTypes.README:
      return (
        <div
          className="message-content readme"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(formatted.content)) }}
        />
      );
    case formatTypes.LIST:
      return (
        <div className="message-content list">
          {formatted.content.split("\n").map((item, index) => (
            <div key={index} className="list-item">{item.trim()}</div>
          ))}
        </div>
      );
    default:
      return <div className="message-content normal">{formatted.content}</div>;
  }
};

// Drawer Component
const ChatDrawer = ({ chats, currentChatId, onNewChat, onSwitchChat, onDeleteChat, onClose, isOpen }) => (
  <>
    {isOpen && <div className="drawer-backdrop" onClick={onClose} />}
    <div className={`drawer ${isOpen ? "open" : ""}`}>
      <div className="drawer-header">
        <h2>Your Chats</h2>
        <button className="close-button" onClick={onClose} aria-label="Close menu">×</button>
      </div>
      <div className="drawer-content">
        <button className="new-chat-button" onClick={onNewChat}>
          New Chat
        </button>
        <div className="chats-list">
          {Object.values(chats).map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? "active" : ""}`}
              onClick={() => onSwitchChat(chat.id)}
            >
              <span className="chat-title">{chat.title}</span>
              <button className="delete-chat-button" onClick={(e) => onDeleteChat(chat.id, e)} aria-label="Delete chat">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

// Chatbot Component
const Chatbot = () => {
  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);
      return savedChats ? JSON.parse(savedChats) : {
        [generateChatId()]: { id: generateChatId(), messages: [INITIAL_MESSAGE], title: "New Chat" }
      };
    } catch (error) {
      console.error("Error loading chats:", error);
      return {
        [generateChatId()]: { id: generateChatId(), messages: [INITIAL_MESSAGE], title: "New Chat" }
      };
    }
  });

  // Load the current chat ID from localStorage on component mount
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem(CURRENT_CHAT_KEY) || Object.keys(chats)[0];
  });

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [error, setError] = useState(null);

  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-save chats
  useEffect(() => {
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Error saving chats:", error);
    }
  }, [chats]);

  // Save the current chat ID to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
  }, [currentChatId]);

  // Auto-scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats[currentChatId]?.messages]);

  // Create new chat
  const createNewChat = () => {
    const newChatId = generateChatId();
    setChats((prev) => ({
      ...prev,
      [newChatId]: { id: newChatId, messages: [INITIAL_MESSAGE], title: "New Chat" }
    }));
    setCurrentChatId(newChatId);
    setIsDrawerOpen(false);
  };

  // Switch chats
  const switchChat = (chatId) => {
    setCurrentChatId(chatId);
    setIsDrawerOpen(false);
  };

  // Delete chat
  const deleteChat = (chatId, event) => {
    event?.stopPropagation();
    setChats((prev) => {
      const newChats = { ...prev };
      delete newChats[chatId];

      if (Object.keys(newChats).length === 0) {
        const newChatId = generateChatId();
        newChats[newChatId] = { id: newChatId, messages: [INITIAL_MESSAGE], title: "New Chat" };
        setCurrentChatId(newChatId);
      } else if (chatId === currentChatId) {
        setCurrentChatId(Object.keys(newChats)[0]);
      }

      return newChats;
    });
  };

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const newUserMessage = {
      type: "user",
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...chats[currentChatId].messages, newUserMessage];
    setChats((prev) => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        messages: updatedMessages,
        title: prev[currentChatId].messages.length === 1 ? inputText.slice(0, 30) + (inputText.length > 30 ? "..." : "") : prev[currentChatId].title
      }
    }));

    setInputText("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputText,
          history: updatedMessages,
          timestamp: new Date().toISOString(),
          personality: BOT_PERSONALITY,
          settings: { temperature: 0.8, topP: 0.9, presencePenalty: 0.6, frequencyPenalty: 0.5 }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      setChats((prev) => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: [
            ...prev[currentChatId].messages,
            {
              type: "bot",
              text: data.response,
              timestamp: new Date().toISOString(),
            }
          ],
        }
      }));
    } catch (error) {
      console.error("API error:", error);
      setError("Connection error - please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  return (
    <div className="app-container">
      <button
        className="menu-button"
        onClick={() => setIsDrawerOpen(true)}
        aria-label="Open chat menu"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      <ChatDrawer
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSwitchChat={switchChat}
        onDeleteChat={deleteChat}
        onClose={() => setIsDrawerOpen(false)}
        isOpen={isDrawerOpen}
      />

      <div className="chat-container">
        <header className="chat-header">
          <h3>Sthamzin AI</h3>
          {error && <div className="error-message">{error}</div>}
        </header>

        <div className="chat-area">
          <div className="message-container" ref={chatBoxRef}>
            {chats[currentChatId]?.messages.map((message, index) => (
              <div key={`${message.timestamp}-${message.type}`} className={`message ${message.type}`}>
                <MessageContent message={message} />
                <div className="message-time">{formatTimestamp(message.timestamp)}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
