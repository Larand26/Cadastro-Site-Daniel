import ProductService from "../services/ProductService.js";
import type { IProductMagento } from "../interfaces/interfaces.js";

export default abstract class ProductController {
  static async getManufacturersCodes(): Promise<string[]> {
    return ProductService.getManufacturersCodes();
  }

  static async getAtributesFromProducts(
    productsMagento: IProductMagento[],
  ): Promise<any[]> {
    return ProductService.getAtributesFromProducts(productsMagento);
  }
}
