export enum KeywordClass {
  ATTACK = 'Attack',
  SUPPORT = 'Support',
  WASTE = 'Waste'
}

export enum PlacementRecommendation {
  TITLE = 'Title',
  BULLETS = 'Bullets',
  BACKEND = 'Backend',
  PPC_EXACT = 'PPC (Exact)',
  PPC_PHRASE = 'PPC (Phrase)',
  NEGATIVE = 'Negative',
  IGNORE = 'Ignore'
}

export interface KeywordData {
  term: string;
  classification: KeywordClass;
  intentScore: number; // 0-10
  competition: 'Low' | 'Medium' | 'High';
  searchVolumeEst: number;
  isOrganic: boolean;
  isSponsored: boolean;
  asinOverlap: number; // Count of ASINs ranking for this
  recommendation: PlacementRecommendation;
  reasoning: string; // Brief explanation
}

export interface AnalysisSummary {
  totalKeywords: number;
  attackCount: number;
  gapCount: number;
  ppcReadyCount: number;
  analyzedAsins: string[];
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  keywords: KeywordData[];
}