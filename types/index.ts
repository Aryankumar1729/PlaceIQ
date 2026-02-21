// Company types
export type Difficulty = "Easy" | "Medium" | "Hard";
export type AppStatus = "offer" | "interview" | "applied" | "rejected";
export type QuestionCategory = "DSA" | "Aptitude" | "HR" | "Technical";

export interface Company {
  id: string;
  name: string;
  shortName: string;
  type: string;
  baseCTC: string;
  pyqCount: number;
  roundCount: number;
  topicDistribution: {
    label: string;
    pct: number;
    color: string;
  }[];
  tier: "tier1" | "tier2" | "service" | "product";
  visitsTierTwo: boolean;
}

export interface PYQ {
  id: string;
  companyId: string;
  question: string;
  difficulty: Difficulty;
  category: QuestionCategory;
  tags: string[];
  askedCount: number;
  lastSeen: string;
  verified: boolean;
}

export interface Application {
  id: string;
  companyName: string;
  role: string;
  status: AppStatus;
  ctc?: string;
  appliedDate: string;
  notes?: string;
  nextStep?: string;
}

export interface ResumeScore {
  overall: number;
  breakdown: {
    label: string;
    score: number;
    status: "Strong" | "Good" | "Fair" | "Needs Work";
  }[];
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
