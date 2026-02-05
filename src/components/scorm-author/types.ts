// SCORM Authoring Tool Types

export type SlideType = 
  | 'title'
  | 'content'
  | 'quiz'
  | 'video'
  | 'image'
  | 'hotspot'
  | 'dragdrop'
  | 'accordion'
  | 'tabs'
  | 'timeline'
  | 'summary';

export interface BaseSlide {
  id: string;
  type: SlideType;
  title: string;
  order: number;
  duration_seconds?: number;
  background_color?: string;
  background_image?: string;
}

export interface TitleSlide extends BaseSlide {
  type: 'title';
  subtitle?: string;
  author?: string;
  logo_url?: string;
}

export interface ContentSlide extends BaseSlide {
  type: 'content';
  content: string; // Markdown content
  layout: 'single' | 'two-column' | 'sidebar-left' | 'sidebar-right';
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
  };
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface QuizSlide extends BaseSlide {
  type: 'quiz';
  question: string;
  question_type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching';
  options: QuizOption[];
  explanation?: string;
  hint?: string;
  points: number;
  max_attempts: number;
  shuffle_options: boolean;
}

export interface VideoSlide extends BaseSlide {
  type: 'video';
  video_url: string;
  video_type: 'youtube' | 'vimeo' | 'mp4' | 'embed';
  autoplay: boolean;
  controls: boolean;
  transcript?: string;
}

export interface ImageSlide extends BaseSlide {
  type: 'image';
  image_url: string;
  alt_text: string;
  caption?: string;
  zoom_enabled: boolean;
}

export interface HotspotArea {
  id: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  shape: 'rectangle' | 'circle' | 'polygon';
  label: string;
  content: string; // HTML/Markdown shown on click
  icon?: string;
}

export interface HotspotSlide extends BaseSlide {
  type: 'hotspot';
  image_url: string;
  hotspots: HotspotArea[];
  instruction?: string;
}

export interface DragDropItem {
  id: string;
  content: string;
  image_url?: string;
}

export interface DragDropZone {
  id: string;
  label: string;
  correct_items: string[]; // item IDs
}

export interface DragDropSlide extends BaseSlide {
  type: 'dragdrop';
  instruction: string;
  items: DragDropItem[];
  zones: DragDropZone[];
  feedback_correct: string;
  feedback_incorrect: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface AccordionSlide extends BaseSlide {
  type: 'accordion';
  items: AccordionItem[];
  allow_multiple_open: boolean;
}

export interface TabItem {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface TabsSlide extends BaseSlide {
  type: 'tabs';
  tabs: TabItem[];
  default_tab?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image_url?: string;
}

export interface TimelineSlide extends BaseSlide {
  type: 'timeline';
  events: TimelineEvent[];
  orientation: 'horizontal' | 'vertical';
}

export interface SummarySlide extends BaseSlide {
  type: 'summary';
  key_points: string[];
  next_steps?: string;
}

export type Slide = 
  | TitleSlide 
  | ContentSlide 
  | QuizSlide 
  | VideoSlide 
  | ImageSlide 
  | HotspotSlide 
  | DragDropSlide 
  | AccordionSlide 
  | TabsSlide 
  | TimelineSlide 
  | SummarySlide;

export interface ScormProject {
  id: string;
  title: string;
  description?: string;
  version: string;
  scorm_version: '1.2' | '2004';
  language: string;
  slides: Slide[];
  settings: ScormSettings;
  created_at: string;
  updated_at: string;
  module_id?: string;
  formative_unit_id?: string;
}

export interface ScormSettings {
  passing_score: number;
  max_attempts: number;
  time_limit_minutes?: number;
  show_progress: boolean;
  allow_navigation: boolean;
  completion_threshold: number;
  theme: ScormTheme;
}

export interface ScormTheme {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  header_style: 'minimal' | 'full' | 'branded';
}

// Editor state
export interface EditorState {
  selectedSlideId: string | null;
  previewMode: boolean;
  zoom: number;
  unsavedChanges: boolean;
}
