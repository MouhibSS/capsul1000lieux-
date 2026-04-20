# Capsul AI Chatbot - Implementation Guide

## Overview
The Capsul chatbot is a fully-featured AI assistant that helps users find rental locations in Tunisia using natural language processing and real-time Supabase queries.

## Architecture

### Components

#### Frontend (React)
- **ChatBotModal.jsx** - Floating button + modal UI matching site design
- **ChatBot.jsx** - Chat interface with glass morphism styling
  - Message history
  - Typing indicators
  - Gold/dark theme matching the main site
  - Framer Motion animations

#### Backend (Express.js)
- **server.js** - Production-ready API server running on port 3001
  - HuggingFace integration (Mistral-7B model)
  - Supabase queries for location data
  - Smart filter extraction from user messages
  - Session management for conversation history

#### API Routes
- `POST /api/chat` - Main chat endpoint
  - Input: `{ message, conversationHistory }`
  - Output: `{ reply, locations }`

## Features

### AI Understanding
- **Location Recognition**: Understands any Tunisian location (Tunis, La Marsa, Hammamet, Sidi Bou Said, etc.)
- **Budget Parsing**: Extracts price ranges ("100-200", "100 per night", etc.)
- **Property Types**: Identifies villa, apartment, studio preferences
- **Amenities**: Detects desired amenities (pool, wifi, kitchen, balcony, etc.)
- **Flexible Spelling**: Handles location name variations (e.g., "Sidi Bousaid" = "Sidi Bou Said")

### Smart Responses
- Natural conversation flow with Mistral-7B
- Context-aware replies (remembers last 4 messages)
- Returns matching locations when filters detected
- Graceful fallback responses for unclear requests

### Database Integration
- Live Supabase queries for available locations
- Filters by price, city, property type
- Returns published locations only
- Image and amenity data included

## Setup

### Environment Variables
Required in `.env.local`:
```
VITE_HF_API_TOKEN=hf_xxxxxxxxxxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Development
```bash
npm run dev
```
Runs both:
- Express API server on port 3001
- Vite dev server on port 3000+ (finds available port)

### Production
- Frontend: Deploy to Vercel (builds from `src/`)
- API: Use Vercel serverless functions (`/api/chat.js`)
- Both use same `.env` variables

## Key Files
- `server.js` - Dev API server
- `api/chat.js` - Production Vercel serverless function
- `src/components/ChatBot.jsx` - Chat UI
- `src/components/ChatBotModal.jsx` - Modal wrapper
- `src/utils/mockChat.js` - Removed (replaced with real API)

## Filter Extraction Logic
The server intelligently extracts:

1. **Location** - Finds city names with case-insensitive matching
   - Handles variants: "Sidi Bousaid", "Sidi Bou Said"
   - Searches for capitalized words
   - Falls back if no match found

2. **Budget** - Parses:
   - "100-200" → min: 100, max: 200
   - "100 to 200" → min: 100, max: 200  
   - "100/night" → min: 100, max: 100

3. **Type** - Looks for: villa, apartment, studio

4. **Amenities** - Detects: pool, wifi, kitchen, balcony, garden, parking

## Supabase Query
```javascript
SELECT id, name, city, price, amenities, image_urls, type
FROM locations
WHERE published = true
  AND city ILIKE '%user_location%'
  AND price >= min_budget (if provided)
  AND price <= max_budget (if provided)
  AND type = property_type (if provided)
LIMIT 5
```

## Conversation Flow Example

**User:** "I'm looking for a place in Sidi Bou Said for 120 euros per night with a pool"

**Processing:**
1. Extract: city="sidi bou said", budget=120, amenities=["pool"]
2. Call Mistral-7B for conversational response
3. Query Supabase for locations matching filters
4. Combine bot reply + location results

**Response:**
```
Excellent! Sidi Bou Said is magnifique with beautiful villas. 
I found these options for you:

📍 Locations found:
• Villa Prestige - 120€/night (Sidi Bou Said)
• Maison Côtière - 150€/night (Sidi Bou Said)
```

## Performance
- **Response Time**: 5-15 seconds (HF inference time)
- **Concurrent Users**: Scales with Vercel serverless
- **Rate Limiting**: HF free tier allows ~30 requests/minute
- **Error Handling**: Graceful fallbacks if HF or Supabase down

## Future Enhancements
- Conversation memory (save preferred searches)
- Multi-language support (detect language automatically)
- Booking integration
- Rating/reviews in recommendations
- Image carousel in chat
- Availability checking
