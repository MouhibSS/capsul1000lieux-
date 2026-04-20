import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ChevronLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ChatBot({ onClose }) {
  const [step, setStep] = useState('cities'); // cities, budget, results
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch unique cities on load
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('city')
          .eq('published', true)
          .order('city');

        if (error) throw error;

        // Get unique cities
        const uniqueCities = [...new Set(data.map(d => d.city))].sort();
        setCities(uniqueCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities(['Tunis', 'Sousse', 'Hammamet', 'Djerba']);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setStep('budget');
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('locations')
        .select('*')
        .eq('published', true)
        .eq('city', selectedCity)
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .order('price');

      const { data, error } = await query;

      if (error) throw error;
      setResults(data || []);
      setStep('results');
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass flex flex-col h-full rounded-xl"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-outline-variant/20">
        <h2 className="font-display text-sm font-medium tracking-[0.25em] text-gold uppercase">
          Capsul Search
        </h2>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-gold transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* Cities Step */}
          {step === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-4">
                <p className="text-on-surface text-sm mb-4">
                  Choose a city to explore available locations:
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin">
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {cities.map(city => (
                    <motion.button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 bg-gold/15 hover:bg-gold/25 border border-gold/40 text-on-surface rounded-lg text-sm transition-colors"
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Budget Step */}
          {step === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('cities')}
                className="flex items-center gap-2 text-gold text-sm mb-4 hover:text-gold-light"
              >
                <ChevronLeft size={16} />
                Back to cities
              </button>

              <p className="text-on-surface text-sm mb-4">
                Set your budget range for <span className="text-gold font-medium">{selectedCity}</span>:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-on-surface-variant text-xs mb-2 block">
                    Min: €{minPrice}/night
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={minPrice}
                    onChange={e => setMinPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-on-surface-variant text-xs mb-2 block">
                    Max: €{maxPrice}/night
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={maxPrice}
                    onChange={e => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full mt-4 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Searching...' : `Search (€${minPrice}-${maxPrice})`}
                </button>
              </div>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('budget')}
                className="flex items-center gap-2 text-gold text-sm mb-4 hover:text-gold-light"
              >
                <ChevronLeft size={16} />
                Change filters
              </button>

              <p className="text-on-surface-variant text-xs mb-3">
                Found {results.length} location{results.length !== 1 ? 's' : ''} in {selectedCity}
              </p>

              {results.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-on-surface-variant text-sm">
                    No locations found in this price range.
                  </p>
                  <button
                    onClick={() => setStep('budget')}
                    className="text-gold text-sm mt-2 hover:text-gold-light"
                  >
                    Adjust budget →
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {results.map(location => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-surface-container/60 border border-outline-variant/20 rounded-lg"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="text-on-surface font-medium text-sm">
                            {location.name}
                          </h3>
                          <p className="text-on-surface-variant text-xs mt-1">
                            {location.type || 'Property'}
                          </p>
                          {location.description && (
                            <p className="text-on-surface-variant text-xs mt-1 line-clamp-2">
                              {location.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-medium text-sm">
                            €{location.price}
                          </p>
                          <p className="text-on-surface-variant text-xs">per night</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
