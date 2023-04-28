import { Image } from "./Image";

export interface ResponseObject {
  frontImage: Image | null;
  backImage: Image | null;
  ntClientFrontImage: Image | null;
  ntClientBackImage: Image | null;
  tClientFrontImage: Image | null;
  tClientBackImage: Image | null;
}
