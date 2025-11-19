import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, DreamAnalysis } from '../types';
import { createDreamChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface DreamChatProps {
  analysis: DreamAnalysis;
}

const DreamChat: React.FC<DreamChatProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session when analysis is available
    if (analysis) {
      const chat = createDreamChat(analysis);
      setChatSession(chat);
      // Add initial greeting from AI
      setMessages([
        {
          role: 'model',
          text: "I've analyzed your dream. The imagery suggests deep undercurrents. What specific symbol or feeling would you like to explore further?",
          timestamp: Date.now()
        }
      ]);
    }
  }, [analysis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: input });
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: result.text || "I'm having trouble connecting to the dream realm right now.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "The connection is hazy. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-night-800/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-lg font-serif text-dream-purple">Dream Guide</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-dream-purple text-white rounded-br-none' 
                : 'bg-slate-700/50 text-slate-200 rounded-bl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-night-900/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a symbol..."
            className="flex-1 bg-night-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-dream-purple focus:ring-1 focus:ring-dream-purple transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-dream-purple hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreamChat;