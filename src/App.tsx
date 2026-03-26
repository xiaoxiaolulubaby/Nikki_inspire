import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Plus, Trash2, RefreshCw, X, ChevronRight } from 'lucide-react';
import { PRESET_INSPIRATIONS } from './constants';

const STORAGE_KEY = 'nikki_custom_inspirations';

export default function App() {
  const [currentInspiration, setCurrentInspiration] = useState<string | null>(null);
  const [customInspirations, setCustomInspirations] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newInspiration, setNewInspiration] = useState('');
  const [showCustomList, setShowCustomList] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load custom inspirations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomInspirations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse custom inspirations', e);
      }
    }
  }, []);

  // Save custom inspirations to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customInspirations));
  }, [customInspirations]);

  const generateInspiration = useCallback(() => {
    const allInspirations = [...PRESET_INSPIRATIONS, ...customInspirations];
    if (allInspirations.length === 0) return;

    // Filter out items that were shown recently (last 30% of the pool or max 40 items)
    const historyLimit = Math.min(Math.floor(allInspirations.length * 0.4), 50);
    const available = allInspirations.filter(item => !history.includes(item));
    
    // If we ran out of "new" items, clear some history
    const sourcePool = available.length > 0 ? available : allInspirations;

    const next = sourcePool[Math.floor(Math.random() * sourcePool.length)];
    
    setCurrentInspiration(next);
    setHistory(prev => {
      const newHistory = [next, ...prev];
      return newHistory.slice(0, historyLimit);
    });
  }, [currentInspiration, customInspirations, history]);

  const addCustomInspiration = () => {
    if (newInspiration.trim()) {
      setCustomInspirations(prev => [newInspiration.trim(), ...prev]);
      setNewInspiration('');
      setIsAdding(false);
    }
  };

  const removeCustomInspiration = (index: number) => {
    setCustomInspirations(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col items-center font-serif bg-[#fdfaf6] selection:bg-[#f3e5f5] overflow-x-hidden">
      {/* Header */}
      <header className="w-full p-4 md:p-8 flex justify-between items-center z-20 bg-[#fdfaf6]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f3e5f5] flex items-center justify-center text-[#9c27b0] shrink-0">
            <Sparkles size={18} className="md:w-5 md:h-5" />
          </div>
          <h1 className="text-xs md:text-sm uppercase tracking-widest font-bold text-[#4a4a4a] whitespace-nowrap">
            Nikki Inspiration
          </h1>
        </div>
        <button
          onClick={() => setShowCustomList(true)}
          className="text-[10px] md:text-xs uppercase tracking-widest font-semibold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 py-2"
        >
          My Library <ChevronRight size={14} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12 md:py-24 text-center min-h-[60vh]">
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {!currentInspiration ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <p className="text-[#8e8e8e] italic text-base md:text-xl">
                  暂无灵感，点击下方按钮获取
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={currentInspiration}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="px-2"
              >
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#2d2d2d] leading-[1.2] md:leading-tight mb-6 break-words">
                  {currentInspiration}
                </h2>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  className="h-1 bg-[#9c27b0] mx-auto rounded-full opacity-30" 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 md:mt-20 flex flex-col items-center gap-6 md:gap-8 w-full">
          <button
            onClick={generateInspiration}
            className="group relative w-full max-w-[280px] py-4 md:py-5 bg-[#2d2d2d] text-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
          >
            <span className="relative z-10 flex items-center justify-center gap-3 text-base md:text-lg font-medium">
              <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />
              换一个
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#9c27b0] to-[#e91e63] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="text-xs md:text-sm text-[#8e8e8e] hover:text-[#9c27b0] transition-colors flex items-center gap-1.5 py-2"
          >
            <Plus size={16} /> 添加我的灵感
          </button>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="w-full p-6 md:p-10 text-center mt-auto">
        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#8e8e8e] opacity-50">
          Shining Nikki Inspiration Generator V4
        </p>
      </footer>

      {/* Add Custom Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#2d2d2d]">添加新灵感</h3>
                <button onClick={() => setIsAdding(false)} className="text-[#8e8e8e] hover:text-[#2d2d2d]">
                  <X size={24} />
                </button>
              </div>
              <input
                autoFocus
                type="text"
                value={newInspiration}
                onChange={(e) => setNewInspiration(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomInspiration()}
                placeholder="输入你的搭配灵感..."
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f5] border-none focus:ring-2 focus:ring-[#9c27b0] outline-none transition-all mb-6"
              />
              <button
                onClick={addCustomInspiration}
                disabled={!newInspiration.trim()}
                className="w-full py-4 bg-[#9c27b0] text-white rounded-xl font-bold disabled:opacity-50 transition-all hover:brightness-110"
              >
                保存灵感
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Library Drawer */}
      <AnimatePresence>
        {showCustomList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setShowCustomList(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-bottom border-[#f5f5f5] flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#2d2d2d]">我的灵感库</h3>
                <button onClick={() => setShowCustomList(false)} className="text-[#8e8e8e] hover:text-[#2d2d2d]">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {customInspirations.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-[#8e8e8e] italic">还没有添加自定义灵感哦</p>
                  </div>
                ) : (
                  customInspirations.map((item, index) => (
                    <motion.div
                      layout
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex justify-between items-center p-4 rounded-2xl bg-[#fdfaf6] border border-[#f3e5f5] hover:border-[#9c27b0] transition-all"
                    >
                      <span className="text-[#4a4a4a] font-medium">{item}</span>
                      <button
                        onClick={() => removeCustomInspiration(index)}
                        className="text-[#8e8e8e] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-8 bg-[#fdfaf6]">
                <button
                  onClick={() => {
                    setShowCustomList(false);
                    setIsAdding(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-[#9c27b0] text-[#9c27b0] rounded-2xl font-bold hover:bg-[#f3e5f5] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> 添加新灵感
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
