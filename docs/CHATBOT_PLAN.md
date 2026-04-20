# Capsul Chatbot Implementation Plan

## Overview
Build an AI chatbot that helps users find the perfect rental location through natural conversation using Hugging Face's free inference API.

---

## Architecture

### Stack
- **Frontend:** React component with chat UI
- **LLM:** Hugging Face Inference API (free tier)
- **Model:** Mistral-7B or similar (free, good quality)
- **Data:** Live location data from Supabase
- **Integration:** Via backend API endpoint

---

## Components to Build

### 1. Chat UI Component
**File:** `src/components/ChatBot.jsx`
- Message list (user & bot messages)
- Input field + send button
- Loading state (typing indicator)
- Close button
- Animations (framer-motion)

### 2. Chat Modal/Floating Button
**File:** `src/components/ChatBotModal.jsx`
- Floating chat button (bottom-right)
- Modal overlay with chat
- Toggle open/close

### 3. Backend API Endpoint
**File:** `src/api/chat.js` (or serverless function)
- POST `/api/chat`
- Receives: `{ message, conversationHistory }`
- Calls Hugging Face API
- Extracts intent (budget, location, amenities)
- Queries Supabase locations
- Returns formatted response with recommendations

### 4. Chat Context/State
**File:** `src/context/ChatContext.jsx` (optional)
- Manage conversation history
- Store chat state globally

### 5. Utility Functions
**File:** `src/utils/chatbot.js`
- `extractFilters()` — parse user message for filters
- `formatLocationResponse()` — format locations for bot response
- `buildPromptContext()` — create system prompt with location data

---

## Implementation Steps

### Step 1: Setup Hugging Face (30 min)
- [ ] Create Hugging Face account
- [ ] Get free API token
- [ ] Choose model: Mistral-7B or Falcon
- [ ] Add token to `.env.local`: `VITE_HF_API_TOKEN`
- [ ] Test API with curl/Postman

### Step 2: Create Chat UI (45 min)
- [ ] Build `ChatBot.jsx` component:
  - Message list
  - Input field
  - Send handler
  - Loading state
  - Auto-scroll to latest message
- [ ] Add framer-motion animations
- [ ] Style with Tailwind (match existing design)
- [ ] Test locally

### Step 3: Create Floating Button & Modal (30 min)
- [ ] Build `ChatBotModal.jsx`:
  - Floating button trigger
  - Modal backdrop
  - Close on escape
  - Position fixed bottom-right
- [ ] Add to `App.jsx`
- [ ] Test open/close

### Step 4: Build Backend Logic (45 min)
- [ ] Create `src/api/chat.js`:
  - Call Hugging Face API
  - Handle streaming/response
  - Error handling
- [ ] Create utility functions:
  - `extractFilters()` — NLP to extract intent
  - `queryLocations()` — Supabase query based on filters
  - `formatResponse()` — bot message formatting

### Step 5: Conversation Context (30 min)
- [ ] Implement conversation history
- [ ] Store in component state or context
- [ ] Maintain chat between messages
- [ ] Implement clear chat button

### Step 6: Location Recommendation Logic (45 min)
- [ ] Parse user message for:
  - Budget range
  - Location/city
  - Type (villa, studio, apartment)
  - Amenities (pool, wifi, etc.)
- [ ] Query Supabase with filters
- [ ] Format results for bot response
- [ ] Show location cards in chat

### Step 7: Testing & Refinement (30 min)
- [ ] Test chat flow end-to-end
- [ ] Handle edge cases
- [ ] Test with various user inputs
- [ ] Mobile responsiveness
- [ ] Error handling

---

## Files to Create/Modify

### New Files
```
src/
├── components/
│   ├── ChatBot.jsx              (chat messages & input)
│   └── ChatBotModal.jsx         (floating button + modal)
├── api/
│   └── chat.js                  (Hugging Face integration)
├── utils/
│   └── chatbot.js               (filter extraction, formatting)
└── context/
    └── ChatContext.jsx          (optional: conversation state)

docs/
└── CHATBOT_PLAN.md              (this file)
```

### Modified Files
```
src/
├── App.jsx                      (add <ChatBotModal />)
└── index.css                    (add chat styles if needed)
```

---

## API Integration

### Hugging Face Request
```javascript
const response = await fetch(
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
  {
    headers: { Authorization: `Bearer ${HF_TOKEN}` },
    method: "POST",
    body: JSON.stringify({
      inputs: `System: You are a helpful location recommendation assistant for Capsul...
               User: ${userMessage}`,
      parameters: { max_new_tokens: 200 }
    }),
  }
);
```

### Supabase Query (after filter extraction)
```javascript
const { data } = await supabase
  .from('locations')
  .select('*')
  .gte('price', minBudget)
  .lte('price', maxBudget)
  .ilike('city', `%${city}%`)
  .eq('type', type)
  .limit(5);
```

---

## Features

### MVP (Minimum Viable)
- ✅ Chat UI with send/receive
- ✅ Basic location filtering
- ✅ Show top 3 matching locations
- ✅ Floating button trigger

### Phase 2 (Polish)
- Conversation context (remember preferences)
- Multi-turn conversation
- Location card previews in chat
- Rating/reviews in recommendations
- Follow-up questions

### Phase 3 (Advanced)
- Booking integration
- Availability checking
- Save favorite conversations
- User preferences memory
- Analytics

---

## Environment Variables

```env
# .env.local
VITE_HF_API_TOKEN=hf_xxxxxxxxxxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Estimated Timeline

| Task | Time | Total |
|------|------|-------|
| 1. Hugging Face setup | 30 min | 30 min |
| 2. Chat UI component | 45 min | 75 min |
| 3. Floating button & modal | 30 min | 105 min |
| 4. Backend/API logic | 45 min | 150 min |
| 5. Conversation context | 30 min | 180 min |
| 6. Location filtering & recommendations | 45 min | 225 min |
| 7. Testing & refinement | 30 min | 255 min |
| **TOTAL** | | **~4 hours** |

---

## Quality Notes

### Hugging Face Free Tier
- **Speed:** 5-15 seconds per response (inference time)
- **Quality:** Good but not as good as OpenAI/Claude
- **Reliability:** ✅ Good for MVP
- **Cost:** Free
- **Limits:** Rate limited, but fine for low traffic

### Optimizations
- Cache common responses
- Show loading state during inference
- Debounce send button
- Pre-warm model on app load (optional)

---

## Success Criteria

- ✅ User can type "I want a villa near Tunis for 200/day"
- ✅ Bot understands and filters locations
- ✅ Shows matching locations with images from CDN
- ✅ Conversation flows naturally
- ✅ Mobile responsive
- ✅ No blocking errors

---

## Notes

- Hugging Face free API may have slight latency (5-15s per message)
- Better for short, focused conversations
- If speed becomes issue, upgrade to OpenAI ($$$) or self-hosted model
- Can add "typing indicator" during HF API call
- Consider debouncing rapid messages

---

## Next Steps

1. Approve this plan
2. Get Hugging Face API token
3. I'll implement all 7 steps
4. Test end-to-end
5. Deploy to Vercel

**Start time:** Ready whenever
**Estimated completion:** ~4 hours
