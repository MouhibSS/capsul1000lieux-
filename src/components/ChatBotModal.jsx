import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatBot from './ChatBot';

export default function ChatBotModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Modal Backdrop + Chat */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-auto h-auto sm:w-96 sm:h-[32rem] rounded-lg sm:rounded-xl overflow-hidden max-h-[90vh] sm:max-h-none"
            >
              <ChatBot onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
