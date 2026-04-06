/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessCost, FinanceAnalysis, AISuggestion, BusinessTemplate } from './types';
import { BusinessCostCalculator } from './components/BusinessCostCalculator';
import { BudgetGapAnalyzer } from './components/BudgetGapAnalyzer';
import { LoanRecommendation } from './components/LoanRecommendation';
import { Dashboard } from './components/Dashboard';
import { AISuggestions } from './components/AISuggestions';
import { BusinessTemplates } from './components/BusinessTemplates';
import { getAISuggestions } from './services/gemini';
import { BrainCircuit, Rocket, ChevronRight, Sparkles, Target, ArrowRight } from 'lucide-react';

export default function App() {
  const [costs, setCosts] = useState<BusinessCost[]>([]);
  const [availableCapital, setAvailableCapital] = useState<number>(0);
  const [selectedLoan, setSelectedLoan] = useState<FinanceAnalysis['selectedLoan']>();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<BusinessTemplate | null>(null);

  const analysis = useMemo((): FinanceAnalysis => {
    const totalRequired = costs.reduce((sum, c) => sum + c.amount, 0);
    const gap = Math.max(0, totalRequired - availableCapital);
    return {
      totalRequired,
      availableCapital,
      gap,
      selectedLoan,
    };
  }, [costs, availableCapital, selectedLoan]);

  const handleSelectTemplate = (template: BusinessTemplate) => {
    setActiveTemplate(template);
    const newCosts = template.defaultCosts.map(c => ({
      id: crypto.randomUUID(),
      category: c.category,
      amount: c.amount
    }));
    setCosts(newCosts);
    
    // Auto-calculate suggested loan for the gap
    const totalRequired = newCosts.reduce((sum, c) => sum + c.amount, 0);
    const gap = Math.max(0, totalRequired - availableCapital);
    
    // This will be handled by the LoanRecommendation component when it renders
    // but we can pre-set some state if needed.
    setSelectedLoan(undefined);
  };

  const fetchAI = async () => {
    if (costs.length === 0) return;
    setLoadingAI(true);
    const result = await getAISuggestions(costs, analysis);
    setSuggestions(result);
    setLoadingAI(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (costs.length > 0) fetchAI();
    }, 2000);
    return () => clearTimeout(timer);
  }, [costs, availableCapital, selectedLoan]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FinAnalyzer</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Business Intelligence</p>
            </div>
          </motion.div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1 text-blue-600"><Rocket className="w-4 h-4" /> Plan</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span>Fund</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span>Execute</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000" 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> Powered by Gemini 3
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
              From Idea to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Execution</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
              Calculate startup costs, analyze budget gaps, and get AI-driven loan recommendations for your next big venture.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Templates & Inputs */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <BusinessTemplates onSelect={handleSelectTemplate} />
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTemplate && (
                <motion.div
                  key={activeTemplate.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 overflow-hidden relative"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">{activeTemplate.name}</h3>
                    <p className="text-blue-100 text-sm mb-4">{activeTemplate.description}</p>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full">
                      <Target className="w-3 h-3" /> Template Active
                    </div>
                  </div>
                  <img 
                    src={activeTemplate.image} 
                    alt="" 
                    className="absolute top-0 right-0 w-1/2 h-full object-cover opacity-20 grayscale"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Middle Column: Calculator & Loans */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <BusinessCostCalculator costs={costs} onUpdate={setCosts} />
              </motion.section>
              
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <BudgetGapAnalyzer 
                  totalRequired={analysis.totalRequired} 
                  availableCapital={availableCapital} 
                  onAvailableChange={setAvailableCapital} 
                />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <LoanRecommendation 
                  gap={analysis.gap} 
                  onSelect={setSelectedLoan} 
                />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <AISuggestions 
                  suggestions={suggestions} 
                  loading={loadingAI} 
                  onRefresh={fetchAI} 
                />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Dashboard costs={costs} analysis={analysis} />
              </motion.section>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">FinAnalyzer</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} AI Business Finance Analyzer. Built with Gemini 3.
          </p>
        </div>
      </footer>
    </div>
  );
}


