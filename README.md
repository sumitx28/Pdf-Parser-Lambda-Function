# PDF-PARSER Lambda

- Lambda Function to parse images from a pdf as required by the company (FreshPrints).
- Moved the Functionality from EC2 to Lambda which resulted in 96% cost reduction as compared to EC2.
- Reduced time taken to parse images.
- Sample PDF's attached.

## DEMO
<img src="https://github.com/sumitx28/Pdf-Parser-Lambda-Function/blob/main/pdf-parser-demo.gif" width="500" height="250" />

# Deployment

- Deployed on AWS Lambda using Docker Container Image

## Project Structure

# api/

# 1. types/

- Image.ts
- ImageDimensions.ts
- ResponseObject.ts
- Result.ts

# 2. image-parser.ts

- contains `convertToImage(base64,width,height,page_number)` , `getFirstPageImage()` , `getSecondPageImage()` , `getThirdPageImage()` Methods to convert specific pages to images
- contains `getFrontClientImageDimensions(height)` , `getBackClientImageDimensions(height)` Methods to get dimensions of front and back client images depending on the type of PDF (Regular / Sticker)

# 3. utility.ts

- contains `checkPdfQuality(pdfBase64)` , `getPdfDimensions(pdfBase64)` methods to check pdf quality and get pdfDimensions taking pdfBuffer as an input parameter
- contains `cropImage(pdfBase64 , dimensions)` , `removeBackground(pdfBase64)` methods to crop image using dimensions (x,y,h,w) and remove background to make the iamge transparent
