# 🎨 Social-Factory UI Design Proposal
## Solace-Inspired Dashboard + iDEAS365 Design System

**Document Version:** 1.0
**Design System:** Soft Professional Neumorphism + Sapphire Palette
**Typography:** Sarabun (ไทย) + Inter (English)
**Target:** Multi-User, Multi-Brand, Multi-Project Management

---

## 📋 Table of Contents
1. [User Personas & Workflows](#user-personas--workflows)
2. [Design System Overview](#design-system-overview)
3. [Page Structures & Layouts](#page-structures--layouts)
4. [UI Component Library](#ui-component-library)
5. [Interaction Patterns](#interaction-patterns)
6. [Multi-Brand/Project Navigation](#multi-brandproject-navigation)
7. [Implementation Guide](#implementation-guide)

---

## 🎭 User Personas & Workflows

### **Persona A: Brand Enthusiast**
**Goal:** Complete brand building journey (linear progression)
- Onboard with full brand setup → Dashboard → Create content across 3 clusters
- Continuous learning and content creation
- **UI Pattern:** Sequential wizard flow → Unified dashboard view

**Decision Points:**
- Skip onboarding? → Can return to "Setup Brand" anytime
- Complete setup? → Full dashboard access with brand context

---

### **Persona B: Task-Focused User**
**Goal:** Quickly pick specific tasks without full brand context
- Want to use Design Agent for quick logo feedback
- Want Market Analyst for competitor research
- Not interested in full onboarding
- **UI Pattern:** Task selector → Quick agent interface → Results

**Decision Points:**
- Browse all agents by cluster → Select specific agent → Get default or minimal context

---

### **Persona C: Multi-Brand Manager**
**Goal:** Manage multiple brands simultaneously
- Brand A: Coffee Shop (Strategist focus)
- Brand B: Fashion Boutique (Studio focus)
- Brand C: Food Delivery (Agency focus)
- Switch between brands instantly
- **UI Pattern:** Brand selector dropdown → Context-aware dashboard

**Decision Points:**
- Which brand? → Which cluster? → Which agent?
- Create new brand vs switch existing
- Isolate or cross-brand insights?

---

### **Persona D: Complex Operator**
**Goal:** Manage multiple projects per brand
- Brand: "Art Coffee Studio"
  - Project 1: Q1 Marketing Campaign (Agency tasks)
  - Project 2: Q2 Brand Refresh (Studio tasks)
  - Project 3: Market Expansion (Strategist tasks)
- **UI Pattern:** Nested navigation (Brand > Project > Cluster > Agent)

**Decision Points:**
- Multi-select projects? Cross-project analysis?
- Archive or delete past projects?

---

## 🎨 Design System Overview

### **Color Palette (Sapphire + Neutrals)**
```
Primary: #5E9BEB (Sapphire Blue - Alerts, CTAs)
Secondary: #7FB3E5 (Light Sapphire - Hover states)
Accent: #3B5998 (Deep Sapphire - Active states)

Neutrals (Text & Cards):
  - Dark: #334155 (Slate-700 - Headings)
  - Medium: #64748B (Slate-600 - Labels)
  - Light: #CBD5E1 (Slate-300 - Placeholders)
  - Very Light: #F1F5F9 (Slate-100 - Backgrounds)

Semantic:
  - Success: #10B981 (Emerald)
  - Warning: #F59E0B (Amber)
  - Error: #EF4444 (Red)
  - Info: #06B6D4 (Cyan)

Glass/Neumorphic:
  - Shadow Light: #d1d9e6
  - Shadow Dark: #ffffff
  - Base: #EFF2F9 (Soft gray-blue)
```

### **Typography**
```
Headings (Oswald for weight & impact):
  - H1: 48px / Line-height 56px (Brand names, page titles)
  - H2: 32px / Line-height 40px (Section titles)
  - H3: 24px / Line-height 32px (Card titles)

Body Text (Sarabun TH / Inter EN):
  - Body-large: 16px / Line-height 24px
  - Body-regular: 14px / Line-height 20px (Default)
  - Body-small: 12px / Line-height 18px (Helper text)
  - Body-micro: 11px / Line-height 16px (Timestamps)

Labels (Spectral / Inter):
  - Label-large: 14px (Form labels)
  - Label-regular: 12px (Tags, badges)
  - Label-small: 10px (Captions)
```

### **Spacing & Layout**
```
Base Unit: 4px (multiples of 4)
  - XS: 8px
  - SM: 12px
  - MD: 16px
  - LG: 24px
  - XL: 32px
  - 2XL: 48px
  - 3XL: 64px

Grid:
  - 2-column symmetric layout (Desktop)
  - 1-column responsive (Tablet/Mobile)
  - Max-width: 1400px
  - Padding: 24px sides

Card Properties:
  - Border-radius: 28-30px
  - Padding: 24px
  - Border: 1px solid rgba(255,255,255,0.6)
  - Box-shadow: 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 3px rgba(255,255,255,0.5)
  - Background: rgba(239,242,249,0.95)
```

### **Component Styling**

**Buttons (Soft Gray, Rounded)**
```
Primary Button:
  - Background: Linear gradient #5E9BEB → #7FB3E5
  - Text: White, 14px Inter Semi-bold
  - Padding: 12px 24px
  - Border-radius: 20px
  - Box-shadow: 0 4px 16px rgba(94,155,235,0.3)
  - Hover: Scale 1.02, shadow increase
  - Active: Scale 0.98, shadow decrease

Secondary Button:
  - Background: rgba(239,242,249,0.8)
  - Text: #334155, 14px Inter Medium
  - Border: 1px solid #CBD5E1
  - Padding: 12px 24px
  - Border-radius: 20px
  - Hover: Background→rgba(239,242,249,1)

Ghost Button (Text only):
  - Text: #5E9BEB
  - No background
  - Underline on hover
  - Padding: 8px 12px
```

**Cards (Neumorphic)**
```
Standard Card:
  - Background: #EFF2F9
  - Border: 1px solid rgba(255,255,255,0.6)
  - Border-radius: 28px
  - Padding: 24px
  - Shadow: 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 3px rgba(255,255,255,0.5)
  - Hover: Subtle shadow increase, border opacity increase

Interactive Card:
  - Same as above + cursor pointer
  - Transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1)
  - Active: Color shift #5E9BEB subtle tint

Elevated Card (Dashboard sections):
  - Shadow: 0 8px 24px rgba(0,0,0,0.12)
  - Backdrop-filter: blur(10px) [optional for glass effect]
```

**Input Fields**
```
Text Input / Select:
  - Background: rgba(255,255,255,0.5)
  - Border: 1px solid #CBD5E1
  - Border-radius: 16px
  - Padding: 12px 16px
  - Typography: 14px Sarabun/Inter
  - Focus: Border color→#5E9BEB, box-shadow→0 0 0 3px rgba(94,155,235,0.1)
  - Error: Border color→#EF4444

Label:
  - Typography: 12px Semi-bold Slate-600
  - Margin-bottom: 8px
  - Required indicator: Red asterisk
```

**Badges & Tags**
```
Status Badge:
  - Background: Semantic color with opacity
  - Text: White or semantic color
  - Border-radius: 12px
  - Padding: 6px 12px
  - Typography: 11px Medium

Examples:
  - Active: #10B981 background
  - Pending: #F59E0B background
  - Error: #EF4444 background
  - Info: #06B6D4 background
```

---

## 🏗️ Page Structures & Layouts

### **1. HOMEPAGE (Landing/Welcome)**

**Purpose:** First impression, value proposition for Social-Factory

**Sections:**
```
┌─ Header (Sticky)
│  ├─ Logo [iDEAS365 + Social-Factory]
│  ├─ Nav [Features | Agents | Pricing (future)]
│  └─ Auth [Login | Sign Up]
│
├─ Hero Section
│  ├─ Headline: "AI Agents Ready to Build Your Brand"
│  ├─ Subheading: "Meet 10 specialized AI agents organized in 3 clusters"
│  ├─ Visual: Agent cards preview (3 clusters shown)
│  └─ CTA: [Explore Agents] [Start Brand Setup]
│
├─ Quick Stats (2-column grid)
│  ├─ "10 AI Agents" + icon
│  ├─ "3 Specialized Clusters" + icon
│  ├─ "Multi-Brand Ready" + icon
│  └─ "Real-time Collaboration" + icon
│
├─ 3 Cluster Overview (2-column cards)
│  ├─ STRATEGIST Cluster
│  │  ├─ Title: "The Strategist"
│  │  ├─ Description: Business strategy & market analysis
│  │  ├─ Agents: [Market Analyst] [Data Strategist] [Researcher]
│  │  └─ CTA: Explore Strategist Agents
│  │
│  ├─ STUDIO Cluster
│  │  ├─ Title: "The Studio"
│  │  ├─ Description: Creative design & visual content
│  │  ├─ Agents: [Design Agent] [Content Creator] [Copywriter]
│  │  └─ CTA: Explore Studio Agents
│  │
│  └─ AGENCY Cluster
│     ├─ Title: "The Agency"
│     ├─ Description: Growth, automation & execution
│     ├─ Agents: [Growth Hacker] [Automation Specialist] [Executor]
│     └─ CTA: Explore Agency Agents
│
├─ How It Works (Step-by-step)
│  ├─ Step 1: Set Your Brand (optional)
│  ├─ Step 2: Pick an Agent
│  ├─ Step 3: Get AI Results
│  └─ Step 4: Iterate & Improve
│
├─ Feature Highlights (1-column, scrollable)
│  ├─ Card: "Multi-Brand Support"
│  │  └─ Manage multiple brands in one account
│  ├─ Card: "Real-time Agent Mesh"
│  │  └─ See agents collaborating live
│  ├─ Card: "Brand Knowledge Template"
│  │  └─ Automatic context for every agent
│  └─ Card: "No Setup Required"
│     └─ Skip onboarding, use defaults
│
├─ Call-to-Action Section
│  ├─ Headline: "Ready to Unleash Your Brands?"
│  ├─ Twin Buttons:
│  │  ├─ [Try Free with Default Settings] (Primary)
│  │  └─ [Set Up Custom Brand] (Secondary)
│  └─ Trust badges: "No CC Required | 30-day free | No limits"
│
└─ Footer
   ├─ Links [About | Contact | Privacy]
   └─ Social media + copyright
```

**Layout Grid:** 2-column symmetric (Desktop) | 1-column (Mobile)

**Design Notes:**
- Hero section: Large sapphire gradient background (soft)
- Cards with agent previews: Interactive, hover scale effect
- Statistics: Counter animation on scroll
- Feature cards: Gradient accent on left border
- CTA buttons: Twin layout (equal width)

---

### **2. ONBOARDING & TUTORIAL PAGE**

**Purpose:** Guide users through system & optional brand setup

**Page Flow: Multi-Step Progressive Disclosure**

```
Screen 1: Welcome
┌────────────────────────────────┐
│         Welcome! 👋             │
│                                 │
│  Let's set up your first brand  │
│  (or skip to start exploring)   │
│                                 │
│  [Skip Setup] [Continue] ►      │
└────────────────────────────────┘

Screen 2: Brand Basics (if Continue)
┌────────────────────────────────┐
│  Brand Information  [1/4]       │
│                                 │
│  Brand Name (TH):               │
│  [________________]             │
│                                 │
│  Brand Name (EN):               │
│  [________________]             │
│                                 │
│  Industry:                      │
│  [  Select Industry ▼ ]         │
│                                 │
│  [◄ Back] [Skip] [Next ►]       │
└────────────────────────────────┘

Screen 3: Visual Identity (2/4)
┌────────────────────────────────┐
│  Visual System  [2/4]           │
│                                 │
│  Primary Color:                 │
│  [Color Picker] #5E9BEB         │
│                                 │
│  Mood Keywords:                 │
│  [+ Trendy] [+ Modern]          │
│  [+ Professional] [Clear ✕]    │
│                                 │
│  [◄ Back] [Skip] [Next ►]       │
└────────────────────────────────┘

Screen 4: Target Audience (3/4)
┌────────────────────────────────┐
│  Audience  [3/4]                │
│                                 │
│  Who is your target?            │
│  [_____________________]         │
│                                 │
│  Brand Tone:                    │
│  ◉ Professional                 │
│  ○ Friendly                     │
│  ○ Bold & Edgy                  │
│  ○ Playful & Fun               │
│                                 │
│  [◄ Back] [Skip] [Next ►]       │
└────────────────────────────────┘

Screen 5: Confirmation (4/4)
┌────────────────────────────────┐
│  Review Your Brand  [4/4]       │
│                                 │
│  ✓ Brand Name: Art Coffee       │
│  ✓ Industry: Cafe & Coffee      │
│  ✓ Color: [Blue Square]         │
│  ✓ Tone: Professional           │
│                                 │
│  [◄ Back] [Edit] [Complete ✓]  │
└────────────────────────────────┘

Screen 6: Success
┌────────────────────────────────┐
│      Setup Complete! ✨         │
│                                 │
│   Your brand is ready!          │
│   10 AI agents await you...     │
│                                 │
│      [Explore Agents ►]         │
└────────────────────────────────┘
```

**Consent Modal (for Skip)**
```
┌─────────────────────────────────┐
│  Continue Without Brand Setup?  │
│                                 │
│  ⚠️  Without brand setup:        │
│  • No custom brand context      │
│  • Generic AI responses         │
│  • Data resets on refresh       │
│  • Can add brand later          │
│                                 │
│  ☐ I understand & accept        │
│                                 │
│  [Back to Setup] [Continue ►]   │
└─────────────────────────────────┘
```

**Layout Design:**
- Centered card (max-width: 500px)
- Step indicator at top (1/4 | 2/4 | 3/4 | 4/4)
- Progress bar below title
- Form fields stacked vertically
- Twin buttons at bottom (Back | Next)
- Smooth transitions between screens

---

### **3. MAIN DASHBOARD (Post-Onboarding)**

**Purpose:** Agent discovery, task execution, project management

**Header Section:**
```
┌──────────────────────────────────────────────────────┐
│ [Logo] Social-Factory Dashboard     [🔔] [⚙️] [👤]    │
└──────────────────────────────────────────────────────┘
```

**Left Sidebar (Persistent - Desktop only):**
```
┌─ BRAND CONTEXT
│  ├─ [Brand Selector ▼] Art Coffee Studio
│  └─ Color indicator + Logo (if uploaded)
│
├─ NAVIGATION
│  ├─ [📊] Agents & Clusters
│  ├─ [⚡] Quick Tasks
│  ├─ [📈] My Projects
│  ├─ [📋] Task Monitor
│  └─ [🔗] Agent Mesh Flow
│
├─ MULTI-BRAND SWITCHER
│  ├─ [+ New Brand]
│  ├─ Art Coffee Studio (current)
│  ├─ Siam Fashion Boutique
│  └─ Sweet Delivery
│
└─ SETTINGS
   ├─ [⚙️] Brand Settings
   ├─ [🔐] Privacy & Data
   └─ [📤] Import/Export
```

**Main Content Area - Agent Discovery Tab:**
```
┌────────────────────────────────────────────────────────┐
│ Agents & Clusters                    [View: Grid/List] │
└────────────────────────────────────────────────────────┘

[Search: Find agents...]

┌─ THE STRATEGIST (Business Strategy)
│  ├─┬─ Card: Market Analyst
│  │ ├─ Role: Lead Data Scientist
│  │ ├─ Skills: Market research, competitor analysis
│  │ ├─ Status: Ready ✓
│  │ └─ [Launch ►]
│  │
│  ├─┬─ Card: Data Strategist
│  │ ├─ Role: Strategic Consultant
│  │ ├─ Skills: ROI, risk assessment
│  │ └─ [Launch ►]
│  │
│  └─┬─ Card: Researcher
│      ├─ Role: Research Specialist
│      ├─ Skills: Deep analysis, insights
│      └─ [Launch ►]
│
├─ THE STUDIO (Creative Design)
│  ├─┬─ Card: Design Agent
│  │ ├─ Role: Lead Designer
│  │ ├─ Skills: Visual design, branding
│  │ └─ [Launch ►]
│  │
│  ├─┬─ Card: Content Creator
│  │ ├─ Role: Creative Director
│  │ ├─ Skills: Content strategy, storytelling
│  │ └─ [Launch ►]
│  │
│  └─┬─ Card: Copywriter
│      ├─ Role: Copy Specialist
│      ├─ Skills: Headlines, messaging
│      └─ [Launch ►]
│
└─ THE AGENCY (Growth & Execution)
   ├─┬─ Card: Growth Hacker
   │ ├─ Role: Growth Specialist
   │ ├─ Skills: Marketing growth, automation
   │ └─ [Launch ►]
   │
   ├─┬─ Card: Automation Specialist
   │ ├─ Role: Ops Automation
   │ ├─ Skills: Workflow automation, systems
   │ └─ [Launch ►]
   │
   └─┬─ Card: Executor
      ├─ Role: Project Executor
      ├─ Skills: Execution, project mgmt
      └─ [Launch ►]
```

**Layout:** 2-column grid (Agent cards)

**Agent Card Hover State:**
- Scale up slightly
- Shadow increase
- Details fade in
- [Launch] button highlights

---

### **4. AGENT INTERFACE (Chat/Interaction)**

**Purpose:** User talks to individual agent with brand context

```
┌──────────────────────────────────────┐
│ Market Analyst    [Art Coffee Studio] │  ← Context badge
│ Cluster: Strategist                   │  ← Cluster indicator
└──────────────────────────────────────┘

┌────────────────────────────────────────┐
│                                        │
│  Assistant: Hi! I'm your Market       │
│  Analyst. What would you like to      │
│  research today about Art Coffee?     │
│                                        │
│  [Suggested tasks:]                    │
│  [Competitor analysis] [Market trends]│
│  [Customer insights] [SWOT Analysis]   │
│                                        │
│  • • • • • (Agent thinking indicator) │
│                                        │
└────────────────────────────────────────┘

User Input Area:
┌────────────────────────────────────────┐
│ Type your question...                  │
│ ┌──────────────────────────────────┐  │
│ │                                  │  │
│ │ [Attachment ▼] [Microphone 🎤]   │  │
│ └──────────────────────────────────┘  │
│              [Send ►]                  │
└────────────────────────────────────────┘
```

**Message Bubble Styling:**
```
Assistant Message:
  - Left-aligned
  - Background: #EFF2F9
  - Border-radius: 20px
  - Border: 1px solid rgba(255,255,255,0.6)
  - Padding: 16px 20px
  - Max-width: 80%
  - Text: Slate-700, 14px Sarabun/Inter

User Message:
  - Right-aligned
  - Background: Linear gradient #5E9BEB → #7FB3E5
  - Color: White
  - Border-radius: 20px
  - Padding: 16px 20px
  - Max-width: 80%
  - Text: 14px Sarabun/Inter Semi-bold
```

---

### **5. TASK MONITOR**

**Purpose:** Real-time task tracking, status visibility

```
┌────────────────────────────────────────────────────┐
│ Task Monitor                    [Filter ▼] [Export] │
└────────────────────────────────────────────────────┘

┌─ Timeline View (Vertical)
│
│  14:32  Market Analyst: Market Research Report
│         ├─ Status: ✓ Complete
│         ├─ Duration: 3m 24s
│         └─ Output: [View Report ►]
│
│  14:28  Design Agent: Logo Concepts
│         ├─ Status: ⚙️ Processing
│         ├─ Progress: ████████░░ 85%
│         └─ ETA: ~45 seconds
│
│  14:12  Growth Hacker: Campaign Strategy
│         ├─ Status: ⏳ Queued
│         └─ Position: 2 tasks ahead
│
│  13:55  Content Creator: Copy Variations
│         ├─ Status: ✓ Complete
│         ├─ Duration: 2m 10s
│         └─ Output: [View Content ►]
│
└─ Summary Stats (Cards):
   ├─ [Total Tasks: 24]
   ├─ [Today: 8]
   ├─ [Success Rate: 98%]
   └─ [Avg Duration: 2m 45s]
```

**Card Design:**
- Horizontal card per task
- Status icon (✓ / ⚙️ / ⏳ / ✕)
- Timeline indicator (left side colored bar)
- Task summary (title, cluster badge)
- Details row (duration, ETA, actions)

---

### **6. AGENT MESH FLOW VISUALIZATION**

**Purpose:** Show real-time agent collaboration & data flow

```
Concept: Interactive network diagram showing:
- 3 clusters as containers (Strategist, Studio, Agency)
- 10 agents as nodes
- Flows between agents as animated lines
- Current task highlighted with pulsing animation
- Real-time data movement

┌─────────────────────────────────────────────┐
│ Agent Mesh Flow    [Zoom: 100%] [Export]   │
│                                             │
│  THE STRATEGIST          THE STUDIO       THE AGENCY
│  ┌─────────────┐      ┌─────────────┐   ┌──────────────┐
│  │   Market    │      │   Design    │   │    Growth    │
│  │  Analyst ◇  │      │   Agent ◇   │   │   Hacker ◇   │
│  └──────┬──────┘      └──────┬──────┘   └──────┬───────┘
│         │                    │                  │
│      ┌──┴────────────────────┴──────────────────┘
│      │
│      ▼
│  ┌─────────────┐      ┌─────────────┐   ┌──────────────┐
│  │    Data     │      │  Content    │   │ Automation   │
│  │ Strategist  │      │  Creator    │   │ Specialist   │
│  └─────────────┘      └─────────────┘   └──────────────┘
│         ▲                    ▲                   ▲
│         └────────────┬───────┴───────────────────┘
│                      │
│         [User Input] ◇ [Orchestrator]
│
│  ◇ = Agent Node (Pulsing when active)
│  ─ = Data Flow (Animated arrows)
│
└─────────────────────────────────────────────┘
```

**Interactive Features:**
- Hover agent → Show tooltip with status
- Click agent → Launch that agent's chat
- Right-click → View detailed metrics
- Zoom/pan available
- Filter by cluster
- Real-time animation of data flows

---

### **7. MULTI-BRAND/MULTI-PROJECT SWITCHER**

**Purpose:** Seamless context switching for users managing multiple brands

**Brand Selector (Top-left persistent):**
```
Current: [Art Coffee Studio ▼]

Dropdown menu:
┌─ Art Coffee Studio
│  ├─ Logo thumbnail [BROWN]
│  ├─ Industry: Cafe & Coffee
│  ├─ Status: ✓ Active
│  └─ Projects: 3
│
├─ Siam Fashion Boutique
│  ├─ Logo thumbnail [TEAL]
│  ├─ Industry: Fashion
│  ├─ Status: ✓ Active
│  └─ Projects: 2
│
├─ Sweet Delivery
│  ├─ Logo thumbnail [PINK]
│  ├─ Industry: Food Delivery
│  ├─ Status: ⏸ Paused
│  └─ Projects: 1
│
└─ [+ Add New Brand]
```

**Project Selector (Inside Brand context):**
```
Projects for Art Coffee Studio:

┌─ Project Card: Q1 Marketing Campaign
│  ├─ Cluster: Agency (Growth focus)
│  ├─ Status: In Progress (65%)
│  ├─ Due: March 31, 2024
│  ├─ Team: You + 2 agents
│  └─ [Open Project ►]
│
├─ Project Card: Q2 Brand Refresh
│  ├─ Cluster: Studio (Design focus)
│  ├─ Status: Planning (20%)
│  ├─ Due: May 15, 2024
│  ├─ Team: You + 3 agents
│  └─ [Open Project ►]
│
└─ Project Card: Market Expansion
   ├─ Cluster: Strategist (Analysis focus)
   ├─ Status: Research (45%)
   ├─ Due: April 30, 2024
   ├─ Team: You + 2 agents
   └─ [Open Project ►]

[+ Create New Project]
```

**Smart Context Management:**
- Switch brand → All agent contexts update automatically
- Switch project → Task list filters by project
- Agent remembers multi-brand state (no resets)
- Visual brand color coding throughout UI

---

## 🎯 UI Component Library

### **Reusable Components**

**1. Cluster Badge**
```
┌─────────────────────┐
│ 📊 STRATEGIST       │  (Blue background)
│ Business Strategy   │
└─────────────────────┘

┌─────────────────────┐
│ 🎨 STUDIO           │  (Purple background)
│ Creative Design     │
└─────────────────────┘

┌─────────────────────┐
│ 🚀 AGENCY           │  (Green background)
│ Growth & Execution  │
└─────────────────────┘
```

**2. Agent Card (Compact)**
```
┌────────────────────────────┐
│ 🧠 Market Analyst          │  ← Icon + name
│ Lead Data Scientist        │  ← Role
│ Market research, analysis  │  ← Skills preview
│ Status: Ready ✓            │  ← Status
│        [Launch ►]          │  ← CTA
└────────────────────────────┘
```

**3. Status Badge**
```
✓ Complete    (Green)
⚙️ Processing  (Blue + animated spinner)
⏳ Queued      (Yellow)
✕ Error       (Red)
⏸ Paused      (Gray)
```

**4. Brand Card (Mini)**
```
┌────────────────────┐
│ [Logo] #5E9BEB     │  ← Brand color dot
│ Art Coffee Studio  │
│ Cafe & Coffee      │  ← Industry
│ ✓ 3 projects       │
└────────────────────┘
```

**5. Form Input Group**
```
Label: Brand Name (TH)
Hint:  Your brand's Thai name

[____________________________]  ← Input field
                          0/30  ← Character count

Error state:
[____________________________]
❌ This field is required
```

**6. Expandable Section**
```
┌──────────────────────────────┐
│ ▶ Advanced Settings        │
│  (Section collapses when ▼)│
├──────────────────────────────┤
│ [Form fields appear here]    │
│ [More options...]            │
└──────────────────────────────┘
```

---

## ⚡ Interaction Patterns

### **1. Navigation Patterns**

**Breadcrumb (Top-left):**
```
Brands / Art Coffee Studio / Projects / Q1 Campaign / Task Monitor
└─ Each segment is clickable for quick navigation
```

**Sidebar Navigation (Desktop):**
- Active indicator (left border highlight in Sapphire blue)
- Icon + label
- Submenu expansion on click
- Smooth slide animations

**Mobile Navigation (Bottom Tab Bar):**
```
[Agents] [Tasks] [Monitor] [Settings]
```

---

### **2. Modal Patterns**

**Confirmation Modal:**
```
┌─────────────────────────────┐
│ Are you sure?               │
│                             │
│ This action cannot be       │
│ undone.                     │
│                             │
│ [Cancel] [Confirm Delete]   │
└─────────────────────────────┘
```

**Form Modal (Add New Project):**
```
┌─────────────────────────────┐
│ Create New Project    [×]    │
├─────────────────────────────┤
│ Project Name:               │
│ [_____________________]      │
│                             │
│ Select Cluster:             │
│ ◉ Strategist ○ Studio       │
│ ○ Agency                    │
│                             │
│ Due Date:                   │
│ [___/___/___] 📅            │
│                             │
│ [Cancel] [Create Project]   │
└─────────────────────────────┘
```

**Alert Modal (Success/Error):**
```
┌─────────────────────────────┐
│ ✓ Success!                  │
│                             │
│ Your brand has been saved   │
│ and is ready to use.        │
│                             │
│        [Got it!]            │
└─────────────────────────────┘
```

---

### **3. Micro-interactions**

**Button Interactions:**
- Hover: Scale 1.02, shadow increase
- Click: Scale 0.98, shadow decrease
- Loading: Spinner inside button
- Disabled: Opacity 0.5, cursor not-allowed

**Card Interactions:**
- Hover: Subtle background color change, shadow increase
- Click: Visual feedback (highlight or expand)
- Drag: Reorder projects (if applicable)

**Input Focus:**
- Border color → Sapphire blue
- Background: Very subtle blue tint
- Cursor: Default
- Helper text: Appears/updates in real-time

**Scroll Behaviors:**
- Sidebar: Sticky (stays in view)
- Header: Sticky with shadow on scroll
- Footer: Remains at bottom
- Content: Smooth scroll (CSS)

---

### **4. Animation Patterns (Framer Motion)**

```javascript
// Fade-in on page load
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
>

// Slide-up on agent card hover
<motion.div
  whileHover={{ y: -8 }}
  transition={{ duration: 0.2 }}
>

// Pulse animation for active agent
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>

// Stagger children animation
<motion.div>
  {agents.map((agent, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
    >
      {/* Agent card */}
    </motion.div>
  ))}
</motion.div>
```

---

## 🧭 Multi-Brand/Project Navigation

### **Data Structure in State**

```javascript
// User session
{
  activeUser: {
    id: 'user_123',
    currentBrand: 'brand_coffee_001',
    currentProject: 'project_q1_marketing'
  },

  brands: [
    {
      id: 'brand_coffee_001',
      nameEn: 'Art Coffee Studio',
      nameTh: 'คาเฟ่อาร์ต',
      color: '#8B6F47', // Brand color
      logo: 'url...',
      industry: 'Cafe & Coffee',
      context: { /* MasterContext */ },
      projects: [
        { id: 'project_q1_marketing', name: 'Q1 Campaign', cluster: 'agency' },
        { id: 'project_q2_brand', name: 'Q2 Refresh', cluster: 'studio' }
      ]
    },
    // ... more brands
  ]
}
```

### **Navigation Logic**

```
User Action: Switch Brand
  ↓
Update activeUser.currentBrand
  ↓
Fetch brand context from storage
  ↓
Update aiService & orchestratorEngine with new context
  ↓
Update all agent UI components
  ↓
Reset project selection (or keep if same)
  ↓
UI updates: Agent cards, Task list, Context badge
```

---

## 🚀 Implementation Guide

### **Phase 1: Core Pages (Week 1)**
- [ ] Homepage / Landing page
- [ ] Onboarding flow (5 screens)
- [ ] Main Dashboard (Agent Discovery tab)
- [ ] Agent Chat Interface

### **Phase 2: Advanced Features (Week 2)**
- [ ] Task Monitor
- [ ] Agent Mesh Visualization (basic)
- [ ] Multi-Brand Switcher
- [ ] Project management UI

### **Phase 3: Polish & Optimization (Week 3)**
- [ ] Animation library (Framer Motion)
- [ ] Responsive design (mobile/tablet)
- [ ] Dark mode (optional)
- [ ] Performance optimization

### **Phase 4: Documentation (Week 4)**
- [ ] Storybook component library
- [ ] Design handoff guide
- [ ] User onboarding tutorial

---

## 📱 Responsive Design Breakpoints

```
Desktop:  1200px+ (2-column layout, sidebar visible)
Tablet:   768px-1199px (1-column layout, collapsible sidebar)
Mobile:   <768px (1-column layout, bottom tab bar)

Key adjustments:
- Font sizes: -2px on tablet, -4px on mobile
- Padding: -8px on tablet, -12px on mobile
- Cards: Full width minus padding on mobile
- Modals: 90% width with margin on mobile
```

---

## ✨ Summary

This design proposal creates a **Solace-inspired, multi-user-ready dashboard** that serves:

1. **Brand Enthusiasts** → Linear onboarding → Full dashboard
2. **Task-Focused Users** → Quick agent selection → Minimal context
3. **Multi-Brand Managers** → Brand switcher → Instant context change
4. **Complex Operators** → Brand > Project > Cluster > Agent hierarchy

**Key Design Principles Applied:**
- ✓ Soft Professional Neumorphism (iDEAS365 system)
- ✓ Sapphire blue palette with semantic colors
- ✓ Sarabun (Thai) + Inter (English) typography
- ✓ 2-column symmetric grid on desktop
- ✓ Smooth animations (Framer Motion)
- ✓ Zero-lag performance
- ✓ Mobile-first responsive design
- ✓ Clear information hierarchy
- ✓ Intuitive navigation for complex user flows

---

**Next Steps:**
1. Review this proposal
2. Approve or request changes
3. I'll create React components with Framer Motion animations
4. Ready for implementation! 🎨

