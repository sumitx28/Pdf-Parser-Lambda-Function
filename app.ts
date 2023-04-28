import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parsePdf } from './api/pdf-parser-lambda';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log(event);
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No body found',
        event: event,
      }),
    };
  }

  const requestBody = JSON.parse(event.body);

  const resultObject = parsePdf(
    requestBody.base64,
    requestBody.needClientImages,
    requestBody.transparent
  );

  return resultObject;
};
