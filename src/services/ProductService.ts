import fs from "fs";
import path from "path";
import appConfig from "../config/app.config.js";
import { logger } from "../utils/logger.js";
import type { IProductMagento, IAtributes } from "../interfaces/interfaces.js";

// Atributes Json
import { genderJson, brandJson } from "../assets/atributesJson.js";

export default abstract class ProductService {
  static async getManufacturersCodes(): Promise<string[]> {
    try {
      const filePath = path.resolve(appConfig.txtFilePath);
      if (!fs.existsSync(filePath)) {
        logger.error(`Arquivo não encontrado: ${filePath}`);
        return [];
      }
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      // Process the file content to extract manufacturer codes
      return fileContent.split(",").map((code) => code.trim());
    } catch (error) {
      logger.error(`Erro ao ler o arquivo: ${error}`);
      return [];
    }
  }

  static async getAtributesFromProducts(
    productsMagento: IProductMagento[],
  ): Promise<any[]> {
    try {
      Promise.all(
        productsMagento.map(async (product) => {
          const attributes = await this.getProductAttributes(product);
          return attributes;
        }),
      );
      return [];
    } catch (error) {
      logger.error(`Erro ao processar os produtos: ${error}`);
      return [];
    }
  }

  private static async getProductAttributes(
    product: IProductMagento,
  ): Promise<IAtributes> {
    try {
      const productAtribute = {} as IAtributes;
      productAtribute.sku = product.sku;
      productAtribute.name = product.name;
      productAtribute.configurable = product.sku.includes("PAI");
      productAtribute.gender = this.getGenderFromProduct(product);
      productAtribute.brand = this.getBrandFromProduct(product);
      productAtribute.manufacturer_code =
        this.getManufacturerCodeFromProduct(product);
      productAtribute.promotion = this.getIsPromotion(product);

      console.log("Atributos do produto:", productAtribute);
      return productAtribute;
    } catch (error) {
      logger.error(
        `Erro ao obter atributos do produto ${product.sku}: ${error}`,
      );
      return {} as IAtributes;
    }
  }

  // Gênero
  private static getGenderFromProduct(product: IProductMagento): string {
    const atribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "genero",
    );
    if (!atribute) return "Não definido";
    const atributecode = Number(atribute?.value);

    return genderJson[atributecode] || "Unisex";
  }

  // Marca
  private static getBrandFromProduct(product: IProductMagento): string {
    const atribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "brands",
    );
    if (!atribute) return "Não definido";
    const brandCode = Number(atribute.value);
    return brandJson[brandCode] || "Não definido";
  }

  // Código do fabricante
  private static getManufacturerCodeFromProduct(
    product: IProductMagento,
  ): string {
    const atribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "ref_produto",
    );
    if (!atribute) return "Não definido";
    return atribute.value || "Não definido";
  }

  // Promoção
  private static getIsPromotion(product: IProductMagento): boolean {
    const atribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "colecao",
    );
    return atribute?.value === "PROMO";
  }
}
