
export interface StoryPage {
  pageNumber: number;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface StoryBook {
  title: string;
  author: string;
  genre: string;
  pages: StoryPage[];
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  VIEWING = 'VIEWING',
  ERROR = 'ERROR'
}

export type GenreType = 'Petualangan' | 'Fabel' | 'Fantasi' | 'Edukasi' | 'Misteri';
