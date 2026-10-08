import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { askAIAssistant } from '../../services/ai';

interface AssetAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  time: string;
}

export const AssetAIAssistantModal: React.FC<AssetAIAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo! Saya **ASSET AI ASSISTANT**, asisten cerdas sarana dan prasarana sekolah untuk **SIMASET SEKOLAH**.\n\nSaya dapat membantu Anda menganalisis kondisi aset, memeriksa barang dengan stok menipis, menghitung biaya pemeliharaan, serta memberikan rekomendasi manajerial inventaris.\n\nSilakan pilih salah satu pertanyaan cepat di bawah atau ajukan pertanyaan spesifik Anda.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Berapa total seluruh aset dan estimasi nilainya?',
    'Barang apa saja yang stoknya sedang menipis?',
    'Aset apa saja yang dalam kondisi rusak berat?',
    'Berapa total realisasi biaya pemeliharaan saat ini?',
    'Berikan rekomendasi inventarisasi semester ini.',
  ];

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAIAssistant(trimmed);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        source: response.source,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Maaf, terjadi kendala saat memproses permintaan Anda. Silakan coba kembali sesaat lagi.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide flex items-center gap-2">
                <span>ASSET AI ASSISTANT</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-blue-100 font-semibold">
                  Gemini Flash 3.8
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Konsultasi & Analisis Administrasi Sarana Prasarana Sekolah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-sm'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className={`mt-1.5 flex items-center justify-between text-[10px] ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                    <span>{msg.time}</span>
                    {msg.source && (
                      <span className="font-mono text-[9px]">
                        [{msg.source === 'gemini' ? 'Gemini AI 3.8' : 'Local Engine'}]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs">
                <span className="italic">Sedang menganalisis data sarpras sekolah...</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={loading}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition font-medium shrink-0 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="Tanyakan analisis aset, kondisi barang, stok, atau rekomendasi..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
