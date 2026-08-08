const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function drawResized(img: HTMLImageElement): HTMLCanvasElement {
  let w = img.naturalWidth;
  let h = img.naturalHeight;

  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function canvasToWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('WebP conversion failed'))),
      'image/webp',
      WEBP_QUALITY,
    );
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('JPEG conversion failed'))),
      'image/jpeg',
      WEBP_QUALITY,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface ConvertedImage {
  dataUrl: string;
  ext: 'webp' | 'jpg';
}

export async function convertToWebp(file: File): Promise<ConvertedImage> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const canvas = drawResized(img);

  try {
    const blob = await canvasToWebp(canvas);
    return { dataUrl: await blobToDataUrl(blob), ext: 'webp' };
  } catch {
    const blob = await canvasToJpeg(canvas);
    return { dataUrl: await blobToDataUrl(blob), ext: 'jpg' };
  }
}
