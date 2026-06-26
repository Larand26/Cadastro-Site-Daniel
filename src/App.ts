import { logger } from "./utils/logger.js";

//Controllers
import ProductController from "./controllers/ProductController.js";

export default abstract class App {
  static async start(): Promise<void> {
    // Busca referências dos produtos para cadastro
    const manufacturersCodes = await ProductController.getManufacturersCodes();
    logger.info("Manufacturers fetched: " + manufacturersCodes.join(", "));
    // Busca os produtos no Magento
    // Pega os atributos dos produtos
    // Adiciona os atributos dos produtos no Magento
  }
}
