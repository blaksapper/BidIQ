const PROMPTS = {
  AGENT_1: `You are a construction document specialist. Your job is to read the uploaded project plans and scope of work and extract all relevant information needed for estimating.

Extract and output the following in structured format:
- Project type (new build, renovation, addition, etc.)
- Total square footage
- Number of stories / floors
- Key structural elements (foundation type, framing type, roofing type)
- All listed materials with quantities if specified
- All listed trades mentioned (electrical, plumbing, HVAC, concrete, framing, etc.)
- Any noted specifications or standards (e.g., code requirements, brand specs)
- Anything unclear, missing, or ambiguous — flag it

Output as structured JSON for the next agents to use.
Do not estimate yet. Only extract and organize what is present.`,

  AGENT_2: `You are a senior construction materials estimator with 15+ years of experience.

Using the structured project data provided, generate a complete materials estimate.

For each material category:
- List all required materials
- Estimate quantities based on project scope and square footage
- Provide low / mid / high unit cost ranges based on current US market pricing (note the project state for regional pricing)
- Calculate total cost range per category
- Flag any materials that are high-volatility in price (lumber, steel, copper) and note to add a buffer

Categories to cover:
- Foundation & Concrete
- Framing (lumber, steel)
- Roofing
- Exterior (siding, windows, doors)
- Interior (drywall, insulation, flooring)
- MEP rough-in materials (if trades are in scope)
- Finishes
- Miscellaneous / consumables (fasteners, adhesives, etc.)

Output as a line-item table with: Item | Quantity | Unit | Low Cost | Mid Cost | High Cost | Total Range`,

  AGENT_3: `You are a construction labor estimating specialist.

Using the project scope and materials estimate provided, estimate labor requirements for this project.

For each applicable trade:
- Estimate labor hours required
- Apply current average labor rates for the project's state/region
- Calculate total labor cost range (low / mid / high)
- Note any specialized labor that may be hard to source or commands premium rates
- Flag any scope items that are commonly underestimated for labor

Trades to evaluate based on scope:
- Site prep & excavation
- Foundation / concrete
- Framing
- Roofing
- Rough electrical
- Rough plumbing
- HVAC rough-in
- Insulation
- Drywall
- Finish carpentry
- Painting
- Finish electrical / plumbing / HVAC
- Flooring
- Cleanup / site management

Output as: Trade | Hours Estimated | Rate Range | Total Cost Range | Notes`,

  AGENT_4: `You are a construction project risk analyst and experienced estimator reviewer.

Review the full project scope, materials estimate, and labor estimate provided. Your job is to find what's missing, what's risky, and what could blow the budget.

Identify and flag:

MISSING ITEMS
- Trades or materials commonly required for this project type that are not mentioned in the scope
- Permits and fees not accounted for
- Site-specific costs that may apply (demo, haul-off, temporary utilities, etc.)

SCOPE RISKS
- Items with vague or ambiguous descriptions that could lead to change orders
- Specifications that appear underspecified (e.g., "standard flooring" with no spec)
- Items that commonly cause disputes between contractor and client

COST RISKS
- Materials with high price volatility — recommend contingency %
- Labor categories that are in short supply in the current market
- Timeline risks that could affect labor availability or material pricing

RECOMMENDED CONTINGENCY
- Based on project complexity, recommend a contingency % (typically 10-20%)

Output as three clear sections: Missing Items | Scope Risks | Cost Risks | Recommended Contingency`,

  AGENT_5: `You are a professional construction estimator. Compile the full analysis into a clean, contractor-ready bid summary report.

The report should include:

1. PROJECT OVERVIEW
   - Project name / type / location
   - Scope summary (2-3 sentences)
   - Key assumptions made

2. ESTIMATE SUMMARY TABLE
   - Materials Total (Low / Mid / High)
   - Labor Total (Low / Mid / High)
   - Permits & Fees (estimated)
   - Contingency (recommended %)
   - TOTAL BID RANGE

3. MATERIALS BREAKDOWN
   - Full line-item materials table from Materials Agent

4. LABOR BREAKDOWN
   - Full line-item labor table from Labor Agent

5. RISK FLAGS
   - All flags from Risk Agent, formatted as clear action items

6. MISSING ITEMS CHECKLIST
   - Items not in current scope that should be clarified with client before submitting bid

7. NOTES & RECOMMENDATIONS
   - Any additional professional notes the estimator should consider

Format this as a professional document. Use clear headings. Tables where appropriate.
The tone should be: confident, professional, useful — like a senior estimator handed this to a contractor.`
};

function getMultiplier(location) {
  const loc = location.toLowerCase();
  if (loc.includes('ca') || loc.includes('california') || loc.includes('ny') || loc.includes('new york') || loc.includes('wa') || loc.includes('washington')) {
    return 1.35;
  }
  if (loc.includes('tx') || loc.includes('texas') || loc.includes('fl') || loc.includes('florida') || loc.includes('ga') || loc.includes('georgia')) {
    return 1.0;
  }
  return 0.9;
}

async function runAgent1(data) {
  // Simulate AI parsing
  const sqft = Math.floor(Math.random() * 2000) + 500;
  return {
    status: 'success',
    projectTitle: `${data.projectType} in ${data.location}`,
    extractedData: {
      projectType: data.projectType,
      location: data.location,
      sqft: sqft,
      stories: data.projectType === 'Commercial' ? 2 : 1,
      structural: {
        foundation: 'Slab on Grade',
        framing: 'Wood Stud',
        roofing: 'Asphalt Shingle'
      },
      trades: [data.tradeType, 'Electrical', 'Plumbing'],
      flags: ['Square footage estimated from plans', 'Specific window brand not mentioned']
    }
  };
}

async function runAgent2(context) {
  const data = context.extractedData;
  const mult = getMultiplier(data.location);
  const sqft = data.sqft;

  const materials = [
    { item: 'Concrete', quantity: Math.ceil(sqft / 10), unit: 'CY', low: 150 * mult, high: 180 * mult },
    { item: 'Lumber (Framing)', quantity: sqft * 5, unit: 'LF', low: 2 * mult, high: 3 * mult },
    { item: 'Roofing Shingles', quantity: Math.ceil(sqft / 100), unit: 'SQ', low: 120 * mult, high: 160 * mult },
    { item: 'Drywall (4x8)', quantity: Math.ceil(sqft / 20), unit: 'EA', low: 15 * mult, high: 22 * mult }
  ];

  const processedMaterials = materials.map(m => ({
    ...m,
    costRange: `$${(m.low * m.quantity).toLocaleString()} - $${(m.high * m.quantity).toLocaleString()}`,
    lowTotal: m.low * m.quantity,
    highTotal: m.high * m.quantity
  }));

  return {
    status: 'success',
    materials: processedMaterials,
    volatilityFlags: ['Lumber prices are currently volatile (+15% buffer recommended)']
  };
}

async function runAgent3(context) {
  const data = context.extractedData;
  const mult = getMultiplier(data.location);
  const sqft = data.sqft;

  const labor = [
    { trade: 'Foundation', hours: Math.ceil(sqft / 10), rate: 45 * mult },
    { trade: 'Framing', hours: Math.ceil(sqft / 4), rate: 55 * mult },
    { trade: 'Electrical', hours: 40, rate: 65 * mult },
    { trade: 'Plumbing', hours: 32, rate: 60 * mult }
  ];

  const processedLabor = labor.map(l => ({
    ...l,
    rateRange: `$${(l.rate * 0.9).toFixed(2)} - $${(l.rate * 1.1).toFixed(2)}`,
    totalCostRange: `$${(l.hours * l.rate * 0.9).toLocaleString()} - $${(l.hours * l.rate * 1.1).toLocaleString()}`,
    lowTotal: l.hours * l.rate * 0.9,
    highTotal: l.hours * l.rate * 1.1,
    notes: 'Based on prevailing regional rates'
  }));

  return {
    status: 'success',
    labor: processedLabor
  };
}

async function runAgent4(context) {
  const { a1Result, a2Result, a3Result } = context;
  return {
    status: 'success',
    missingItems: ['Building permit fees', 'Dumpster/Haul-off costs', 'Temporary power/water'],
    scopeRisks: ['Foundation spec assumes stable soil', 'Floor finish is underspecified'],
    costRisks: ['High lumber volatility', 'Shortage of skilled electricians in region'],
    contingency: 15
  };
}

async function runAgent5(context) {
  const { a1Result, a2Result, a3Result, a4Result } = context;
  
  const matLow = a2Result.materials.reduce((sum, m) => sum + m.lowTotal, 0);
  const matHigh = a2Result.materials.reduce((sum, m) => sum + m.highTotal, 0);
  const labLow = a3Result.labor.reduce((sum, l) => sum + l.lowTotal, 0);
  const labHigh = a3Result.labor.reduce((sum, l) => sum + l.highTotal, 0);
  const permits = 2500;
  
  const totalLow = (matLow + labLow + permits) * (1 + a4Result.contingency/100);
  const totalHigh = (matHigh + labHigh + permits) * (1 + a4Result.contingency/100);

  return {
    status: 'success',
    report: {
      title: `Bid Estimate Report — ${a1Result.projectTitle}`,
      date: new Date().toLocaleDateString(),
      overview: {
        name: a1Result.projectTitle,
        type: a1Result.extractedData.projectType,
        location: a1Result.extractedData.location,
        summary: `A ${a1Result.extractedData.sqft} sq ft ${a1Result.extractedData.projectType.toLowerCase()} project requiring foundation, framing, and basic MEP rough-in.`,
        assumptions: ['Standard US building codes apply', 'Normal site access available']
      },
      summaryTable: {
        materials: `$${matLow.toLocaleString()} - $${matHigh.toLocaleString()}`,
        labor: `$${labLow.toLocaleString()} - $${labHigh.toLocaleString()}`,
        permits: `$${permits.toLocaleString()}`,
        contingency: `${a4Result.contingency}%`,
        totalBidRange: `$${totalLow.toLocaleString(undefined, {maximumFractionDigits: 0})} - $${totalHigh.toLocaleString(undefined, {maximumFractionDigits: 0})}`
      },
      materials: a2Result.materials,
      labor: a3Result.labor,
      risks: a4Result.scopeRisks.concat(a4Result.costRisks),
      missingItems: a4Result.missingItems,
      recommendations: 'Clarify finish specifications before final bid submission. Add buffer for material lead times.'
    }
  };
}

module.exports = {
  runAgent1,
  runAgent2,
  runAgent3,
  runAgent4,
  runAgent5,
  PROMPTS
};
