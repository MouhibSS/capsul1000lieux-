import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Bonjour! Je suis votre assistant Capsul. Comment puis-je vous aider à trouver le logement parfait? 🏠' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/chat' : '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        })
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      const botMessage = { id: Date.now() + 1, role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = { id: Date.now() + 1, role: 'assistant', content: 'Erreur de connexion. Veuillez réessayer.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass flex flex-col h-full rounded-xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-outline-variant/20">
        <div>
          <h2 className="font-display text-sm font-medium tracking-[0.25em] text-gold uppercase">
            Capsul Assistant
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-gold transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-gold/15 text-on-surface border border-gold/30'
                    : 'bg-surface-container/60 text-on-surface border border-outline-variant/20'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-surface-container/60 text-on-surface px-4 py-3 rounded-lg border border-outline-variant/20">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-outline-variant/20 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Décrivez votre logement idéal..."
            disabled={loading}
            className="flex-1 px-3 py-2 bg-surface-low/50 border border-outline-variant/30 rounded-lg text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-gold/50 focus:ring-0 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
