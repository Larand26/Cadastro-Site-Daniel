import type { IAttributes } from "../interfaces/interfaces.js";

interface attribute {
  attribute_code: string;
  value: any;
}

export default abstract class RegisterService {
  static async registerProducts(products: IAttributes[]): Promise<void> {
    try {
      for (const product of products) {
        const attributes = [];
        attributes.push(this.insertCategories(product));
      }
    } catch (error) {
      console.error(`Erro ao registrar os produtos: ${error}`);
    }
  }

  private static insertCategories(product: IAttributes): attribute {
    if (product.configurable)
      return { attribute_code: "category_ids", value: [] };
    return { attribute_code: "category_ids", value: product.categories };
  }
}
