import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const systemPrompt = `You are a helpful Capsul rental assistant. Help users find the perfect rental location in Tunisia.
Extract budget range, location preference, and amenities when users describe what they want.
Provide friendly, conversational responses in the same language as the user.`;

    const messages = [
      ...((conversationHistory || []).slice(-4).map(m => ({
        role: m.role,
        content: m.content
      })) || []),
      { role: 'user', content: message }
    ];

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation text
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const botReply = result.response.text();

    // Extract filters
    const filters = extractFilters(message);

    // Query locations if filters present
    let locations = [];
    if (filters.city || filters.minBudget || filters.maxBudget) {
      let query = supabase.from('locations').select('id, name, city, price, amenities, image_urls').eq('published', true);
      if (filters.minBudget) query = query.gte('price', filters.minBudget);
      if (filters.maxBudget) query = query.lte('price', filters.maxBudget);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);
      const { data } = await query.limit(5);
      locations = data || [];
    }

    const finalReply = locations.length > 0
      ? `${botReply}\n\n📍 Locations found:\n${locations.map(l => `• ${l.name} - ${l.price}€/night (${l.city})`).join('\n')}`
      : botReply;

    return res.status(200).json({ reply: finalReply, locations });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      reply: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
      error: error.message
    });
  }
}

function extractFilters(message) {
  const filters = {};
  const budgetMatch = message.match(/(\d+)\s*(?:to|à|-)\s*(\d+)|(\d+)\s*(?:per|par)/);
  if (budgetMatch) {
    filters.minBudget = parseInt(budgetMatch[1] || budgetMatch[3]);
    filters.maxBudget = parseInt(budgetMatch[2] || budgetMatch[1]);
  }
  const cities = ['tunis', 'sfax', 'sousse', 'djerba', 'nabeul', 'monastir', 'hammamet'];
  for (const city of cities) {
    if (message.toLowerCase().includes(city)) {
      filters.city = city;
      break;
    }
  }
  return filters;
}
