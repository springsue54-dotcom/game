export type Emotion = 'Joy' | 'Sadness' | 'Anger' | 'Fear' | 'Surprise' | 'Neutral';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  emotion: Emotion;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  aiEmotion: Emotion;
  playerEmotion: Emotion;
  isTyping: boolean;
}
