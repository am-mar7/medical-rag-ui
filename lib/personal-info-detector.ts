export interface DetectedPersonalInfo {
  hasPersonalInfo: boolean;
  extractedContext: string;
  matchedCategories: string[];
}

export function detectPersonalInfo(query: string): DetectedPersonalInfo {
  if (!query || query.trim().length < 5) {
    return { hasPersonalInfo: false, extractedContext: '', matchedCategories: [] };
  }

  const text = query.trim();
  const lower = text.toLowerCase();
  const categories: string[] = [];
  const extractedParts: string[] = [];

  // 1. Blood Pressure pattern (e.g. 165/105 or 120/80)
  const bpMatch = text.match(/\b(\d{2,3}\s*\/\s*\d{2,3})\b/);
  if (bpMatch || lower.includes('blood pressure') || lower.includes(' bp ') || lower.includes('ضغط')) {
    categories.push('Blood Pressure / Hypertension');
    if (bpMatch) {
      extractedParts.push(`Blood Pressure: ${bpMatch[1]}`);
    } else {
      extractedParts.push('Hypertension / Blood pressure history');
    }
  }

  // 2. Age pattern (e.g. 45 years old, I am 50, aged 60)
  const ageMatch = text.match(/\b(i am|i'm|age(d)?|my age is)\s+(\d{1,3})\b/i) ||
                   text.match(/\b(\d{1,3})\s*(years old|yo|y\/o|year old)\b/i);
  if (ageMatch) {
    const ageNum = ageMatch[3] || ageMatch[1];
    if (ageNum && parseInt(ageNum, 10) > 0 && parseInt(ageNum, 10) < 120) {
      categories.push('Age');
      extractedParts.push(`Age: ${ageNum} years old`);
    }
  }

  // 3. Personal Diagnosis / Health History statements (I have..., I am diagnosed with..., My doctor...)
  const personalStatementMatch = lower.match(/\b(i have|i'm diagnosed with|i was diagnosed with|suffering from|suffer from|diagnosed with|my history of|my condition|أنا مريض|اعاني من|عندي)\b/i);
  
  const conditionKeywords = [
    'hypertension', 'diabetes', 'asthma', 'cholesterol', 'arthritis',
    'heart disease', 'cardiac', 'kidney', 'arrhythmia', 'stroke', 'hypotension',
    'الضغط', 'السكر', 'الربو', 'الكوليسترول', 'القلب'
  ];

  const foundConditions = conditionKeywords.filter(cond => lower.includes(cond));
  if (foundConditions.length > 0 && (personalStatementMatch || categories.length > 0)) {
    categories.push('Medical Conditions');
    const conditionStr = foundConditions.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
    if (!extractedParts.some(p => p.toLowerCase().includes('condition'))) {
      extractedParts.push(`Diagnosed Condition(s): ${conditionStr}`);
    }
  }

  // 4. Medications & Allergies
  if (lower.includes('taking') || lower.includes('medication') || lower.includes('allergic to') || lower.includes('dose') || lower.includes('علاج') || lower.includes('دواء')) {
    categories.push('Medications / Allergies');
    // Extract potential medication sentence
    const medSentences = text.split(/[.!?\n]/).filter(s => 
      /taking|medication|dose|allergic|دواء|علاج|باخد/.test(s.toLowerCase())
    );
    if (medSentences.length > 0) {
      extractedParts.push(medSentences[0].trim());
    }
  }

  const hasPersonal = categories.length > 0 || (personalStatementMatch !== null && foundConditions.length > 0);

  // If detected but extractedParts is sparse, use the clean query or key sentence as context preview
  let finalContext = extractedParts.join('; ');
  if (!finalContext && hasPersonal) {
    finalContext = text;
  }

  return {
    hasPersonalInfo: hasPersonal,
    extractedContext: finalContext,
    matchedCategories: categories,
  };
}
