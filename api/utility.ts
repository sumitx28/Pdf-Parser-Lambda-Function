import Pdf from 'pdf-parse';
import PDFParser from 'pdf2json';
import gm from 'gm';
import { removeBackgroundFromImageBase64 } from 'remove.bg';

import { ImageDimensions } from './types/ImageDimensions';
import { Result } from './types/Result';
import { Image } from './types/Image';

require('dotenv').config();

const REMOVE_BG_API_KEY = '' + process.env.removeBgApiKey;
const TOTAL_PAGES = 3;
const PIXEL_CONVERT = 25;

gm.subClass({ imageMagick: true });

export async function checkPdfQuality(pdfBase64: string) {
  let response: Result = {};
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');

  try {
    const pdfProperties: Pdf.Result = await Pdf(pdfBuffer, {
      pagerender: render_page,
    });

    if (pdfProperties.numpages != TOTAL_PAGES) {
      response.err = 'PDF does not contain the required number of pages';
      response.goodPdf = false;
      return response;
    }

    response.goodPdf = true;
    return response;
  } catch (err) {
    response.err = 'Invalid PDF';
    response.goodPdf = false;
    return response;
  }
}

export async function getPdfDimensions(pdfBase64: string) {
  let response: Result = {};
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');

  try {
    const res: any = await getPdfDimensionsInternal(pdfBuffer);

    const dimensions = {
      firstPageWidth: res.Pages[0].Width * PIXEL_CONVERT,
      firstPageHeight: res.Pages[0].Height * PIXEL_CONVERT,
      secondPageWidth: res.Pages[1].Width * PIXEL_CONVERT,
      secondPageHeight: res.Pages[1].Height * PIXEL_CONVERT,
      thirdPageWidth: res.Pages[2].Width * PIXEL_CONVERT,
      thirdPageHeight: res.Pages[2].Height * PIXEL_CONVERT,
    };

    response.body = dimensions;
    return response;
  } catch (err) {
    response.err = 'Failed to calc dimensions of the pdf';
    return response;
  }
}

export function cropImage(imageBase64: string, dimensions: ImageDimensions) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(imageBase64, 'base64');
    gm(buffer)
      .crop(dimensions.width, dimensions.height, dimensions.x, dimensions.y)
      .toBuffer(function (err, image) {
        if (err) {
          reject(err);
        } else {
          resolve({ base64: image.toString('base64') });
        }
      });
  });
}

export async function removeBackground(base64: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await removeBackgroundFromImageBase64({
        base64img: base64,
        apiKey: REMOVE_BG_API_KEY,
        size: 'full',
        type: 'auto',
        position: 'center',
      });

      resolve({
        parsed: true,
        base64: result.base64img,
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function getImageResponse(
  image_base64: string,
  imageLocation: string,
  buffer: boolean = false
) {
  const ImageResponse: Image = {
    buffer: 'data:image/jpeg;base64,' + image_base64,
    uploadBuffer: buffer ? Buffer.from(image_base64, 'base64') : null,
    uploadDir: 'designs',
    ext: 'jpeg',
    location: imageLocation,
  };

  return ImageResponse;
}

/**
 * function to pass in order to render page data
 * @param pageData
 */
const render_page = (pageData: any) => {
  let render_options = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };

  return pageData
    .getTextContent(render_options)
    .then(function (textContent: any) {
      let lastY,
        text = '';
      for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    });
};

const getPdfDimensionsInternal = async (buffer: Buffer) =>
  new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    try {
      pdfParser.parseBuffer(buffer);

      pdfParser.on('pdfParser_dataError', (errData) => reject(errData));

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        console.log('ready to calc hw of the pdf...');

        if (
          typeof pdfData !== 'object' ||
          !('Pages' in pdfData) ||
          !Array.isArray(pdfData.Pages)
        ) {
          reject({ err: 'error calculating HW of the pdf' });
        }

        resolve(pdfData);
      });
    } catch (err) {
      reject(err);
    }
  });
