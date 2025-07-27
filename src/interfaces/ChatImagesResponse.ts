import { MessageDetails } from './MessageDetails';

export interface ChatImagesResponse {
  chatId: string;
  totalImages: number;
  totalChats: number;
  messagesWithImages: MessageDetails[];
  skipToken?: string;
}
