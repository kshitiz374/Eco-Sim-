export const calculateEcoSim = (energyUsageKwh, location, budget) => {
  // Mock data for MVP: Real implementation would fetch from NASA Power API / PVWatts
  const avgSolarIrradiance = 4.5; // kWh/m2/day
  const gridRate = 0.16; // $/kWh (national average)
  const solarCostPerWatt = 3.00; // $3.00/W installed
  const annualInflation = 0.03; // 3%
  const panelDegradation = 0.005; // 0.5% per year
  
  const annualEnergyNeeds = energyUsageKwh * 12;
  
  // Sizing system to cover 100% of usage
  // System Size (kW) = (Annual Usage / 365) / Irradiance / efficiency(0.8)
  const systemSizeKw = (annualEnergyNeeds / 365) / avgSolarIrradiance / 0.8;
  const totalCost = systemSizeKw * 1000 * solarCostPerWatt;
  
  // Tax credit 30%
  const netCost = totalCost * 0.7;
  
  // Check budget constraints
  const canAfford = netCost <= budget;
  
  // Calculate 20 year projection
  let gridCostCumulative = 0;
  let solarSavingsCumulative = 0;
  let currentGridRate = gridRate;
  
  const timeline = [];
  
  for (let year = 1; year <= 20; year++) {
    // Grid calculation
    const yearlyGridCost = annualEnergyNeeds * currentGridRate;
    gridCostCumulative += yearlyGridCost;
    
    // Solar production with degradation
    const currentProduction = annualEnergyNeeds * Math.pow(1 - panelDegradation, year - 1);
    const gridOffsetValue = currentProduction * currentGridRate;
    
    // Maintenance/hidden costs
    let maintenance = year === 10 ? 3000 : 100; // $3k inverter replacement at yr 10
    
    solarSavingsCumulative += (gridOffsetValue - maintenance);
    
    timeline.push({
      year,
      gridCost: Math.round(gridCostCumulative),
      solarSavings: Math.round(solarSavingsCumulative - netCost),
      maintenance
    });
    
    currentGridRate *= (1 + annualInflation);
  }
  
  // Best Fit Score (0-100)
  // Factors: Budget compatibility, ROI timeline, overall savings
  const breakEvenYear = timeline.find(t => t.solarSavings > 0)?.year || 20;
  let score = 100;
  
  if (!canAfford) score -= 30;
  score -= (breakEvenYear - 5) * 2; // Deduct for longer payback
  if (score < 0) score = 10;
  if (score > 100) score = 100;
  
  return {
    netCost: Math.round(netCost),
    systemSizeKw: systemSizeKw.toFixed(2),
    timeline,
    breakEvenYear,
    canAfford,
    score: Math.round(score),
    total20YearSavings: Math.round(timeline[19].solarSavings)
  };
};
