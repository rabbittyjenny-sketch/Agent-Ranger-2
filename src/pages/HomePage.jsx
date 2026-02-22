import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Zap, BarChart3, ChevronRight, TrendingUp, Palette, Rocket } from 'lucide-react';

/* Floating particle */
const Dot = ({ x, y, size, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: 'rgba(94,155,235,0.18)' }}
    animate={{ y: [0, -12, 0], opacity: [0.1, 0.45, 0.1] }}
    transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

/* Cluster Card — spec: min-height 240px, rounded-2xl, hover scale 1.03 */
const ICONS = { strategy: BarChart3, creative: Palette, growth: Zap };

const ClusterCard = ({ cluster, index, onSelect }) => {
  const Icon = ICONS[cluster.id] || Sparkles;
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(0,0,0,0.1), 8px 8px 20px #d1d9e6, -8px -8px 20px #ffffff' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(cluster.id)}
      className="group relative w-full text-left cursor-pointer"
      style={{
        background: '#EFF2F9',
        boxShadow: '6px 6px 16px #d1d9e6, -6px -6px 16px #ffffff',
        borderRadius: 24,
        padding: '28px 24px',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
      }}
    >
      {/* Icon + badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#EFF2F9', boxShadow: `3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff` }}
        >
          <Icon className="w-5 h-5" style={{ color: cluster.color }} />
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full font-en"
          style={{ background: cluster.color + '15', color: cluster.color, border: `1px solid ${cluster.color}30` }}
        >
          {cluster.agentCount} agents
        </span>
      </div>

      <p className="font-bold text-slate-700 mb-1 font-en text-base">{cluster.name}</p>
      <p className="text-sm text-slate-500 mb-2 font-sarabun">{cluster.nameTh}</p>
      <p className="text-slate-400 text-sm leading-relaxed font-sarabun flex-1">{cluster.description}</p>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold font-en" style={{ color: cluster.color }}>
        Click for details
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
};

/* Quick Step — Section 3 */
const QuickStep = ({ number, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-start gap-4"
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-en"
      style={{ background: '#EFF2F9', boxShadow: '3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff', color: '#5E9BEB' }}
    >
      {number}
    </div>
    <div className="pt-1">
      <p className="font-bold text-slate-700 text-sm font-en mb-0.5">{title}</p>
      <p className="text-slate-400 text-xs leading-relaxed font-sarabun">{desc}</p>
    </div>
  </motion.div>
);

/* MAIN */
export const HomePage = ({ onSelectCluster, onStartOnboarding, isLoggedIn, onOpenGuide }) => {
  const [phase, setPhase] = useState('splash');

  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i, x: 5 + (i * 8.2) % 90, y: 8 + (i * 13.5) % 84, size: 3 + (i % 3) * 2, delay: i * 0.3,
  }));

  const clusters = [
    { id: 'strategy', name: 'Strategy', nameTh: 'วางกลยุทธ์', description: 'วิเคราะห์ตลาด · กำหนดตำแหน่งแบรนด์ · เข้าใจ Customer Journey', agentCount: 3, color: '#e85d5d' },
    { id: 'creative', name: 'Creative', nameTh: 'สร้างตัวตนแบรนด์', description: 'Visual System · Brand Voice · เล่าเรื่องราวของแบรนด์', agentCount: 3, color: '#9061e5' },
    { id: 'growth', name: 'Growth', nameTh: 'ขับเคลื่อนการเติบโต', description: 'คอนเทนต์ · Campaign 30 วัน · Automation · Analytics KPI', agentCount: 4, color: '#059669' },
  ];

  /* ── Splash (หน้า 1: Landing / Rangers Hub) ─────────────── */
  if (phase === 'splash') return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#EFF2F9' }}
    >
      {dots.map(d => <Dot key={d.id} {...d} />)}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'rgba(94,155,235,0.07)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'rgba(144,97,229,0.06)', filter: 'blur(80px)' }} />

      {/* Section 1: Hero — กลางจอ, max-width 480 */}
      <div className="relative text-center px-6 select-none w-full mx-auto" style={{ maxWidth: 480 }}>
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo icon */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{ background: '#EFF2F9', boxShadow: '8px 8px 20px #d1d9e6, -8px -8px 20px #ffffff' }}
          >
            <Sparkles className="w-9 h-9" style={{ color: '#5E9BEB' }} />
          </motion.div>

          {/* Logo name */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight font-en mb-2"
            style={{ color: '#334155' }}
          >
            Social Factory
          </motion.h1>

          {/* Tagline — 1 บรรทัด */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-sarabun mb-8"
            style={{ color: '#94a3b8' }}
          >
            AI-Powered Brand &amp; Marketing Platform
          </motion.p>
        </motion.div>

        {/* ปุ่ม Start Working — h-48px, r-999px (spec) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.55 }}
        >
          <motion.button
            onClick={() => setPhase('ripple')}
            whileHover={{ boxShadow: '8px 8px 24px rgba(94,155,235,0.45), -4px -4px 12px rgba(255,255,255,0.9)' }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-3 font-semibold text-base overflow-hidden"
            style={{
              background: '#5E9BEB', borderRadius: 999, color: '#fff',
              height: 48, paddingLeft: 36, paddingRight: 36,
              boxShadow: '4px 4px 14px rgba(94,155,235,0.4), -2px -2px 8px rgba(255,255,255,0.7)',
              fontFamily: 'Inter, sans-serif', border: 'none', cursor: 'pointer',
            }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)', width: '50%' }}
            />
            <span className="relative">Start Working</span>
            <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <p className="text-xs mt-4 font-en tracking-widest" style={{ color: '#cbd5e1' }}>
            PRESS TO CONTINUE
          </p>
        </motion.div>
      </div>
    </div>
  );

  /* ── Ripple ─────────────────────────────────────────────── */
  if (phase === 'ripple') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EFF2F9' }}>
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 30, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setPhase('main')}
        className="w-6 h-6 rounded-full"
        style={{ background: '#5E9BEB' }}
      />
    </div>
  );

  /* ── Main (หน้า 2: Discovered Agents) ───────────────────── */
  return (
    <div className="min-h-screen" style={{ background: '#EFF2F9' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: 'rgba(94,155,235,0.05)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'rgba(144,97,229,0.04)', filter: 'blur(120px)' }} />
      </div>

      {/* spec: max-width 1100px กลางจอ, padding 80px top/bottom */}
      <div className="relative z-10 mx-auto px-6 sm:px-10" style={{ maxWidth: 1100, paddingTop: 48, paddingBottom: 80 }}>

        {/* Nav bar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-12 pb-5"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#EFF2F9', boxShadow: '3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#5E9BEB' }} />
            </div>
            <span className="font-bold text-slate-700 font-en text-sm">Social Factory</span>
          </div>

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
              style={{ background: '#EFF2F9', boxShadow: '3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: '#5E9BEB' }} />
              <span className="hidden sm:inline font-sarabun">คู่มือ</span>
            </button>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: '#EFF2F9', boxShadow: '3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" />
              <span className="text-xs font-sarabun" style={{ color: '#059669' }}>System Ready</span>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onStartOnboarding}
              className="px-5 py-2 rounded-xl text-sm font-sarabun font-semibold"
              style={{ background: '#5E9BEB', color: '#fff', border: 'none', cursor: 'pointer', height: 40 }}
            >
              + ตั้งค่าแบรนด์
            </motion.button>
          )}
        </motion.header>

        {/* ════════════════════════════════════════════
            Section 2 — 3 Cluster Cards (Discovered Agents)
        ════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl sm:text-3xl font-bold font-en mb-1" style={{ color: '#334155' }}>
            Discovered Agents
          </h2>
          <p className="text-sm font-sarabun mb-8" style={{ color: '#94a3b8' }}>
            เลือก Cluster เพื่อดู AI Agent — 10 agents ใน 3 กลุ่มงาน
          </p>
        </motion.div>

        {/* spec: 3-column grid, card min-height 240px */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14"
        >
          {clusters.map((c, i) => (
            <ClusterCard key={c.id} cluster={c} index={i} onSelect={onSelectCluster} />
          ))}
        </div>

        {/* ════════════════════════════════════════════
            Section 3 — Quick Explanation (3 Steps)
            spec: เลือกทีม / พิมพ์ / ระบบจัดการ + ปุ่ม Learn More
        ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-3xl p-8 mb-10"
          style={{ background: '#EFF2F9', boxShadow: '6px 6px 16px #d1d9e6, -6px -6px 16px #ffffff' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            {/* Left: 3 steps */}
            <div className="flex-1">
              <p className="text-xs font-semibold font-en tracking-widest mb-5" style={{ color: '#94a3b8' }}>
                HOW IT WORKS — 3 ขั้นตอน
              </p>
              <div className="flex flex-col gap-5">
                <QuickStep number="1" title="เลือกทีม" desc="เลือก Cluster ที่ตรงกับงาน: Strategy / Creative / Growth" delay={0.65} />
                <QuickStep number="2" title="พิมพ์สิ่งที่ต้องการ" desc="บอกโจทย์ให้ AI Agent ทำงาน ภาษาไทยหรืออังกฤษก็ได้" delay={0.72} />
                <QuickStep number="3" title="ระบบจัดการให้" desc="Orchestrator คัดเลือก Agent ที่เหมาะสมที่สุดมาตอบทันที" delay={0.79} />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px self-stretch" style={{ background: '#e2e8f0' }} />

            {/* Right: Learn More + mini stats */}
            <div className="flex flex-col items-start sm:items-end gap-5 sm:min-w-[180px]">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onOpenGuide}
                className="flex items-center gap-2 font-semibold text-sm font-en px-6"
                style={{
                  background: '#EFF2F9', boxShadow: '4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff',
                  border: 'none', borderRadius: 999, height: 44, color: '#5E9BEB', cursor: 'pointer',
                }}
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="flex flex-col gap-2">
                {[
                  { icon: <Rocket className="w-3.5 h-3.5" />, label: '10 AI Agents' },
                  { icon: <TrendingUp className="w-3.5 h-3.5" />, label: '6-Layer Quality Guard' },
                  { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Thai Language' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-xs font-en" style={{ color: '#94a3b8' }}>
                    {s.icon}{s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5"
          style={{ borderTop: '1px solid #e2e8f0' }}
        >
          <p className="text-xs font-en" style={{ color: '#cbd5e1' }}>
            © 2025 Social Factory × iDEAS365 · Powered by Claude AI
          </p>
          <p className="text-xs font-en" style={{ color: '#cbd5e1' }}>Thai Language Support</p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;