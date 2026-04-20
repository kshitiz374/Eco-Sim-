import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { calculateEcoSim } from '../utils/simulationEngine';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const { 
    energyUsageKwh, location, budget, setBudget, setStep, 
    simulationResult, setSimulationResult 
  } = useStore();

  const [localBudget, setLocalBudget] = useState(budget);
  const [isExporting, setIsExporting] = useState(false);

  // Recalculate if budget changes via slider
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localBudget !== budget) {
        setBudget(localBudget);
        setSimulationResult(calculateEcoSim(energyUsageKwh, location, localBudget));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localBudget, budget, energyUsageKwh, location, setBudget, setSimulationResult]);

  if (!simulationResult) return null;

  const { score, canAfford, timeline, breakEvenYear, netCost, systemSizeKw, total20YearSavings } = simulationResult;

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('dashboard-content');
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EcoSim_Report_${location || 'Property'}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6" id="dashboard-content">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Your Simulation Results</h1>
            <p className="text-slate-500">Based on {energyUsageKwh} kWh/month in {location || 'your area'}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setStep(1)}
              className="btn-secondary flex items-center gap-2 py-2 text-sm"
              data-html2canvas-ignore
            >
              <RotateCcw className="w-4 h-4" /> Recalculate
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2 py-2 text-sm"
              data-html2canvas-ignore
            >
              <Download className="w-4 h-4" /> {isExporting ? 'Generating...' : 'Export PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Score & Details */}
          <div className="space-y-6">
            
            {/* Best Fit Score */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card text-center bg-emerald-900 text-white border-none"
            >
              <h3 className="text-emerald-100 font-medium mb-2 uppercase tracking-wider text-sm">Best Fit Score</h3>
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-6xl font-bold">{score}</span>
                <span className="text-xl text-emerald-300">/100</span>
              </div>
              <p className="mt-4 text-emerald-100 text-sm">
                {score >= 80 ? "Excellent Candidate for Solar" : score >= 50 ? "Good Potential, Monitor Costs" : "Grid Might Be Better Right Now"}
              </p>
            </motion.div>

            {/* Key Metrics */}
            <div className="card space-y-4">
              <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">System Specs</h3>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">System Size</span>
                <span className="font-semibold text-slate-800">{systemSizeKw} kW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Cost (after tax)</span>
                <span className="font-semibold text-slate-800">${netCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Break-even Year</span>
                <span className="font-semibold text-slate-800">Year {breakEvenYear}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">20-Year Savings</span>
                <span className="font-semibold text-emerald-600">+${total20YearSavings.toLocaleString()}</span>
              </div>
            </div>

            {/* Affordability Warning */}
            {!canAfford && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-sm">
                  <p className="font-medium">Budget Warning</p>
                  <p className="text-amber-700/80 mt-1">The net cost (${netCost.toLocaleString()}) exceeds your stated budget of ${budget.toLocaleString()}. Consider financing options.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Charts & Interactivity */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Chart Card */}
            <div className="card">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">20-Year Cost Projection</h3>
                  <p className="text-slate-500 text-sm">Cumulative Grid Cost vs. Solar Net Savings</p>
                </div>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="gridCost" name="Remaining on Grid" stroke="#64748b" fillOpacity={1} fill="url(#colorGrid)" />
                    <Area type="monotone" dataKey="solarSavings" name="Net Solar Savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSolar)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <Info className="w-4 h-4 text-slate-400" />
                Dip at Year 10 accounts for standard inverter replacement ($3,000). Grid costs assume 3% annual inflation.
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="card" data-html2canvas-ignore>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Interactive Budget Slider</h3>
                  <p className="text-slate-500 text-sm">See how changing your budget affects affordability</p>
                </div>
                <div className="text-emerald-600 font-semibold text-xl">
                  ${localBudget.toLocaleString()}
                </div>
              </div>
              
              <input 
                type="range" 
                min="5000" 
                max="50000" 
                step="1000"
                value={localBudget}
                onChange={(e) => setLocalBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>$5,000</span>
                <span>$50,000</span>
              </div>
              
              <div className="mt-6 flex items-center gap-2">
                {netCost <= localBudget ? (
                  <span className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-4 h-4" /> System is within budget
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1.5 rounded-full">
                    <AlertTriangle className="w-4 h-4" /> System exceeds budget
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
