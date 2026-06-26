import MagentoApiService from "../services/MagentoApiService.js";
import type { IProductMagento } from "../interfaces/interfaces.js";

export default abstract class MagentoApiController {
  static async fetchProductsByManufacturerCodes(
    manufacturerCodes: string[],
  ): Promise<IProductMagento[]> {
    return MagentoApiService.fetchProducts(manufacturerCodes);
  }
}
