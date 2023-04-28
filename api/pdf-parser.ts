import { Router, Request, Response } from 'express';
import {
  checkPdfQuality,
  cropImage,
  getImageResponse,
  getPdfDimensions,
  removeBackground,
} from './utility';

import {
  getBackClientImageDimensions,
  getFirstPageImage,
  getFrontClientImageDimensions,
  getSecondPageImage,
  getThirdPageImage,
} from './image-parser';

import { ResponseObject } from './types/ResponseObject';
import { ImageDimensions } from './types/ImageDimensions';
import { Result } from './types/Result';

const api: Router = Router();
const NEED_BUFFER = true;

api.post('/pdf-parser', async (req: Request, res: Response) => {
  const {
    base64: pdfBase64,
    transparent: needTransparentImages,
    needClientImages,
  } = req.body;

  if (!pdfBase64) {
    res.status(400).json({ err: 'PDF not attached' });
    return;
  }

  const pdfQuality: Result = await checkPdfQuality(pdfBase64);

  if (!pdfQuality.goodPdf) {
    res.status(400).json({ err: pdfQuality.err });
    return;
  }

  const dimensionsResult: Result = await getPdfDimensions(pdfBase64);

  if (!dimensionsResult.body) {
    res.status(500).json(dimensionsResult.err);
    return;
  }

  const dimensions = dimensionsResult.body;

  const responseObject: ResponseObject = {
    frontImage: null,
    backImage: null,
    ntClientFrontImage: null,
    ntClientBackImage: null,
    tClientFrontImage: null,
    tClientBackImage: null,
  };

  const frontPageImage: string = await getSecondPageImage(
    pdfBase64,
    dimensions.secondPageWidth,
    dimensions.secondPageHeight
  );

  const backPageImage: string = await getThirdPageImage(
    pdfBase64,
    dimensions.thirdPageWidth,
    dimensions.thirdPageHeight
  );

  if (needClientImages) {
    console.log('parsing client images...');
    console.log('transparent : ' + needTransparentImages);

    const firstPageImage: string = await getFirstPageImage(
      pdfBase64,
      dimensions.firstPageWidth,
      dimensions.firstPageHeight
    );

    const frontClientImageDimensions: ImageDimensions =
      getFrontClientImageDimensions(dimensions.firstPageHeight);

    const backClientImageDimensions: ImageDimensions =
      getBackClientImageDimensions(dimensions.firstPageHeight);

    /** added front and back images to response */
    responseObject.frontImage = getImageResponse(frontPageImage, 'front');

    responseObject.backImage = getImageResponse(backPageImage, 'back');

    /** cropping client images from first page */
    try {
      /** non transparent client images */
      const ntClientFrontImage: any = await cropImage(
        firstPageImage,
        frontClientImageDimensions
      );

      const ntClientBackImage: any = await cropImage(
        firstPageImage,
        backClientImageDimensions
      );

      /** if transparent client images are required (for group orders) */
      if (needTransparentImages) {
        console.log('parsing transparent client images...');

        const tClientFrontImage: any = await removeBackground(
          ntClientFrontImage.base64
        );

        const tClientBackImage: any = await removeBackground(
          ntClientBackImage.base64
        );

        /** adding transparent client images to response */
        responseObject.tClientFrontImage = getImageResponse(
          tClientFrontImage.base64,
          'front'
        );

        responseObject.tClientBackImage = getImageResponse(
          tClientBackImage.base64,
          'back'
        );

        console.log('parsed transparent client images...');
      } else {
        /** adding non transparent client images to response */
        responseObject.ntClientFrontImage = getImageResponse(
          ntClientFrontImage.base64,
          'front'
        );

        responseObject.ntClientBackImage = getImageResponse(
          ntClientBackImage.base64,
          'back'
        );

        console.log('parsed non transparent client images...');
      }
    } catch (err) {
      res.status(500).json({
        err: err,
      });
      return;
    }
  } else {
    console.log('parsing just the full front and back images...');

    /** added front & back image to response */
    responseObject.frontImage = getImageResponse(
      frontPageImage,
      'front',
      NEED_BUFFER
    );

    responseObject.backImage = getImageResponse(
      backPageImage,
      'back',
      NEED_BUFFER
    );

    console.log('done parsing just full front and back images...');
  }

  res.status(200).json(responseObject);
  return;
});

export = api;
