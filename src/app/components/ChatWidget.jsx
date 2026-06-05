'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const INITIAL_SUGGESTIONS = [
  'Rekomendasi menu harian',
  'Apa itu stunting?',
  'Camilan sehat anak',
  'Tips anak susah makan',
];

const BOT_WELCOME = {
  role: 'bot',
  text: 'Halo! 👋 Saya **NutriBot**, asisten gizi anak Anda. Tanyakan seputar menu makan, kebutuhan kalori, atau nutrisi anak!',
  suggestions: INITIAL_SUGGESTIONS,
  mealCards: null,
  timestamp: new Date().toISOString(),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([BOT_WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Send message
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    // Add user message
    const userMsg = { role: 'user', text: trimmed, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const json = await res.json();

      if (json.success) {
        const botMsg = {
          role: 'bot',
          text: json.data.text,
          suggestions: json.data.suggestions,
          mealCards: json.data.mealCards,
          timestamp: json.data.timestamp,
        };
        // Small delay for typing feel
        setTimeout(() => {
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
        }, 400 + Math.random() * 600);
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: '⚠️ Maaf, terjadi kesalahan. Silakan coba lagi.',
            suggestions: INITIAL_SUGGESTIONS,
            mealCards: null,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Parse markdown bold (**text**) into <strong> elements
  const renderText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  // Get latest suggestions
  const latestSuggestions = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'bot' && messages[i].suggestions?.length) {
        return messages[i].suggestions;
      }
    }
    return INITIAL_SUGGESTIONS;
  })();

  return (
    <>
      {/* ─── Floating Action Button ─── */}
      <button
        id="chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-fab ${isOpen ? 'chat-fab--active' : ''}`}
        aria-label={isOpen ? 'Tutup chat' : 'Buka NutriBot chat'}
      >
        {/* Pulse ring animation */}
        {!isOpen && <span className="chat-fab__pulse" />}

        {/* Icon morphing */}
        <span className={`chat-fab__icon ${isOpen ? 'chat-fab__icon--close' : ''}`}>
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </span>
      </button>

      {/* ─── Chat Panel ─── */}
      <div className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`}>
        {/* Header */}
        <div className="chat-panel__header">
          <div className="flex items-center gap-3">
            <div className="chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">NutriBot</h3>
              <p className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                Online — Siap membantu
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Tutup chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-panel__messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role === 'user' ? 'chat-message--user' : 'chat-message--bot'}`}>
              {msg.role === 'bot' && (
                <div className="chat-message__avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
              )}
              <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--bot'}`}>
                <div className="chat-bubble__text">{renderText(msg.text)}</div>

                {/* Meal Cards */}
                {msg.mealCards && msg.mealCards.length > 0 && (
                  <div className="chat-meal-cards">
                    {msg.mealCards.map((meal, mIdx) => (
                      <div key={mIdx} className="chat-meal-card">
                        <div className="chat-meal-card__header">
                          <span className="chat-meal-card__type">{meal.mealTypeLabel}</span>
                          <span className="chat-meal-card__cal">{meal.calories} Kkal</span>
                        </div>
                        <h4 className="chat-meal-card__name">{meal.foodName}</h4>
                        <div className="chat-meal-card__macros">
                          <span>P: {meal.protein}g</span>
                          <span>K: {meal.carbs}g</span>
                          <span>L: {meal.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-message chat-message--bot">
              <div className="chat-message__avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div className="chat-bubble chat-bubble--bot">
                <div className="chat-typing">
                  <span className="chat-typing__dot" />
                  <span className="chat-typing__dot" />
                  <span className="chat-typing__dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {!isTyping && latestSuggestions.length > 0 && (
          <div className="chat-suggestions">
            {latestSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="chat-suggestion-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="chat-panel__input">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda..."
            className="chat-input"
            disabled={isTyping}
            maxLength={500}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="chat-send-btn"
            aria-label="Kirim pesan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
