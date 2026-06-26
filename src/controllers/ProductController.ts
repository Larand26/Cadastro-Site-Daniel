import ProductService from "../services/ProductService.js";

export default abstract class ProductController {
  static async getManufacturersCodes(): Promise<string[]> {
    return ProductService.getManufacturersCodes();
  }
}
