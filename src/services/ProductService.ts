import fs from "fs";
import path from "path";
import appConfig from "../config/app.config.js";
import { logger } from "../utils/logger.js";

export default abstract class ProductService {
  static async getManufacturers(): Promise<string[]> {
    try {
      const filePath = path.resolve(appConfig.txtFilePath);
      if (!fs.existsSync(filePath)) {
        logger.error(`Arquivo não encontrado: ${filePath}`);
        return [];
      }
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      // Process the file content to extract manufacturer names
      return fileContent.split(",").map((name) => name.trim());
    } catch (error) {
      logger.error(`Erro ao ler o arquivo: ${error}`);
      return [];
    }
  }
}
