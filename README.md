# PDF-PARSER Lambda

## Project Structure

# api/

# 1. types/

- Image.ts
- ImageDimensions.ts
- ResponseObject.ts
- Result.ts

# 2. pdf-parser.ts

- `POST - /pdf-parser`
- Payload - `base64` , `needClientImages` , `needTransparentImages`

# 2. image-parser.ts

- contains `convertToImage(base64,width,height,page_number)` , `getFirstPageImage()` , `getSecondPageImage()` , `getThirdPageImage()` Methods to convert specific pages to images
- contains `getFrontClientImageDimensions(height)` , `getBackClientImageDimensions(height)` Methods to get dimensions of front and back client images depending on the type of PDF (Regular / Sticker)

# 3. utility.ts

- contains `checkPdfQuality(pdfBase64)` , `getPdfDimensions(pdfBase64)` methods to check pdf quality and get pdfDimensions taking pdfBuffer as an input parameter
- contains `cropImage(pdfBase64 , dimensions)` , `removeBackground(pdfBase64)` methods to crop image using dimensions (x,y,h,w) and remove background to make the iamge transparent
