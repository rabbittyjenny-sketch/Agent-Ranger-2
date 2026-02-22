import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Paperclip, X, ArrowRight, ChevronDown, Sparkles, BarChart3, Zap } from 'lucide-react';

const STEPS = [
  { icon:'🏢', step:'01', title:'ตั้งค่าแบรนด์', color:'#5E9BEB',
    desc:'กรอกชื่อแบรนด์ USP กลุ่มเป้าหมาย สีและโทนเสียง เพื่อให้ AI เข้าใจบริบทของคุณก่อนตอบ' },
  { icon:'🤖', step:'02', title:'เลือก AI Agent', color:'#A78BFA',
    desc:'เลือก Cluster แล้วเลือก Agent ที่ตรงกับงาน Strategy / Creative / Growth' },
  { icon:'💬', step:'03', title:'พิมพ์หรือพูดสั่งงาน', color:'#34D399',
    desc:'กด 🎤 พูดภาษาไทย หรือแนบไฟล์ PDF รูปภาพ Word เพื่อให้ AI วิเคราะห์ได้ทันที' },
  { icon:'✨', step:'04', title:'รับผลลัพธ์พร้อมใช้', color:'#F59E0B',
    desc:'AI ตอบกลับด้วยแผนกลยุทธ์ คอนเทนต์ หรือ framework ที่ผ่าน Quality Check ทุกครั้ง' },
];

const FEATURES = [
  { icon:<Mic className="w-5 h-5"/>, color:'#5E9BEB', title:'Voice Input', titleTh:'พูดภาษาไทยได้เลย',
    desc:'กดปุ่ม 🎤 แล้วพูดคำสั่ง ระบบแปลงเสียงเป็นข้อความและส่งให้ AI ทันที\nรองรับ Chrome / Edge' },
  { icon:<Paperclip className="w-5 h-5"/>, color:'#A78BFA', title:'File Attach', titleTh:'แนบไฟล์ได้',
    desc:'แนบ JPG, PNG, PDF, Word, Text\nขนาดสูงสุด 10MB ต่อไฟล์' },
  { icon:<Sparkles className="w-5 h-5"/>, color:'#34D399', title:'Smart Routing', titleTh:'AI เลือก Agent อัตโนมัติ',
    desc:'Orchestrator วิเคราะห์คำสั่งแล้วส่งงาน\nไปยัง Agent ที่เหมาะสมที่สุด' },
];

const CLUSTERS = [
  { Icon:BarChart3, color:'#FF6B6B', name:'Strategy', nameTh:'วางกลยุทธ์',
    agents:['Market Analyzer','Positioning Strategist','Customer Insight Specialist'] },
  { Icon:Sparkles, color:'#A78BFA', name:'Creative', nameTh:'สร้างตัวตนแบรนด์',
    agents:['Visual Strategist','Brand Voice Architect','Narrative Designer'] },
  { Icon:Zap, color:'#34D399', name:'Growth', nameTh:'ขับเคลื่อนการเติบโต',
    agents:['Content Creator','Campaign Planner','Automation Specialist','Analytics Master'] },
];

const FAQS = [
  { q:'ต้องกรอกข้อมูลแบรนด์ก่อนไหม?',
    a:'แนะนำค่ะ เพราะ AI ใช้ข้อมูลแบรนด์เป็นบริบทในการตอบ ถ้ายังไม่พร้อมสามารถ Skip แล้วทดลองใช้ก่อนได้เลย' },
  { q:'Voice Input รองรับภาษาอะไร?',
    a:'รองรับภาษาไทย (TH-TH) เป็นหลักและภาษาอังกฤษ ต้องใช้ Chrome หรือ Edge ที่รองรับ Web Speech API' },
  { q:'แนบไฟล์ประเภทไหนได้บ้าง?',
    a:'JPG, PNG, GIF, PDF, Word (.doc/.docx), Text — ขนาดสูงสุด 10MB ต่อไฟล์' },
  { q:'ผลลัพธ์ถูกต้องแค่ไหน?',
    a:'มีระบบ 6-Layer Data Guard ตรวจสอบทุกคำตอบ ได้แก่ Fact Check, USP Grounding, Anti-Copycat และ Consistency Check กับข้อมูลแบรนด์ของคุณ' },
];

export const GuidePage = ({ onBack, onStartChat }) => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white overflow-x-hidden">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-[#0D1117]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <button onClick={onBack}
                  className="flex items-center gap-1.5 text-white/35 hover:text-white text-sm transition-colors">
            <X className="w-4 h-4"/> ปิดคู่มือ
          </button>
          <motion.button onClick={onStartChat}
                         whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                         className="flex items-center gap-2 bg-[#5E9BEB] hover:bg-[#4A7BC9] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            เริ่มใช้งาน <ArrowRight className="w-3.5 h-3.5"/>
          </motion.button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-24 space-y-16">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                    className="text-center">
          <div className="inline-flex items-center gap-2 bg-[#5E9BEB]/10 border border-[#5E9BEB]/20 rounded-full px-4 py-1.5 text-[#5E9BEB] text-xs mb-6">
            <Sparkles className="w-3.5 h-3.5"/> คู่มือการใช้งาน Social Factory
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            AI ที่รู้จัก<br/><span className="text-[#5E9BEB]">แบรนด์ของคุณ</span>
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
            Multi-Agent AI ช่วยสร้างกลยุทธ์และคอนเทนต์ครบวงจร เพียงบอกข้อมูลแบรนด์แล้วเลือก Agent ที่ต้องการ
          </p>
        </motion.div>

        {/* ── How it works ─────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">
            วิธีการทำงาน
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                          transition={{ delay:0.08*i+0.1 }}
                          className="rounded-2xl border border-white/[0.07] p-5 flex gap-4"
                          style={{ background:`${s.color}08` }}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</div>
                <div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full mb-2 inline-block"
                        style={{ background:s.color+'20', color:s.color }}>
                    {s.step}
                  </span>
                  <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Key Features ─────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">
            ฟีเจอร์เด่น
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                          transition={{ delay:0.08*i+0.1 }}
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                     style={{ background:f.color+'20', color:f.color }}>
                  {f.icon}
                </div>
                <p className="font-semibold text-white text-sm mb-0.5">{f.title}</p>
                <p className="text-xs text-white/30 mb-2">{f.titleTh}</p>
                <p className="text-white/40 text-sm leading-relaxed whitespace-pre-line">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Voice demo box */}
          <div className="mt-5 rounded-2xl border border-[#5E9BEB]/20 bg-[#5E9BEB]/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-11 h-11 bg-[#5E9BEB]/20 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#5E9BEB]"/>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">ตัวอย่างคำสั่งเสียง</p>
                <p className="text-white/35 text-xs">กด 🎤 แล้วพูดได้เลย</p>
              </div>
            </div>
            <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 space-y-1">
              {['"ช่วยวิเคราะห์ SWOT ของแบรนด์ฉันหน่อย"',
                '"สร้างแคปชั่น Instagram 5 แบบ"',
                '"วางแผน Campaign 30 วัน"'].map((t,i)=>(
                <p key={i} className={`text-sm font-mono ${i===0?'text-[#5E9BEB]':'text-white/30'}`}>{t}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Agent Clusters ───────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-2 text-center">
            10 AI Agents · 3 กลุ่ม
          </h2>
          <p className="text-center text-white/25 text-xs mb-6">แต่ละ Agent เชี่ยวชาญด้านที่แตกต่างกัน</p>
          <div className="space-y-3">
            {CLUSTERS.map(({ Icon, color, name, nameTh, agents }, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                          transition={{ delay:0.08*i+0.1 }}
                          className="rounded-2xl border border-white/[0.07] p-5 flex gap-4"
                          style={{ background:color+'08' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                     style={{ background:color+'20' }}>
                  <Icon className="w-5 h-5" style={{ color }}/>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-white text-sm">{nameTh}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background:color+'20', color }}>
                      {name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agents.map(a=>(
                      <span key={a} className="text-xs bg-white/5 border border-white/[0.07] px-2.5 py-1 rounded-full text-white/50">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6 text-center">
            คำถามที่พบบ่อย
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq===i ? null : i)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left">
                  <span className="text-white/75 text-sm font-medium">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 ml-3 transition-transform ${openFaq===i?'rotate-180':''}`}/>
                </button>
                <AnimatePresence>
                  {openFaq===i && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                                exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}>
                      <div className="px-5 pb-4 pt-3 text-white/45 text-sm leading-relaxed border-t border-white/[0.06]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.3 }} className="text-center">
          <div className="rounded-3xl border border-[#5E9BEB]/20 bg-gradient-to-br from-[#5E9BEB]/8 to-[#A78BFA]/8 p-10">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-2">พร้อมแล้ว!</h3>
            <p className="text-white/40 text-sm mb-7">กลับไปตั้งค่าแบรนด์แล้วเลือก Agent ที่ต้องการ</p>
            <motion.button onClick={onStartChat}
                           whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
                           className="inline-flex items-center gap-2 bg-[#5E9BEB] hover:bg-[#4A7BC9] text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors text-sm">
              เริ่มใช้งาน Social Factory <ArrowRight className="w-4 h-4"/>
            </motion.button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default GuidePage;
