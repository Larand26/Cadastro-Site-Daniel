import fs from "fs";
import path from "path";
import appConfig from "../config/app.config.js";
import { logger } from "../utils/logger.js";
import type { IProductMagento, IAttributes } from "../interfaces/interfaces.js";

// attributes Json
import {
  genderJson,
  brandJson,
  typeJson,
  numJson,
} from "../assets/attributesJson.js";
import MagentoApiService from "./MagentoApiService.js";

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

  static async getAttributesFromProducts(
    productsMagento: IProductMagento[],
  ): Promise<any[]> {
    try {
      const colorOptions = await MagentoApiService.fetchColorOptions();
      Promise.all(
        productsMagento.map(async (product) => {
          const attributes = await this.getProductAttributes(
            product,
            colorOptions,
          );
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
    colorOptions: { label: string; value: string }[],
  ): Promise<IAttributes> {
    try {
      const productattribute = {} as IAttributes;
      productattribute.sku = product.sku;
      productattribute.name = product.name;
      productattribute.configurable = product.sku.includes("PAI");
      productattribute.gender = this.getGenderFromProduct(product);
      productattribute.brand = this.getBrandFromProduct(product);
      productattribute.type = this.getTypeFromProduct(product);
      productattribute.manufacturer_code =
        this.getManufacturerCodeFromProduct(product);
      productattribute.promotion = this.getIsPromotion(product);
      productattribute.color = this.getColorFromProduct(product, colorOptions);
      productattribute.numeration = this.getNumeration(product);

      console.log("Atributos do produto:", productattribute);
      return productattribute;
    } catch (error) {
      logger.error(
        `Erro ao obter atributos do produto ${product.sku}: ${error}`,
      );
      return {} as IAttributes;
    }
  }

  // Gênero
  private static getGenderFromProduct(product: IProductMagento): string {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "genero",
    );
    if (!attribute) return "Não definido";
    const attributecode = Number(attribute?.value);
    return genderJson[attributecode] || "Unisex";
  }

  // Marca
  private static getBrandFromProduct(product: IProductMagento): string {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "brands",
    );
    if (!attribute) return "Não definido";
    const attributecode = Number(attribute.value);
    return brandJson[attributecode] || "Não definido";
  }

  // Tipo
  private static getTypeFromProduct(product: IProductMagento): string {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "tipoprod",
    );
    if (!attribute) return "Não definido";
    const attributecode = Number(attribute.value);
    return typeJson[attributecode] || "Não definido";
  }

  // Código do fabricante
  private static getManufacturerCodeFromProduct(
    product: IProductMagento,
  ): string {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "ref_produto",
    );
    if (!attribute) return "Não definido";
    return attribute.value || "Não definido";
  }

  // Promoção
  private static getIsPromotion(product: IProductMagento): boolean {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "colecao",
    );
    return attribute?.value === "PROMO";
  }

  // Cor
  private static getColorFromProduct(
    product: IProductMagento,
    colorOptions: { label: string; value: string }[],
  ): string {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "color",
    );
    if (!attribute?.value) {
      return "Sem cor";
    }
    const color = colorOptions.find(
      (el) => String(el.value) === String(attribute.value),
    );
    return color?.label || "Sem cor";
  }

  // Numeração
  private static getNumeration(product: IProductMagento): number {
    const attribute = product.custom_attributes.find(
      (attr) => attr.attribute_code === "grade_caixa",
    );
    const table = attribute?.value;
    let numeration = table
      .replace(/ /g, "")
      .replace(/<table>/g, "")
      .replace(/<\/table>/g, "")
      .replace(/<tbody>/g, "")
      .replace(/<\/tbody>/g, "")
      .replace("<tr>", "")
      .replace(/<\/tr>/g, "")
      .split("<tr>")[0]
      .replace("<td>", "")
      .replace(/<\/td>/g, "")
      .split("<td>");

    // Pega os dois primeiros numeros do numeration[0]
    const firstTwoNumbers = Number(numeration[0].slice(0, 2));

    // Pega os dois últimos numeros do numeration[length - 1]
    const lastTwoNumbers = Number(numeration.at(-1).slice(-2));

    let result = "";

    if (lastTwoNumbers == firstTwoNumbers) {
      result = `${firstTwoNumbers}`;
    } else if (lastTwoNumbers === firstTwoNumbers + 1) {
      result = `${firstTwoNumbers}/${lastTwoNumbers}`;
    } else {
      result = `${firstTwoNumbers} ao ${lastTwoNumbers}`;
    }

    return numJson[result] || 961;
  }
}
