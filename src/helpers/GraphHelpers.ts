import { TeamsUserCredential } from '@microsoft/teamsfx';
import { ChatImagesResponse } from '../interfaces/ChatImagesResponse';
import { MessageDetails } from '../interfaces/MessageDetails';
import { extractImagesFromHtml } from './ImageHelpers';

/**
 * Handles errors from the Graph API response.
 * Throws specific errors based on the response status.
 */
function handleGraphResponseError(response: Response): void {
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        'Insufficient permissions to access chat messages. Please ensure the app has Chat.Read permission.'
      );
    } else if (response.status === 404) {
      throw new Error('Chat not found. Please check the chat ID.');
    } else {
      throw new Error(
        `Failed to fetch chat messages: ${response.status} ${response.statusText}`
      );
    }
  }
}

/**
 * Extracts messages with images from the Graph API response data.
 * Filters messages that contain HTML content and extracts images from them.
 */
function extractMessagesWithImages(data: any): MessageDetails[] {
  if (!data?.value) return [];
  return data.value
    .filter(
      (message: any) =>
        message?.body?.content && message?.body?.contentType === 'html'
    )
    .map((message: any) => {
      const images = extractImagesFromHtml(message.body.content);
      if (images.length > 0) {
        return {
          id: message.id,
          createdDateTime: message.createdDateTime,
          body: message.body,
          images: images,
        };
      }
      return null;
    })
    .filter((msg: MessageDetails | null) => msg !== null) as MessageDetails[];
}

/**
 * Fetches chat images from Microsoft Graph API.
 * Returns a response containing chat ID, total images, total chats, and messages with images.
 */
export async function getChatImagesFromGraph(
  teamsUserCredential: TeamsUserCredential,
  chatId: string,
  skipToken?: string
): Promise<ChatImagesResponse & { skipToken?: string }> {
  const accessToken = await teamsUserCredential.getToken([
    'https://graph.microsoft.com/Chat.Read',
  ]);

  if (!accessToken?.token) {
    throw new Error('Failed to get access token for Microsoft Graph');
  }

  let url = `https://graph.microsoft.com/v1.0/chats/${encodeURIComponent(
    chatId
  )}/messages?$orderby=createdDateTime desc&$top=50`;
  if (skipToken) {
    url += `&$skiptoken=${encodeURIComponent(skipToken)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    },
  });

  handleGraphResponseError(response);

  const data = await response.json();
  const messagesWithImages = extractMessagesWithImages(data);

  return {
    chatId: chatId,
    totalImages: messagesWithImages.reduce(
      (sum, msg) => sum + msg.images.length,
      0
    ),
    totalChats: data['@odata.count'],
    messagesWithImages: messagesWithImages,
    skipToken: data['@odata.nextLink']
      ? (() => {
          const token = new URL(data['@odata.nextLink']).searchParams.get(
            '$skiptoken'
          );
          return token ?? undefined;
        })()
      : undefined,
  };
}
