# GreekTrainer - UI/UX Architecture

## New Design: Exercise Loop-Centric

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Settings | Progress                           │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                            │
│  SIDEBAR         │  MAIN EXERCISE AREA                       │
│  (Customization) │                                            │
│                  │  ┌──────────────────────────────────────┐ │
│  📋 Filters      │  │                                      │ │
│  ├─ Word List    │  │  EXERCISE CARD                       │ │
│  ├─ Rule/Grammar │  │  ┌────────────────────────────────┐ │ │
│  ├─ Difficulty   │  │  │ Greek word: αγαπώ              │ │ │
│  └─ Exercise Type│  │  │ [Show conjugation table]        │ │ │
│                  │  │  └────────────────────────────────┘ │ │
│  🎯 Loop Config  │  │                                      │ │
│  ├─ Loop Type    │  │  EXERCISE                            │ │
│  ├─ Exercises/Set│  │  I love → [Answer input]             │ │
│  └─ Speed        │  │  [Submit] [Skip] [Show answer]       │ │
│                  │  │                                      │ │
│  🎬 Quick Start  │  │  FEEDBACK                            │ │
│  ├─ Grammar Loop │  │  ✅ Correct! Next →                 │ │
│  ├─ Verb Practice│  │                                      │ │
│  ├─ Daily       │  │ [Add Word] [Settings] [Dictionary]   │ │
│  └─ Custom      │  │                                      │ │
│                  │  └──────────────────────────────────────┘ │
│                  │                                            │
│  [Progress: 15/30]
│                  │  [Loop controls at bottom]               │
└──────────────────┴──────────────────────────────────────────┘
```

---

## Component Details

### 1. SIDEBAR - Loop Customization

#### Filters Section
```
📋 FILTERS & RULES

Word List Selection:
  ○ All words (51)
  ○ Verbs only (20)
  ○ Nouns only (15)
  ○ Adjectives only (10)
  ○ [+ Custom list]

Grammar Rule:
  ○ All rules
  ○ Present tense only
  ○ Paradigm Ρ10.1 (love, like)
  ○ Paradigm Ρ10.10 (can, could)
  ○ [+ Filter builder]

Difficulty:
  ⭐ A1 | ⭐⭐ A2 | ⭐⭐⭐ B1 | ⭐⭐⭐⭐ B2

Exercise Types:
  ☑ Synthesis
  ☑ Analysis
  ☑ Translation
  ☑ Listening
  ☑ [+ More]
```

#### Loop Config Section
```
🎬 LOOP CONFIGURATION

Exercise Type:
  ○ Sequential (ordered)
  ○ Random (shuffled)
  ○ Spaced (smart repeat)

Exercises per set:
  [10] [15] [20] [Custom ___]

Speed:
  🐢 Slow | 🚶 Normal | 🏃 Fast | 🏎️ Speed run

Feedback style:
  ○ Immediate
  ○ After each batch
  ○ End of loop

[Start Loop] [Custom...]
```

#### Quick Presets
```
🎯 QUICK START

[🔥 Daily Challenge]
  15 random exercises
  Mixed difficulty
  
[🧠 Grammar Master]
  Focus on one rule
  Targeted practice
  
[📚 Verb Practice]
  All verb exercises
  Present tense
  
[⚙️ Custom]
  [Build your own]
```

### 2. MAIN AREA - Exercise Loop

#### Exercise Card
```
┌─────────────────────────────────────────────────┐
│ Exercise 5 of 20 [████████░░░░░░░░░░░░] 25%     │
├─────────────────────────────────────────────────┤
│                                                  │
│  Greek: αγαπώ (to love)                         │
│  [View conjugation table ↓]                      │
│                                                  │
│  ────────────────────────────────────────────   │
│                                                  │
│  EXERCISE: Complete the sentence                │
│  "I love → _______ (1st person)"                │
│                                                  │
│  [αγαπώ    ] [αγαπάς   ] [αγαπά]                │
│  [αγαπούμε ] [αγαπάτε  ] [αγαπούν]              │
│                                                  │
│  ────────────────────────────────────────────   │
│                                                  │
│  Feedback: ✅ CORRECT!                          │
│  "αγαπώ" is 1st person singular present         │
│                                                  │
│  Similar words: μπορώ, δουλεύω                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Loop Controls
```
[⏮ Restart] [⏭ Next] [📖 Dictionary] [⚙️ Settings] [💾 Save Progress]
```

### 3. DICTIONARY PANEL (Floating)

```
┌─────────────────────┐
│ αγαπώ (to love)    │
├─────────────────────┤
│                     │
│ CONJUGATION TABLE   │
│                     │
│ Present tense:      │
│ 1st sg: αγαπώ       │
│ 2nd sg: αγαπάς      │
│ 3rd sg: αγαπά       │
│ 1st pl: αγαπούμε    │
│ 2nd pl: αγαπάτε     │
│ 3rd pl: αγαπούν     │
│                     │
│ [Past] [Future]     │
│                     │
│ Paradigm: Ρ10.1     │
│ Difficulty: A1      │
│                     │
│ [Add to custom list]│
│ [Similar words]     │
│                     │
└─────────────────────┘
```

---

## Responsive Design

### Desktop (>1024px)
- Sidebar fixed left (25%)
- Main area (75%)
- Horizontal layout

### Tablet (768px - 1023px)
- Sidebar as collapsible drawer
- Main area full width
- Sidebar toggles with button

### Mobile (<768px)
- Sidebar hidden by default
- Hamburger menu to toggle
- Full-width exercise card
- Stacked controls

```
Mobile Layout:
┌──────────────────┐
│ ☰ | Progress | ⚙ │ ← header
├──────────────────┤
│                  │
│  EXERCISE CARD   │
│  (full width)    │
│                  │
│  [Answer input]  │
│  [Submit]        │
│                  │
│  [⏭ Next] [⚙️]  │
│  [📖] [💾]      │
├──────────────────┤
│  [Settings]      │ ← drawer when open
│  [Filters]       │
│  [Loop Config]   │
└──────────────────┘
```

---

## User Flows

### Flow 1: Casual Loop
1. User opens app
2. Sees quick presets ("Daily Challenge", "Verb Practice")
3. Clicks one → loop starts
4. Does exercises in sequence
5. Can skip or customize mid-loop

### Flow 2: Custom Loop
1. User opens app
2. Uses sidebar filters:
   - Select "Verbs only"
   - Select "Present tense"
   - Select "Synthesis + Analysis"
3. Clicks "Start Loop"
4. Exercises flow based on rules

### Flow 3: Discovery
1. During loop, user sees a word they don't know
2. Clicks "Dictionary" or word itself
3. Floating panel shows conjugation table
4. User can continue loop or add word to custom list

### Flow 4: Spaced Repetition
1. User configures loop with "Spaced" mode
2. System shows words at optimal intervals
3. More challenging words repeat more often
4. Progress saved

---

## Implementation Priority

### Phase 1: Core Loop (2 days)
- [ ] Main exercise card component
- [ ] Basic loop state management
- [ ] Next/skip/submit buttons
- [ ] Basic feedback display

### Phase 2: Sidebar (1 day)
- [ ] Filter components
- [ ] Quick presets
- [ ] Loop configuration UI

### Phase 3: Dictionary (1 day)
- [ ] Floating panel component
- [ ] Conjugation table display
- [ ] Show/hide toggle

### Phase 4: Responsive (1 day)
- [ ] Mobile menu
- [ ] Tablet drawer
- [ ] Touch-friendly sizes

### Phase 5: Polish (1 day)
- [ ] Animations
- [ ] Accessibility (a11y)
- [ ] Performance
- [ ] Testing

---

## Style Preservation

**Keep:**
- Color scheme (blues, whites, grays)
- Typography (system fonts)
- Icon style (emoji-based)
- Spacing and padding
- Card/box design

**Update:**
- Layout structure (sidebar → main)
- Exercise selection (preset buttons)
- Word lookup (dynamic dictionary)
- Controls organization (clearer hierarchy)

---

## Success Criteria

✅ Single continuous loop as main feature  
✅ Customizable with filters and rules  
✅ Dictionary accessible without leaving loop  
✅ Mobile-friendly on all screen sizes  
✅ Style consistent with current design  
✅ Faster to start exercising (2 clicks max)  
✅ More engaging user experience
