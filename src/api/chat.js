import { HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';

const hf = new HfInference(import.meta.env.VITE_HF_API_TOKEN);
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function chatWithBot(message, conversationHistory = []) {
  try {
    // Build system prompt with location context
    const systemPrompt = `You are a helpful Capsul rental assistant. Help users find the perfect rental location in Tunisia.
When users describe what they're looking for, extract: budget range (min/max per night), location/city, and amenities.
Provide friendly, conversational responses. Answer in the same language as the user (French or English).`;

    // Prepare conversation for the model
    const messages = [
      ...conversationHistory.slice(-4).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Call Hugging Face with chat format
    const response = await hf.chatCompletion({
      model: 'mistralai/Mistral-7B-Instruct-v0.1',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const botReply = response.choices[0].message.content;

    // Extract filters from user message
    const filters = extractFilters(message);

    // Query locations if filters detected
    let locations = null;
    if (filters.city || filters.minBudget || filters.maxBudget) {
      locations = await queryLocations(filters);
    }

    // Format final response
    const finalReply = locations && locations.length > 0
      ? `${botReply}\n\n📍 Locations found:\n${formatLocations(locations)}`
      : botReply;

    return { reply: finalReply, locations };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      reply: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
      error: error.message
    };
  }
}

function extractFilters(message) {
  const filters = {};

  // Budget extraction
  const budgetMatch = message.match(/(\d+)\s*(?:to|à|-)\s*(\d+)|(\d+)\s*(?:per|par|\/)/);
  if (budgetMatch) {
    filters.minBudget = parseInt(budgetMatch[1] || budgetMatch[3]);
    filters.maxBudget = parseInt(budgetMatch[2] || budgetMatch[1] || budgetMatch[3]);
  }

  // Location/city extraction
  const cities = ['tunis', 'sfax', 'sousse', 'djerba', 'nabeul', 'monastir', 'hammamet', 'gafsa'];
  for (const city of cities) {
    if (message.toLowerCase().includes(city)) {
      filters.city = city;
      break;
    }
  }

  // Amenities
  const amenities = ['pool', 'wifi', 'kitchen', 'balcony', 'garden'];
  filters.amenities = amenities.filter(a => message.toLowerCase().includes(a));

  return filters;
}

async function queryLocations(filters) {
  try {
    let query = supabase.from('locations').select('*');

    if (filters.minBudget) query = query.gte('price', filters.minBudget);
    if (filters.maxBudget) query = query.lte('price', filters.maxBudget);
    if (filters.city) query = query.ilike('city', `%${filters.city}%`);

    const { data, error } = await query.limit(5);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

function formatLocations(locations) {
  return locations
    .map(loc => `• ${loc.name} - ${loc.price}€/night (${loc.city})`)
    .join('\n');
}
