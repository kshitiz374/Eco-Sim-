import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { calculateEcoSim } from '../utils/simulationEngine';
import { Zap, MapPin, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Wizard() {
  const { 
    energyUsageKwh, setEnergyUsage,
    location, setLocation,
    budget, setBudget,
    setStep, setSimulationResult
  } = useStore();

  const [localStep, setLocalStep] = useState(1);

  const handleNext = () => {
    if (localStep < 3) {
      setLocalStep(localStep + 1);
    } else {
      // Run Simulation and move to Dashboard
      const result = calculateEcoSim(energyUsageKwh, location, budget);
      setSimulationResult(result);
      setStep(2);
    }
  };

  const handleBack = () => {
    if (localStep > 1) {
      setLocalStep(localStep - 1);
    }
  };

  const slideVariants = {
    hiddenRight: { x: 50, opacity: 0 },
    hiddenLeft: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exitRight: { x: 50, opacity: 0, transition: { duration: 0.3 } },
    exitLeft: { x: -50, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="absolute top-8 left-8 flex items-center gap-3 text-emerald-700 font-bold text-2xl tracking-tight">
        <img src="/icon.png" alt="Eco-Sim Optimizer Logo" className="w-10 h-10" />
        Eco-Sim Optimizer
      </div>

      <div className="w-full max-w-xl">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
            <span className={localStep >= 1 ? 'text-emerald-600' : ''}>Energy</span>
            <span className={localStep >= 2 ? 'text-emerald-600' : ''}>Location</span>
            <span className={localStep >= 3 ? 'text-emerald-600' : ''}>Budget</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(localStep / 3) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card relative overflow-hidden min-h-[350px] flex flex-col">
          <AnimatePresence mode="wait">
            
            {localStep === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="hiddenRight"
                animate="visible"
                exit="exitLeft"
                className="flex flex-col flex-grow"
              >
                <div className="flex items-center gap-3 mb-6 text-emerald-600">
                  <div className="p-3 bg-emerald-100 rounded-full"><Zap className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-semibold text-slate-800">Energy Consumption</h2>
                </div>
                <p className="text-slate-600 mb-6">What is your average monthly electricity usage?</p>
                <div className="relative">
                  <input 
                    type="number" 
                    value={energyUsageKwh}
                    onChange={(e) => setEnergyUsage(Number(e.target.value))}
                    className="input-field pl-4 pr-16 text-lg"
                    placeholder="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kWh</span>
                </div>
              </motion.div>
            )}

            {localStep === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="hiddenRight"
                animate="visible"
                exit="exitLeft"
                className="flex flex-col flex-grow"
              >
                <div className="flex items-center gap-3 mb-6 text-emerald-600">
                  <div className="p-3 bg-emerald-100 rounded-full"><MapPin className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-semibold text-slate-800">Geographic Location</h2>
                </div>
                <p className="text-slate-600 mb-6">Where is the property located? This helps us fetch accurate solar irradiance data.</p>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field text-lg"
                  placeholder="e.g. Austin, TX or ZIP Code"
                />
              </motion.div>
            )}

            {localStep === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="hiddenRight"
                animate="visible"
                exit="exitLeft"
                className="flex flex-col flex-grow"
              >
                <div className="flex items-center gap-3 mb-6 text-emerald-600">
                  <div className="p-3 bg-emerald-100 rounded-full"><DollarSign className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-semibold text-slate-800">Budget Constraints</h2>
                </div>
                <p className="text-slate-600 mb-6">What is your maximum upfront budget for installation?</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input 
                    type="number" 
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="input-field pl-8 text-lg"
                    placeholder="20000"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handleBack}
              disabled={localStep === 1}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${localStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-emerald-600'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              {localStep === 3 ? 'Run Simulation' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
