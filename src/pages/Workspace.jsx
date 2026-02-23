import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Paperclip, Mic, Settings, X, AlertCircle,
  BookOpen, ChevronRight, Check, MessageSquare, KeyRound, Eye, EyeOff,
  Wand2, Volume2
} from 'lucide-react';
import { getAllAgents } from '../data/agents';
import { aiService } from '../services/aiService';

// ── Cluster config ────────────────────────────────────────────────────────────
const CLUSTER_CFG = {
  strategy: { label: 'Strategy', labelTh: 'วางกลยุทธ์', color: '#FF6B6B', dot: '#FF6B6B' },
  creative:  { label: 'Creative', labelTh: 'สร้างสรรค์',  color: '#A78BFA', dot: '#A78BFA' },
  growth:    { label: 'Growth',   labelTh: 'ขับเคลื่อน',  color: '#34D399', dot: '#34D399' },
};

// ── Shared neumorphism helpers ─────────────────────────────────────────────────
const NEU = {
  raised: { boxShadow: '6px 6px 16px #d1d9e6, -6px -6px 16px #ffffff' },
  raisedSm: { boxShadow: '3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff' },
  inset: { boxShadow: 'inset 3px 3px 8px #d1d9e6, inset -3px -3px 8px #ffffff' },
  insetSm: { boxShadow: 'inset 2px 2px 6px #d1d9e6, inset -2px -2px 6px #ffffff' },
};

// ── Markdown renderer ─────────────────────────────────────────────────────────
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
};

const MarkdownText = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let key = 0;
  for (const line of lines) {
    if (line.startsWith('### '))
      elements.push(<div key={key++} className="font-bold text-gray-900 mt-3 mb-1 text-sm">{renderInline(line.slice(4))}</div>);
    else if (line.startsWith('## '))
      elements.push(<div key={key++} className="font-bold text-gray-900 mt-3 mb-1">{renderInline(line.slice(3))}</div>);
    else if (/^[\s]*[-•*]\s/.test(line) || /^\s*\d+\.\s/.test(line))
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5 ml-2">
          <span className="text-gray-400 flex-shrink-0 mt-0.5">›</span>
          <span>{renderInline(line.replace(/^[\s]*[-•*]\s/, '').replace(/^\s*\d+\.\s/, ''))}</span>
        </div>
      );
    else if (line.trim() === '---')
      elements.push(<hr key={key++} className="my-2 border-gray-200" />);
    else if (line.trim() === '')
      elements.push(<div key={key++} className="h-1" />);
    else
      elements.push(<div key={key++} className="my-0.5 leading-relaxed">{renderInline(line)}</div>);
  }
  return <div className="text-sm space-y-0.5">{elements}</div>;
};

// ══════════════════════════════════════════════════════════════════════════════
// HOISTED COMPONENTS (outside Workspace — prevents input lag on re-render)
// ══════════════════════════════════════════════════════════════════════════════

// ── API Key Modal (Hoisted) ───────────────────────────────────────────────────
const ApiKeyModal = ({ onClose }) => {
  const [anthropicKey, setAnthropicKey] = useState(
    () => localStorage.getItem('socialFactory_anthropicKey') || ''
  );
  const [elevenKey, setElevenKey] = useState(
    () => localStorage.getItem('socialFactory_elevenKey') || ''
  );
  const [showA, setShowA] = useState(false);
  const [showE, setShowE] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (anthropicKey.trim()) localStorage.setItem('socialFactory_anthropicKey', anthropicKey.trim());
    else localStorage.removeItem('socialFactory_anthropicKey');
    if (elevenKey.trim()) localStorage.setItem('socialFactory_elevenKey', elevenKey.trim());
    else localStorage.removeItem('socialFactory_elevenKey');
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const hasAnthropicKey = !!anthropicKey.trim();
  const inpClass = "w-full bg-[#EFF2F9] outline-none text-sm font-sarabun text-gray-700 placeholder-gray-400 pr-10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm mx-4 rounded-3xl p-6"
        style={{ background: '#EFF2F9', ...NEU.raised }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
            <KeyRound className="w-5 h-5" style={{ color: '#5E9BEB' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-700 text-sm">ตั้งค่า API Keys</h3>
            <p className="text-xs text-gray-400 font-sarabun">เก็บใน Browser เท่านั้น ไม่ส่งออกไปไหน</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
            style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Anthropic Key */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-xs font-semibold text-gray-600">Anthropic API Key</label>
              <span className="text-xs text-rose-400 font-medium">(จำเป็น)</span>
              {hasAnthropicKey && <span className="ml-auto text-xs text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> ตั้งค่าแล้ว</span>}
            </div>
            <div className="relative rounded-xl" style={{ ...NEU.inset, background: '#EFF2F9' }}>
              <input
                type={showA ? 'text' : 'password'}
                value={anthropicKey}
                onChange={e => setAnthropicKey(e.target.value)}
                className={`${inpClass} px-3 py-2.5 rounded-xl`}
                placeholder="sk-ant-api03-..."
              />
              <button type="button" onClick={() => setShowA(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 font-sarabun">
              รับได้ที่ <span className="text-blue-400">console.anthropic.com</span>
            </p>
          </div>

          {/* ElevenLabs Key */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-xs font-semibold text-gray-600">ElevenLabs API Key</label>
              <span className="text-xs text-gray-400">(ไม่บังคับ — สำหรับอ่านออกเสียง)</span>
            </div>
            <div className="relative rounded-xl" style={{ ...NEU.inset, background: '#EFF2F9' }}>
              <input
                type={showE ? 'text' : 'password'}
                value={elevenKey}
                onChange={e => setElevenKey(e.target.value)}
                className={`${inpClass} px-3 py-2.5 rounded-xl`}
                placeholder="sk_..."
              />
              <button type="button" onClick={() => setShowE(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showE ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 font-sarabun">
              รับได้ที่ <span className="text-blue-400">elevenlabs.io</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-sarabun text-gray-500 transition-colors"
            style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
            ยกเลิก
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: saved ? '#34D399' : '#5E9BEB' }}>
            {saved ? <><Check className="w-4 h-4" /> บันทึกแล้ว!</> : <><Check className="w-4 h-4" /> บันทึก</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Brand Context Popup (Hoisted) ─────────────────────────────────────────────
const BrandPopup = ({ masterContext, onSave, onClose }) => {
  const [form, setForm] = useState({
    brandNameTh: masterContext?.brandNameTh || '',
    brandNameEn: masterContext?.brandNameEn || '',
    industry: masterContext?.industry || '',
    coreUSP: Array.isArray(masterContext?.coreUSP) ? masterContext.coreUSP.join(', ') : (masterContext?.coreUSP || ''),
    targetAudience: masterContext?.targetAudience || '',
    toneOfVoice: masterContext?.toneOfVoice || 'professional',
    primaryColor: masterContext?.visualStyle?.primaryColor || '#5E9BEB',
    moodKeywords: (masterContext?.visualStyle?.moodKeywords || []).join(', '),
  });

  const handle = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    const ctx = {
      ...(masterContext || {}),
      brandId: masterContext?.brandId || `brand_${Date.now()}`,
      brandNameTh: form.brandNameTh || 'แบรนด์ของฉัน',
      brandNameEn: form.brandNameEn || 'My Brand',
      industry: form.industry || 'ธุรกิจทั่วไป',
      coreUSP: form.coreUSP.split(',').map(s => s.trim()).filter(Boolean),
      targetAudience: form.targetAudience || 'ผู้ใช้ทั่วไป',
      toneOfVoice: form.toneOfVoice,
      visualStyle: {
        primaryColor: form.primaryColor,
        moodKeywords: form.moodKeywords.split(',').map(s => s.trim()).filter(Boolean),
      },
      isDefault: false,
      createdAt: masterContext?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    onSave(ctx);
  };

  const tones = ['professional', 'casual', 'playful', 'formal', 'luxury'];
  const inputClass = "w-full bg-[#EFF2F9] border-none outline-none rounded-xl px-3 py-2 text-sm font-sarabun text-gray-700 placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md mx-4 rounded-3xl p-6"
        style={{ background: '#EFF2F9', ...NEU.raised }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-800 text-base">⚙ ข้อมูลแบรนด์</h3>
            <p className="text-xs text-gray-400 font-sarabun mt-0.5">Rangers จะใช้ข้อมูลนี้ตอบคำถาม</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
            style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">ชื่อแบรนด์ (TH)</label>
              <div style={NEU.insetSm} className="rounded-xl">
                <input className={inputClass} value={form.brandNameTh}
                  onChange={e => handle('brandNameTh', e.target.value)} placeholder="เช่น บริษัทดีดี" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Brand Name (EN)</label>
              <div style={NEU.insetSm} className="rounded-xl">
                <input className={inputClass} value={form.brandNameEn}
                  onChange={e => handle('brandNameEn', e.target.value)} placeholder="e.g. DeeD Co." />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">อุตสาหกรรม</label>
            <div style={NEU.insetSm} className="rounded-xl">
              <input className={inputClass} value={form.industry}
                onChange={e => handle('industry', e.target.value)} placeholder="เช่น อาหาร, ความงาม, ท่องเที่ยว" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">จุดขายหลัก (USP) — คั่นด้วยจุลภาค</label>
            <div style={NEU.insetSm} className="rounded-xl">
              <textarea className={`${inputClass} resize-none`} rows={2} value={form.coreUSP}
                onChange={e => handle('coreUSP', e.target.value)}
                placeholder="เช่น ส่งเร็ว, ราคาถูก, คุณภาพสูง" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">กลุ่มเป้าหมาย</label>
            <div style={NEU.insetSm} className="rounded-xl">
              <input className={inputClass} value={form.targetAudience}
                onChange={e => handle('targetAudience', e.target.value)} placeholder="เช่น คนทำงานอายุ 25-35 ปี" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tone of Voice</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {tones.map(t => (
                <button key={t} onClick={() => handle('toneOfVoice', t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={form.toneOfVoice === t
                    ? { background: '#5E9BEB', color: '#fff' }
                    : { background: '#EFF2F9', color: '#64748b', ...NEU.raisedSm }
                  }>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Mood Keywords — คั่นด้วยจุลภาค</label>
            <div style={NEU.insetSm} className="rounded-xl">
              <input className={inputClass} value={form.moodKeywords}
                onChange={e => handle('moodKeywords', e.target.value)} placeholder="เช่น modern, warm, luxury" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-sarabun text-gray-500 transition-colors"
            style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
            ยกเลิก
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: '#5E9BEB' }}>
            <Check className="w-4 h-4" /> บันทึก
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Agent Card (Hoisted — zero-lag on re-render) ──────────────────────────────
const AgentCard = React.memo(({ agent, isActive, hasChat, clusterColor, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={!isActive ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.97 }}
      className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all w-full"
      style={isActive
        ? {
            background: '#EFF2F9',
            boxShadow: 'inset 3px 3px 8px #d1d9e6, inset -3px -3px 8px #ffffff',
            borderBottom: `2.5px solid ${clusterColor}`,
          }
        : {
            background: '#EFF2F9',
            boxShadow: '4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff',
          }
      }
    >
      {/* Active glow dot */}
      {isActive && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
          style={{ background: clusterColor }}
        />
      )}

      {/* Unread dot */}
      {!isActive && hasChat && (
        <span
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
          style={{ background: clusterColor }}
        />
      )}

      {/* Emoji */}
      <span className="text-2xl leading-none">{agent.emoji}</span>

      {/* Name */}
      <span
        className="text-[10.5px] font-semibold leading-tight font-sarabun line-clamp-2"
        style={{ color: isActive ? clusterColor : '#64748b' }}
      >
        {agent.name}
      </span>
    </motion.button>
  );
});
AgentCard.displayName = 'AgentCard';

// ── Main Workspace ─────────────────────────────────────────────────────────────
export const Workspace = ({ masterContext, onContextUpdate, onOpenGuide }) => {
  const allAgents = getAllAgents();
  const clusters = ['strategy', 'creative', 'growth'];

  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [chatSessions, setChatSessions] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(() => !!localStorage.getItem('socialFactory_anthropicKey'));

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const selectedAgent = allAgents.find(a => a.id === selectedAgentId);
  const currentMessages = chatSessions[selectedAgentId] || [];

  // Speech API init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const r = new SpeechRecognition();
      r.continuous = false;
      r.interimResults = true;
      r.lang = 'th-TH';
      r.onstart = () => setIsListening(true);
      r.onend = () => setIsListening(false);
      r.onresult = (ev) => {
        let t = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) t += ev.results[i][0].transcript;
        if (t) setInputValue(t);
      };
      r.onerror = () => setIsListening(false);
      recognitionRef.current = r;
    }
  }, []);

  useEffect(() => {
    if (masterContext) aiService.initialize(masterContext);
  }, [masterContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  const handleSelectAgent = useCallback((agentId) => {
    setSelectedAgentId(agentId);
    setError(null);
    const ag = allAgents.find(a => a.id === agentId);
    if (!ag) return;
    if (!chatSessions[agentId]) {
      const greeting = {
        id: Date.now(),
        sender: 'agent',
        text: `สวัสดีค่ะ! ฉันคือ **${ag.name}** ${ag.emoji}\n\n${ag.description}\n\nบอกได้เลยค่ะ ต้องการให้ช่วยเรื่องอะไร?`,
        timestamp: new Date(),
        confidence: 100,
      };
      setChatSessions(prev => ({ ...prev, [agentId]: [greeting] }));
    }
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [allAgents, chatSessions]);

  const handleSpeechToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else { setInputValue(''); recognitionRef.current.start(); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { setError(`ไฟล์ ${file.name} ใหญ่เกินไป (สูงสุด 10MB)`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, { name: file.name, type: file.type, size: file.size, data: ev.target?.result }]);
        if (file.type.startsWith('image/')) setPreviewUrls(prev => ({ ...prev, [file.name]: ev.target?.result }));
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (name) => {
    setAttachments(prev => prev.filter(f => f.name !== name));
    setPreviewUrls(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() && attachments.length === 0) return;
    if (!selectedAgentId) return;

    setError(null);
    const userText = inputValue.trim() || `[แนบไฟล์: ${attachments.map(a => a.name).join(', ')}]`;
    const userMsg = {
      id: Date.now(), sender: 'user', text: userText, timestamp: new Date(),
      attachments: attachments.map(a => ({ name: a.name, type: a.type, size: a.size })),
    };

    setChatSessions(prev => ({ ...prev, [selectedAgentId]: [...(prev[selectedAgentId] || []), userMsg] }));
    setInputValue('');
    setAttachments([]);
    setPreviewUrls({});
    setIsLoading(true);

    try {
      const response = await aiService.processMessage({
        userInput: userText,
        context: masterContext,
        forceAgent: selectedAgentId,
        attachments,
      });
      const agentMsg = {
        id: Date.now() + 1, sender: 'agent', text: response.content,
        timestamp: new Date(), confidence: response.confidence, agentName: response.agentName,
        factCheckResult: response.factCheckResult,
      };
      setChatSessions(prev => ({ ...prev, [selectedAgentId]: [...(prev[selectedAgentId] || []), agentMsg] }));
    } catch (err) {
      const msg = err?.message?.includes('401')
        ? '⚠️ API Key ไม่ถูกต้อง — กรุณาคลิก 🔑 เพื่อตั้งค่า API Key'
        : err?.message?.includes('fetch')
          ? '⚠️ เชื่อมต่อ API ไม่ได้ — กรุณาตรวจสอบ API Key หรือ network'
          : `⚠️ ${err.message || 'เกิดข้อผิดพลาด'}`;
      setChatSessions(prev => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] || []), {
          id: Date.now() + 1, sender: 'agent', text: msg, timestamp: new Date(), isError: true
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const handleBrandSave = (ctx) => {
    localStorage.setItem('socialFactory_masterContext', JSON.stringify(ctx));
    onContextUpdate(ctx);
    setShowBrandPopup(false);
  };

  const handleApiKeyClose = () => {
    setShowApiKeyModal(false);
    setHasApiKey(!!localStorage.getItem('socialFactory_anthropicKey'));
  };

  const hasBrand = masterContext && !masterContext.isDefault && masterContext.brandNameTh;

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: '#EFF2F9' }}>

      {/* ════════════════════════════════════════════════════════
          LEFT SIDEBAR — 2-Column Neumorphism Agent Cards
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -310, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -310, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-shrink-0 flex flex-col h-full overflow-hidden"
            style={{ width: 300, background: '#EFF2F9', borderRight: '1px solid rgba(209,217,230,0.6)' }}
          >
            {/* ── Sidebar Header ── */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-200">
              {/* Top row: logo + action buttons */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#5E9BEB' }} />
                </div>
                <span className="font-bold text-slate-700 text-sm flex-1">Social Factory</span>

                {/* Guide button */}
                {onOpenGuide && (
                  <button onClick={onOpenGuide}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                    title="คู่มือ">
                    <BookOpen className="w-4 h-4" />
                  </button>
                )}

                {/* API Key button */}
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: hasApiKey ? '#34D399' : '#f59e0b' }}
                  title={hasApiKey ? 'API Key ตั้งค่าแล้ว' : 'ตั้งค่า API Key'}
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </div>

              {/* API Key notice */}
              {!hasApiKey && (
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sarabun text-amber-600 mb-2 transition-all"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
                >
                  <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>ยังไม่ได้ตั้งค่า API Key — คลิกเพื่อตั้งค่า</span>
                </button>
              )}

              {/* Brand indicator */}
              {hasBrand ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: '#EFF2F9', ...NEU.insetSm }}>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-xs text-gray-600 font-sarabun truncate flex-1">{masterContext.brandNameTh}</span>
                  <button onClick={() => setShowBrandPopup(true)} className="text-gray-400 hover:text-blue-500 flex-shrink-0">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowBrandPopup(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sarabun text-blue-500 transition-colors"
                  style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
                  <Settings className="w-3.5 h-3.5" />
                  ตั้งค่าแบรนด์
                </button>
              )}
            </div>

            {/* ── Agent List (2-column grid per cluster) ── */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
              {clusters.map(cluster => {
                const cfg = CLUSTER_CFG[cluster];
                const agents = allAgents.filter(a => a.cluster === cluster);
                return (
                  <div key={cluster}>
                    {/* Cluster label */}
                    <div className="flex items-center gap-2 mb-2.5 px-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cfg.labelTh}</span>
                      <div className="flex-1 h-px" style={{ background: `${cfg.color}30` }} />
                    </div>

                    {/* 2-column grid of agent cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {agents.map(agent => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          isActive={agent.id === selectedAgentId}
                          hasChat={chatSessions[agent.id]?.length > 1}
                          clusterColor={cfg.color}
                          onClick={() => handleSelectAgent(agent.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          CENTER PANEL — Chat Area
      ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* Chat header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200"
          style={{ background: '#EFF2F9' }}>

          {/* Sidebar toggle */}
          <button onClick={() => setSidebarOpen(v => !v)}
            className="p-2 rounded-xl transition-colors flex-shrink-0"
            style={{ background: '#EFF2F9', ...NEU.raisedSm, color: '#64748b' }}>
            <MessageSquare className="w-4 h-4" />
          </button>

          {selectedAgent ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
                {selectedAgent.emoji}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-700 text-sm truncate">{selectedAgent.name}</p>
                <p className="text-xs text-gray-400 truncate font-sarabun">{selectedAgent.description}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 px-3 py-1 rounded-full"
                style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-500 font-sarabun hidden sm:block">Online</span>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <p className="font-semibold text-slate-600 text-sm font-sarabun">เลือก Ranger จากด้านซ้าย</p>
              <p className="text-xs text-gray-400 font-sarabun">10 Rangers พร้อมช่วยเหลือ</p>
            </div>
          )}
        </div>

        {/* No brand notice */}
        {!hasBrand && (
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-sarabun"
            style={{ background: '#FFF9C4', borderBottom: '1px solid #F9E47C', color: '#92620D' }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>ยังไม่ได้ตั้งค่าแบรนด์ — Rangers จะถามข้อมูลระหว่างแชท หรือ</span>
            <button onClick={() => setShowBrandPopup(true)} className="underline font-bold">ตั้งค่าเดี๋ยวนี้</button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-sarabun flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {!selectedAgent ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                  style={{ background: '#EFF2F9', ...NEU.raised }}>
                  <Sparkles className="w-7 h-7" style={{ color: '#5E9BEB' }} />
                </div>
                <p className="font-bold text-slate-600 text-base mb-1 font-sarabun">เลือก Ranger ที่ต้องการ</p>
                <p className="text-sm text-gray-400 font-sarabun max-w-xs">คลิก Ranger ในรายการด้านซ้ายเพื่อเริ่มสนทนา</p>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="text-center py-16 text-gray-400 font-sarabun">กำลังโหลด...</div>
            ) : (
              currentMessages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2.5 max-w-[85%] sm:max-w-[78%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.sender === 'agent' && (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-1 ${msg.isError ? 'bg-red-100' : ''}`}
                        style={!msg.isError ? { background: '#EFF2F9', ...NEU.raisedSm } : {}}>
                        {msg.isError ? '⚠️' : (selectedAgent?.emoji || '🤖')}
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.isError
                        ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-sm'
                        : msg.sender === 'user'
                          ? 'text-white rounded-br-sm'
                          : 'rounded-bl-sm'
                    }`}
                      style={msg.sender === 'user'
                        ? { background: '#5E9BEB', boxShadow: '3px 3px 8px rgba(94,155,235,0.3)' }
                        : msg.isError ? {}
                        : { background: '#EFF2F9', boxShadow: '4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff' }
                      }>
                      {msg.sender === 'user'
                        ? <p className="text-sm font-sarabun whitespace-pre-wrap">{msg.text}</p>
                        : <MarkdownText text={msg.text} />
                      }
                      <div className={`text-xs mt-1.5 flex flex-wrap gap-2 ${msg.sender === 'user' ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                        <span>{(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.confidence && msg.confidence < 100 && <span>🎯 {Math.round(msg.confidence * 100)}%</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
                    {selectedAgent?.emoji || '🤖'}
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
                    style={{ background: '#EFF2F9', boxShadow: '4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff' }}>
                    <div className="flex gap-1 items-center h-5">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#5E9BEB' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            INPUT BAR — Neumorphism style with attachments + voice
        ════════════════════════════════════════════════════════ */}
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3"
          style={{ background: '#EFF2F9' }}>

          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map(att => (
                <div key={att.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                  style={{ background: '#EFF2F9', ...NEU.raisedSm }}>
                  {att.type.startsWith('image/') ? (
                    <img src={previewUrls[att.name]} alt={att.name} className="w-6 h-6 object-cover rounded" />
                  ) : <Paperclip className="w-3 h-3 text-gray-500" />}
                  <span className="text-gray-600 max-w-[80px] truncate">{att.name}</span>
                  <button onClick={() => removeAttachment(att.name)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2">

            {/* Attach file */}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
              className="p-2.5 rounded-xl flex-shrink-0 transition-colors"
              style={{ background: '#EFF2F9', ...NEU.raisedSm, color: '#64748b' }}
              title="แนบไฟล์หรือรูปภาพ">
              <Paperclip className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx" />

            {/* Voice inspiration (speech-to-text) */}
            {speechSupported && (
              <motion.button
                type="button"
                onClick={handleSpeechToggle}
                disabled={isLoading}
                whileTap={{ scale: 0.92 }}
                className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${isListening ? 'text-white' : ''}`}
                style={isListening
                  ? { background: '#ef4444', boxShadow: '0 0 0 4px rgba(239,68,68,0.2)' }
                  : { background: '#EFF2F9', ...NEU.raisedSm, color: '#64748b' }
                }
                title={isListening ? 'กำลังฟัง... คลิกเพื่อหยุด' : 'พูดข้อความ (Thai)'}
              >
                {isListening
                  ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      <Mic className="w-4 h-4" />
                    </motion.div>
                  : <Mic className="w-4 h-4" />
                }
              </motion.button>
            )}

            {/* Text input — inset neumorphism */}
            <div className="flex-1 relative">
              <div style={{ background: '#EFF2F9', ...NEU.inset, borderRadius: 14 }}>
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !selectedAgentId}
                  rows={1}
                  placeholder={
                    isListening
                      ? '🎙 กำลังฟัง...'
                      : selectedAgent
                        ? `บอก ${selectedAgent.name} ว่าต้องการอะไร...`
                        : 'เลือก Ranger ก่อนพิมพ์...'
                  }
                  className="w-full bg-transparent outline-none px-4 py-2.5 text-sm font-sarabun text-gray-700 placeholder-gray-400 resize-none max-h-32"
                  style={{ lineHeight: '1.5' }}
                />
              </div>
            </div>

            {/* Brand settings */}
            <button type="button" onClick={() => setShowBrandPopup(true)}
              className="p-2.5 rounded-xl flex-shrink-0 transition-colors"
              style={{ background: '#EFF2F9', ...NEU.raisedSm, color: hasBrand ? '#5E9BEB' : '#94a3b8' }}
              title="ข้อมูลแบรนด์">
              <Settings className="w-4 h-4" />
            </button>

            {/* Send */}
            <motion.button type="submit"
              disabled={isLoading || (!inputValue.trim() && attachments.length === 0) || !selectedAgentId}
              whileTap={{ scale: 0.93 }}
              className="p-2.5 rounded-xl flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
              style={{ background: '#5E9BEB', boxShadow: '3px 3px 8px rgba(94,155,235,0.4), -2px -2px 6px rgba(255,255,255,0.7)' }}>
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBrandPopup && (
          <BrandPopup masterContext={masterContext} onSave={handleBrandSave} onClose={() => setShowBrandPopup(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApiKeyModal && (
          <ApiKeyModal onClose={handleApiKeyClose} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workspace;
