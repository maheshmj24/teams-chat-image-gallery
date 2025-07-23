import { Photo } from 'react-photo-album';

const imageSrc =
  'https://in-prod.asyncgw.teams.microsoft.com/v1/objects/<ID>/views/imgpsh_fullsize';
const breakpoints = [1080, 640, 384, 256, 128, 96, 64, 48];

/**
 * Extracts image information from HTML content
 */
export function extractImagesFromHtml(htmlContent: string): Photo[] {
  const photos: Photo[] = [];

  // Regular expression to match img tags and extract src and alt attributes
  const imgRegex = /<img[^>]+>/gi;
  const altRegex = /alt=["']([^"']+)["']/i;
  const itemIdRegex = /itemId=["']([^"']+)["']/i;
  const widthRegex = /width=["'](\d+)["']/i;
  const heightRegex = /height=["'](\d+)["']/i;

  const imgMatches = htmlContent.match(imgRegex);

  if (imgMatches) {
    imgMatches.forEach((imgTag) => {
      const itemIdMatch = RegExp(itemIdRegex).exec(imgTag);

      if (itemIdMatch?.[1]) {
        const altMatch = RegExp(altRegex).exec(imgTag);
        const alt = altMatch ? altMatch[1] : undefined;
        const widthMatch = RegExp(widthRegex).exec(imgTag);
        const width = widthMatch ? Number(widthMatch[1]) : 200; // Default width
        const heightMatch = RegExp(heightRegex).exec(imgTag);
        const height = heightMatch ? Number(heightMatch[1]) : 200; // Default height

        photos.push({
          key: itemIdMatch[1],
          src: imageSrc.replace('<ID>', itemIdMatch[1]),
          alt: alt,
          width: width,
          height: height,
          srcSet: breakpoints.map((bp) => ({
            src: imageSrc.replace('<ID>', itemIdMatch[1]),
            width: bp,
            height: Math.round((height / width) * bp),
          })),
        });
      }
    });
  }

  return photos;
}

export function getImageNaturalSize(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 800, height: 600 }); // fallback
    img.src = src;
  });
}
