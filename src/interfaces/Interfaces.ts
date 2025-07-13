import { Photo } from 'react-photo-album';

export interface MessageDetails {
  id: string;
  createdDateTime: string;
  body: {
    content: string;
    contentType: string;
  };
  images: Photo[];
}

export interface ChatImagesResponse {
  chatId: string;
  totalImages: number;
  totalChats: number;
  messagesWithImages: MessageDetails[];
  skipToken?: string;
}
