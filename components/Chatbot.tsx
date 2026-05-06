
import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';
import { chatWithAuditor } from '../services/geminiService';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: '¡Hola! Soy tu asistente de Trade Marketing. ¿Tienes dudas sobre qué materiales implementar en una cadena específica?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsLoading(true);
    const botResponse = await chatWithAuditor(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-[#1e3a5f] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] border-4 border-white"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-[90vw] max-w-[350px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="bg-[#1e3a5f] p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <span className="font-black text-xs uppercase tracking-widest">Asistente Auditores</span>
        </div>
        <button onClick={() => setIsOpen(false)}><X size={20}/></button>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px] bg-slate-50 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-bold ${
              m.role === 'user' ? 'bg-[#1e3a5f] text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm rounded-tl-none border border-slate-100'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={12} />
              <span className="text-[10px] font-black text-slate-400">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text" 
          className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-[11px] font-black outline-none focus:ring-2 focus:ring-blue-100" 
          placeholder="Ej: ¿Qué material va en Oxxo?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          className="p-3 bg-[#1e3a5f] text-white rounded-xl shadow-lg active:scale-90 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
