import { create } from 'zustand';

export const useStore = create((set) => ({
  step: 1, // 1: Input, 2: Dashboard
  energyUsageKwh: 1000,
  location: '',
  budget: 20000,
  simulationResult: null,
  
  setStep: (step) => set({ step }),
  setEnergyUsage: (energy) => set({ energyUsageKwh: energy }),
  setLocation: (location) => set({ location }),
  setBudget: (budget) => set({ budget }),
  setSimulationResult: (result) => set({ simulationResult: result }),
}));
