import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ChevronLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ChatBot({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('greeting'); // greeting, cities, filters, budget, results
  const [cities, setCities] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cities and tags on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('city, tags')
          .eq('published', true);

        if (error) throw error;

        // Get unique cities
        const uniqueCities = [...new Set(data.map(d => d.city))].sort();
        setCities(uniqueCities);

        // Get unique tags
        const tagsSet = new Set();
        data.forEach(d => {
          if (d.tags && Array.isArray(d.tags)) {
            d.tags.forEach(tag => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet).sort());
      } catch (error) {
        console.error('Error fetching data:', error);
        setCities(['Tunis', 'Sousse', 'Hammamet', 'Djerba']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedTags([]);
    setStep('filters');
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
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

      // Filter by tags if selected
      let filtered = data || [];
      if (selectedTags.length > 0) {
        filtered = filtered.filter(loc =>
          selectedTags.some(tag =>
            loc.tags && Array.isArray(loc.tags) && loc.tags.includes(tag)
          )
        );
      }

      setResults(filtered);
      setStep('results');
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (locationId) => {
    onClose();
    navigate(`/location/${locationId}`);
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
          {/* Greeting Step */}
          {step === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                <div className="bg-gold/15 border border-gold/30 rounded-lg p-4">
                  <p className="text-on-surface font-medium mb-2">
                    👋 Hello! I'm your Capsul Assistant
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    I'll help you find the perfect rental location in Tunisia. Let me show you what's available!
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                    Popular suggestions:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.slice(0, 4).map(city => (
                      <motion.button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-surface-container/60 hover:bg-gold/20 border border-outline-variant/30 hover:border-gold/40 text-on-surface rounded-lg text-sm transition-all"
                      >
                        📍 {city}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep('cities')}
                  className="w-full mt-4 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  See all cities
                </button>
              </div>
            </motion.div>
          )}

          {/* Cities Step */}
          {step === 'cities' && (
            <motion.div
              key="cities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('greeting')}
                className="flex items-center gap-2 text-gold text-sm mb-4 hover:text-gold-light"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <p className="text-on-surface text-sm mb-4">
                Choose a city:
              </p>

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

          {/* Filters Step */}
          {step === 'filters' && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('greeting')}
                className="flex items-center gap-2 text-gold text-sm mb-4 hover:text-gold-light"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <p className="text-on-surface text-sm mb-4">
                Filters for <span className="text-gold font-medium">{selectedCity}</span>:
              </p>

              <div className="space-y-4">
                {/* Budget Range */}
                <div>
                  <label className="text-on-surface-variant text-xs mb-2 block font-medium">
                    BUDGET: €{minPrice} - €{maxPrice}/night
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={minPrice}
                    onChange={e => setMinPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={maxPrice}
                    onChange={e => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div>
                    <label className="text-on-surface-variant text-xs mb-2 block font-medium">
                      TAGS & FEATURES
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <motion.button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-gold/30 border border-gold text-gold'
                              : 'bg-surface-container/60 border border-outline-variant/20 text-on-surface-variant hover:border-gold/40'
                          }`}
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full mt-4 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold px-4 py-3 rounded-lg disabled:opacity-50 transition-colors font-medium text-sm"
                >
                  {loading ? 'Searching...' : 'Search Locations'}
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
                onClick={() => setStep('filters')}
                className="flex items-center gap-2 text-gold text-sm mb-4 hover:text-gold-light"
              >
                <ChevronLeft size={16} />
                Change filters
              </button>

              <p className="text-on-surface-variant text-xs mb-3 font-medium">
                FOUND {results.length} LOCATION{results.length !== 1 ? 'S' : ''} • €{minPrice}-{maxPrice}
                {selectedTags.length > 0 && ` • ${selectedTags.join(', ')}`}
              </p>

              {results.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-on-surface-variant text-sm">
                    No locations match your filters.
                  </p>
                  <button
                    onClick={() => setStep('filters')}
                    className="text-gold text-sm mt-2 hover:text-gold-light"
                  >
                    Adjust filters →
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {results.map(location => (
                    <motion.button
                      key={location.id}
                      onClick={() => handleLocationClick(location.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="w-full text-left p-3 bg-surface-container/60 hover:bg-surface-container/80 border border-outline-variant/20 hover:border-gold/40 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="text-on-surface font-medium text-sm group-hover:text-gold transition-colors">
                            {location.name}
                          </h3>
                          <p className="text-on-surface-variant text-xs mt-1">
                            {location.type || 'Property'}
                          </p>
                          {location.tags && location.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {location.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-gold font-medium text-sm">
                            €{location.price}
                          </p>
                          <p className="text-on-surface-variant text-xs">per night</p>
                        </div>
                      </div>
                    </motion.button>
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
