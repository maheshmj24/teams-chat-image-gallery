import { TeamsUserCredential } from '@microsoft/teamsfx';
import { ChatImagesResponse, MessageDetails } from '../interfaces/interfaces';
import { extractImagesFromHtml } from './ImageHelpers';

/**
 * Direct Microsoft Graph API call from frontend - No Azure backend needed
 */
export async function getChatImagesFromGraph(
  teamsUserCredential: TeamsUserCredential,
  chatId: string,
  skipToken?: string
): Promise<ChatImagesResponse & { skipToken?: string }> {
  // Get access token for Microsoft Graph
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

  const data = await response.json();
  const messagesWithImages: MessageDetails[] = [];

  // Process each message to extract images
  if (data?.value) {
    for (const message of data.value) {
      if (
        message?.body?.content &&
        message?.body?.contentType === 'html' // filter here
      ) {
        const images = extractImagesFromHtml(message.body.content);

        if (images.length > 0) {
          messagesWithImages.push({
            id: message.id,
            createdDateTime: message.createdDateTime,
            body: message.body,
            images: images,
          });
        }
      }
    }
  }

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
