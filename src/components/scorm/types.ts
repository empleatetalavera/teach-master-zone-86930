// Types for SCORM content slides

export interface ContentSlide {
  id: string;
  type: 'intro' | 'content' | 'quiz' | 'summary' | 'exercise' | 'table' | 'checklist';
  title: string;
  content: string;
  keyTerms?: string[];
  quiz?: QuizQuestion;
  section?: string;
  tableData?: { headers: string[]; rows: string[][] };
  checklistItems?: { id: string; text: string; checked?: boolean }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  hint?: string;
}

export interface IndexItem {
  id: string;
  title: string;
  subItems?: { id: string; title: string; completed?: boolean }[];
  completed?: boolean;
}

// Extended slide types for more interactivity
export interface ExtendedContentSlide extends ContentSlide {
  accordionItems?: { id: string; title: string; content: string; icon?: string }[];
  flashcards?: { id: string; front: string; back: string }[];
  imageUrl?: string;
  imageCaption?: string;
  highlightBox?: { type: 'info' | 'warning' | 'tip' | 'important'; content: string };
  processSteps?: { step: number; title: string; description: string }[];
}
