import { logger } from "./utils/logger.js";

//Controllers
import ProductController from "./controllers/ProductController.js";
import MagentoApiController from "./controllers/MagentoApiController.js";

export default abstract class App {
  static async start(): Promise<void> {
    // Busca referências dos produtos para cadastro
    const manufacturersCodes = await ProductController.getManufacturersCodes();
    logger.info("Manufacturers fetched: " + manufacturersCodes.join(", "));
    // Busca os produtos no Magento
    const productsMagento =
      await MagentoApiController.fetchProductsByManufacturerCodes(
        manufacturersCodes,
      );
    logger.info("Products fetched from Magento: " + productsMagento.length);
    // Pega os atributos dos produtos
    const products =
      ProductController.getAttributesFromProducts(productsMagento);
    // Adiciona os atributos dos produtos no Magento
  }
}
