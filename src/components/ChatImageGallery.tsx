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
      return null;
    }
    if (!teamsUserCredential) {
      console.error('Teams user credential is not available.');
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
            await teamsUserCredential.login([
              'https://graph.microsoft.com/Chat.Read',
            ]);
            response = await getChatImagesFromGraph(
              teamsUserCredential,
              chatId.trim(),
              localSkipToken ?? undefined
            );
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
    } catch (error) {
      console.error('Error fetching chat images:', error);
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
                Error loading images.
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
