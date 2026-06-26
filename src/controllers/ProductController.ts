import ProductService from "../services/ProductService.js";

export default abstract class ProductController {
  static async getManufacturers(): Promise<string[]> {
    return ProductService.getManufacturers();
  }
}
