import sharp from "sharp";
import appConfig from "../config/app.config.js";

export default class ImageService {
  static async resizeImageBuffer(
    imageBuffer: Buffer,
    width: number = 800,
    height: number = 800,
  ): Promise<Buffer> {
    try {
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(width, height, { fit: "inside", withoutEnlargement: true })
        .toFormat("jpeg", { quality: 45, progressive: true, force: true })
        .toBuffer();
      return resizedImageBuffer;
    } catch (error) {
      console.error("Error resizing image buffer:", error);
      throw error;
    }
  }

  static async resizePrimaryImageBuffer(
    imageBuffer: Buffer,
    width: number = 800,
    height: number = 800,
  ): Promise<Buffer> {
    try {
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(width, height, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toFormat("jpeg", {
          quality: appConfig.qualityOfImages,
          progressive: true,
          force: true,
        })
        .toBuffer();
      return resizedImageBuffer;
    } catch (error) {
      console.error("Error resizing primary image buffer:", error);
      throw error;
    }
  }
}
