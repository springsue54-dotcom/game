/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Heart, Ghost, Zap, CloudRain, Smile } from 'lucide-react';
import { Emotion, Message, ChatState } from './types';
import { getChatResponse } from './services/geminiService';

const EMOTION_CONFIG: Record<Emotion, { color: string, icon: React.ReactNode, label: string }> = {
  Joy: { color: 'var(--color-joy)', icon: <Smile className="w-6 h-6" />, label: 'Joyful' },
  Sadness: { color: 'var(--color-sadness)', icon: <CloudRain className="w-6 h-6" />, label: 'Melancholy' },
  Anger: { color: 'var(--color-anger)', icon: <Zap className="w-6 h-6" />, label: 'Fired Up' },
  Fear: { color: 'var(--color-fear)', icon: <Ghost className="w-6 h-6" />, label: 'Anxious' },
  Surprise: { color: 'var(--color-surprise)', icon: <Sparkles className="w-6 h-6" />, label: 'Amazed' },
  Neutral: { color: 'var(--color-neutral)', icon: <Heart className="w-6 h-6" />, label: 'Peaceful' },
};

export default function App() {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        role: 'model',
        text: "Hello there. I'm SoulEcho. I can feel the rhythm of your words. How are you feeling today?",
        emotion: 'Neutral',
        timestamp: Date.now(),
      }
    ],
    aiEmotion: 'Neutral',
    playerEmotion: 'Neutral',
    isTyping: false,
  });

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.isTyping]);

  const handleSend = async () => {
    if (!input.trim() || state.isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      emotion: 'Neutral', // Will be updated by AI response
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isTyping: true,
    }));
    setInput('');

    const history = state.messages.concat(userMsg).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const result = await getChatResponse(history);

    setState(prev => {
      const updatedMessages = [...prev.messages];
      // Update the last user message with detected emotion
      const lastUserMsgIndex = updatedMessages.findLastIndex(m => m.role === 'user');
      if (lastUserMsgIndex !== -1) {
        updatedMessages[lastUserMsgIndex] = {
          ...updatedMessages[lastUserMsgIndex],
          emotion: result.userEmotion as Emotion,
        };
      }

      return {
        ...prev,
        messages: [
          ...updatedMessages,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: result.reply,
            emotion: result.aiEmotion as Emotion,
            timestamp: Date.now(),
          }
        ],
        aiEmotion: result.aiEmotion as Emotion,
        playerEmotion: result.userEmotion as Emotion,
        isTyping: false,
      };
    });
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black font-sans">
      {/* Background Emotion Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            backgroundColor: EMOTION_CONFIG[state.aiEmotion].color,
            scale: [1, 1.2, 1],
            x: ['-10%', '10%', '-10%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full emotion-glow"
        />
        <motion.div
          animate={{
            backgroundColor: EMOTION_CONFIG[state.playerEmotion].color,
            scale: [1.2, 1, 1.2],
            x: ['10%', '-10%', '10%'],
            y: ['10%', '-10%', '10%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full emotion-glow"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-4xl h-[90vh] flex flex-col md:flex-row gap-6 p-4">
        
        {/* Left Side: AI & Player Resonance Status */}
        <div className="flex-1 flex flex-col items-center justify-around glass-panel rounded-3xl p-6 py-8 min-h-0">
          
          {/* AI Section */}
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">SoulEcho's Heart</span>
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: `0 0 30px ${EMOTION_CONFIG[state.aiEmotion].color}`,
                  scale: state.isTyping ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.aiEmotion}
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
                    className="text-white"
                    style={{ color: EMOTION_CONFIG[state.aiEmotion].color }}
                  >
                    {React.cloneElement(EMOTION_CONFIG[state.aiEmotion].icon as React.ReactElement, { className: "w-12 h-12 md:w-16 md:h-16" })}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-medium tracking-widest uppercase whitespace-nowrap"
                animate={{ color: EMOTION_CONFIG[state.aiEmotion].color }}
              >
                {EMOTION_CONFIG[state.aiEmotion].label}
              </motion.div>
            </div>
          </div>

          {/* Divider with Title */}
          <div className="flex flex-col items-center gap-1 py-2">
            <div className="h-px w-8 bg-white/10" />
            <h1 className="text-sm font-light tracking-[0.3em] uppercase text-white/40">Resonance</h1>
            <div className="h-px w-8 bg-white/10" />
          </div>

          {/* Player Section */}
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">Your Resonance</span>
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: `0 0 30px ${EMOTION_CONFIG[state.playerEmotion].color}`,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={state.playerEmotion}
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
                    className="text-white"
                    style={{ color: EMOTION_CONFIG[state.playerEmotion].color }}
                  >
                    {React.cloneElement(EMOTION_CONFIG[state.playerEmotion].icon as React.ReactElement, { className: "w-12 h-12 md:w-16 md:h-16" })}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-medium tracking-widest uppercase whitespace-nowrap"
                animate={{ color: EMOTION_CONFIG[state.playerEmotion].color }}
              >
                {EMOTION_CONFIG[state.playerEmotion].label}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-[1.5] flex flex-col glass-panel rounded-3xl overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
          >
            {state.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  {msg.role === 'model' ? (
                    <Sparkles className="w-3 h-3 text-white/30" />
                  ) : (
                    <User className="w-3 h-3 text-white/30" />
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    {msg.role === 'model' ? 'SoulEcho' : 'You'}
                  </span>
                  <span 
                    className="text-[10px] font-bold"
                    style={{ color: EMOTION_CONFIG[msg.emotion].color }}
                  >
                    • {msg.emotion}
                  </span>
                </div>
                <div 
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-white/10 text-white rounded-tr-none' 
                      : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {state.isTyping && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <Sparkles className="w-3 h-3 text-white/30 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-white/30">SoulEcho is feeling...</span>
                </div>
                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Share your thoughts..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || state.isTyping}
                className="absolute right-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-[9px] text-center uppercase tracking-[0.2em] text-white/20">
              SoulEcho senses your emotional frequency
            </p>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/20 uppercase tracking-widest">
        Powered by Gemini AI • Emotional Resonance Engine v1.0
      </footer>
    </div>
  );
}
