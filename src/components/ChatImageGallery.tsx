import { Spinner } from '@fluentui/react-components';
import { app } from '@microsoft/teams-js';
import { useContext, useEffect, useState } from 'react';
import { Photo, RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import InfiniteScroll from 'react-photo-album/scroll';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getChatImagesFromGraph } from '../helpers/GraphHelpers';
import {
  fetchTeamsImageAsBlobUrl,
  getImageNaturalSize,
} from '../helpers/ImageHelpers';
import { TeamsFxContext } from './Context';

// import optional lightbox plugins
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

export function ChatImageGallery() {
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [skipToken, setSkipToken] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [index, setIndex] = useState(-1);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { teamsUserCredential } = useContext(TeamsFxContext);

  useEffect(() => {
    app.getContext().then((context) => {
      if (context.chat?.id) {
        setChatId(context.chat.id);
      }
    });
  }, []);

  // Helper to fetch batch of images
  async function fetchPhotos(): Promise<Photo[] | null> {
    if (!chatId) {
      console.error(`Chat id couldn't be fetched.`);
      // This should not happen due to ChatContextValidator, but keeping as safety check
      setHasError(true);
      setErrorMessage(
        'Chat context not available. Please ensure you are in a Teams chat.'
      );
      return null;
    }
    if (!teamsUserCredential) {
      console.error('Teams user credential is not available.');
      // This should not happen due to TeamsContextValidator, but keeping as safety check
      setHasError(true);
      setErrorMessage(
        'Authentication not available. Please ensure you are signed in to Teams.'
      );
      return null;
    }

    const batchSize = 10; // Number of photos to fetch per batch
    let accumulatedPhotos: Photo[] = [];
    let localSkipToken = skipToken;

    try {
      if (!firstLoad && !localSkipToken) {
        return null; // No more photos to fetch
      }

      while (accumulatedPhotos.length < batchSize) {
        let response;
        try {
          response = await getChatImagesFromGraph(
            teamsUserCredential,
            chatId.trim(),
            localSkipToken ?? undefined
          );
        } catch (err: any) {
          // If login is required, prompt the user and retry once
          // Needed for Desktop clients
          if (
            err.message?.includes('UiRequiredError') ||
            err.message?.includes('login first')
          ) {
            try {
              await teamsUserCredential.login([
                'https://graph.microsoft.com/Chat.Read',
              ]);
              response = await getChatImagesFromGraph(
                teamsUserCredential,
                chatId.trim(),
                localSkipToken ?? undefined
              );
            } catch (loginErr: any) {
              console.error(
                'Authentication failed after login attempt:',
                loginErr
              );
              setHasError(true);
              setErrorMessage(
                'Authentication failed. Please try refreshing the app or contact your admin.'
              );
              return null;
            }
          } else if (
            err.message?.includes('Forbidden') ||
            err.message?.includes('403')
          ) {
            console.error('Permission denied:', err);
            setHasError(true);
            setErrorMessage(
              'Permission denied. You may not have access to read messages in this chat.'
            );
            return null;
          } else if (
            err.message?.includes('Unauthorized') ||
            err.message?.includes('401')
          ) {
            console.error('Authentication error:', err);
            setHasError(true);
            setErrorMessage(
              'Authentication expired. Please refresh the app and try again.'
            );
            return null;
          } else {
            throw err;
          }
        }

        let newPhotos = response.messagesWithImages.flatMap(
          (msg) => msg.images
        );
        const accessToken = (
          await teamsUserCredential.getToken([
            'https://graph.microsoft.com/Chat.Read',
          ])
        )?.token;

        newPhotos = await Promise.all(
          newPhotos.map(async (photo) => {
            let blobUrl = photo.src;
            try {
              if (accessToken && photo.href) {
                blobUrl = await fetchTeamsImageAsBlobUrl(
                  photo.href,
                  accessToken
                );
              }
            } catch (e) {
              // fallback to original src if fetch fails
              console.error('Failed to fetch image as blob URL:', e);
            }

            const { width, height } = await getImageNaturalSize(blobUrl);
            return { ...photo, width, height, src: blobUrl, href: undefined };
          })
        );

        accumulatedPhotos = [...accumulatedPhotos, ...newPhotos];
        localSkipToken = response.skipToken ?? null;

        if (!localSkipToken) break;
      }

      setPhotos((prev) => [...prev, ...accumulatedPhotos]);
      setSkipToken(localSkipToken);
      setFirstLoad(false);

      if (accumulatedPhotos.length === 0) {
        return null;
      }

      return accumulatedPhotos;
    } catch (error: any) {
      console.error('Error fetching chat images:', error);
      setHasError(true);

      // Provide more specific error messages based on error type
      if (error.message?.includes('Network')) {
        setErrorMessage(
          'Network error. Please check your connection and try again.'
        );
      } else if (error.message?.includes('timeout')) {
        setErrorMessage('Request timed out. Please try again.');
      } else {
        setErrorMessage(
          'An unexpected error occurred while loading images. Please try refreshing the app.'
        );
      }

      return null;
    }
  }

  return (
    <>
      {chatId ? (
        <>
          <InfiniteScroll
            fetch={fetchPhotos}
            error={
              <div style={{ textAlign: 'center', color: 'red', margin: 20 }}>
                {hasError && errorMessage ? (
                  <>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                      ⚠️ Error Loading Images
                    </div>
                    <div>{errorMessage}</div>
                    <button
                      onClick={() => {
                        setHasError(false);
                        setErrorMessage('');
                        setPhotos([]);
                        setSkipToken(null);
                        setFirstLoad(true);
                      }}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Try Again
                    </button>
                  </>
                ) : (
                  'Error loading images.'
                )}
              </div>
            }
            loading={
              <div style={{ textAlign: 'center', color: '#888', margin: 20 }}>
                <Spinner label='Loading images...' size='large' />
              </div>
            }
            finished={
              <div style={{ textAlign: 'center', color: '#888', margin: 20 }}>
                {photos.length == 0
                  ? 'No images found in chat.'
                  : 'You are all set!'}
              </div>
            }
            onClick={({ index }) => {
              setIndex(index);
            }}
          >
            <RowsPhotoAlbum
              photos={photos}
              spacing={20}
              componentsProps={{ container: { style: { marginBottom: 20 } } }}
            />
          </InfiniteScroll>

          <Lightbox
            slides={photos}
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          />
        </>
      ) : null}
    </>
  );
}
