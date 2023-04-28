import { fromBase64 } from 'pdf2pic';
import { Convert } from 'pdf2pic/dist/types/convert';

import { Options } from 'pdf2pic/dist/types/options';
import { ToBase64Response } from 'pdf2pic/dist/types/toBase64Response';
import { ImageDimensions } from './types/ImageDimensions';

const BLUR_RATIO = 2;
const TO_BASE_64 = true;
const STICKER_PDF_HEIGHT = 1600;

const options: Options = {
  format: 'jpeg',
  density: BLUR_RATIO * 48,
};

async function convertToImage(
  pdfBase64: string,
  width: number,
  height: number,
  page_number: number
) {
  options.height = height;
  options.width = width;

  const imagePromise: Convert = fromBase64(pdfBase64, options);
  const image: ToBase64Response = await imagePromise(page_number, TO_BASE_64);

  return image.base64 ? image.base64 : '';
}

export async function getFirstPageImage(
  pdfBase64: string,
  width: number,
  height: number
) {
  const page_number = 1;

  const firstPageImage = await convertToImage(
    pdfBase64,
    width,
    height,
    page_number
  );

  if (firstPageImage == '') {
    throw new Error('error parsing first page image');
  } else {
    return firstPageImage;
  }
}

export async function getSecondPageImage(
  pdfBase64: string,
  width: number,
  height: number
) {
  const page_number = 2;

  const secondPageImage = await convertToImage(
    pdfBase64,
    width,
    height,
    page_number
  );

  if (secondPageImage == '') {
    throw new Error('error parsing second page image');
  } else {
    return secondPageImage;
  }
}

export async function getThirdPageImage(
  pdfBase64: string,
  width: number,
  height: number
) {
  const page_number = 3;

  const thirdPageImage = await convertToImage(
    pdfBase64,
    width,
    height,
    page_number
  );

  if (thirdPageImage == '') {
    throw new Error('error parsing third page image');
  } else {
    return thirdPageImage;
  }
}

export function getFrontClientImageDimensions(height: number) {
  let frontClientImageDimensions: ImageDimensions;

  if (height < STICKER_PDF_HEIGHT) {
    frontClientImageDimensions = {
      x: 130,
      y: 450,
      width: 730,
      height: 700,
    };
  } else {
    frontClientImageDimensions = {
      x: 130,
      y: 400,
      width: 730,
      height: 885,
    };
  }

  return frontClientImageDimensions;
}

export function getBackClientImageDimensions(height: number) {
  let backClientImageDimensions: ImageDimensions;

  if (height < STICKER_PDF_HEIGHT) {
    backClientImageDimensions = {
      x: 850,
      y: 360,
      width: 730,
      height: 700,
    };
  } else {
    backClientImageDimensions = {
      x: 920,
      y: 400,
      width: 730,
      height: 885,
    };
  }

  return backClientImageDimensions;
}
