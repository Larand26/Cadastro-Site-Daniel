import fs from "fs";
import path from "path";
import chalk from "chalk";
import appConfig from "../config/app.config.js";
import { logger } from "../utils/logger.js";
import type {
  IProductMagento,
  IAttributes,
  ICategoryCondition,
} from "../interfaces/interfaces.js";

// attributes Json
import {
  genderJson,
  brandJson,
  typeJson,
  numJson,
  typeNumJson,
} from "../assets/attributesJson.js";
import { seoJson } from "../assets/seoJson.js";
import { rulesCategoryJson } from "../assets/rulesCategoryJson.js";
import MagentoApiService from "./MagentoApiService.js";
import ImageService from "./ImageService.js";
import Mongo from "../db/Mongo.js";

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
      productattribute.typeNum = this.getTypeNum(productattribute.gender);
      productattribute.seo_description = this.getSeoDescription(
        productattribute.name,
        productattribute.brand,
      );
      productattribute.seo_keywords = this.getSeoKeyWords(
        productattribute.name,
        productattribute.brand,
      );
      const { resale_price, packaging, description, pictures } =
        await this.getAttributesFromMongoDB(
          productattribute.manufacturer_code,
          productattribute.color,
        );
      productattribute.resale_price = resale_price;
      productattribute.packaging = packaging;
      productattribute.description = description;
      productattribute.pictures = pictures;
      productattribute.categories = this.getCategorys(productattribute);
      const { news_from_date, news_to_date } =
        this.getDatesFromProduct(product);
      productattribute.news_from_date = news_from_date;
      productattribute.news_to_date = news_to_date;
      this.infos(productattribute);
      return productattribute;
    } catch (error) {
      logger.error(
        `Erro ao obter atributos do produto ${product.sku}: ${error}`,
      );
      return {} as IAttributes;
    }
  }

  // Infos
  private static infos(product: IAttributes): void {
    const divider = chalk.gray("-".repeat(50));
    const label = (text: string) => chalk.cyanBright(text.padEnd(20, " "));

    console.log(divider);
    console.log(chalk.bold.bgBlue.white(" PRODUTO "), chalk.bold(product.name));
    console.log(`${label("SKU")}: ${chalk.whiteBright(product.sku)}`);
    console.log(`${label("Nome")}: ${chalk.whiteBright(product.name)}`);
    console.log(`${label("Gênero")}: ${chalk.whiteBright(product.gender)}`);
    console.log(`${label("Marca")}: ${chalk.whiteBright(product.brand)}`);
    console.log(`${label("Tipo")}: ${chalk.whiteBright(product.type)}`);
    console.log(
      `${label("Preço de venda")}: ${chalk.whiteBright(`R$ ${product.resale_price},99`)}`,
    );
    console.log(
      `${label("Quantidade de fotos")}: ${chalk.whiteBright(product.pictures ? product.pictures.length : 0)}`,
    );
    console.log(divider);
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

  // Código do tipo de numeração
  private static getTypeNum(gender: string): number {
    return typeNumJson[gender] || 2258;
  }

  // SEO Descrição
  private static getSeoDescription(name: string, brand: string): string {
    const randomIndex = Math.floor(Math.random() * seoJson.length);

    // 1. Cria uma CÓPIA do objeto original para não alterar o JSON em memória
    const seo = { ...seoJson[randomIndex] };

    if (!seo.seoDescription) return "";

    // 2. Faz os replaces na cópia
    return seo.seoDescription
      .replace(/\$nome/g, name)
      .replace(/\$marca/g, brand);
  }

  // SEO palavras chave
  private static getSeoKeyWords(name: string, brand: string): string {
    const randomIndex = Math.floor(Math.random() * seoJson.length);

    // 1. Cria uma CÓPIA do objeto original para não alterar o JSON em memória
    const seo = { ...seoJson[randomIndex] };

    if (!seo.seoKeyWords) return "";

    // 2. Faz os replaces na cópia
    return seo.seoKeyWords.replace(/\$nome/g, name).replace(/\$marca/g, brand);
  }

  // Busca atributos do MongoDB
  private static async getAttributesFromMongoDB(
    manufacturerCode: string,
    colorName: string,
  ): Promise<any> {
    try {
      const attributes = await Mongo.query(manufacturerCode, colorName);
      const results = {} as any;
      if (attributes?.preco_revenda) {
        results.resale_price = Number(attributes.preco_revenda);
      } else {
        results.resale_price = 0;
      }
      if (attributes?.embalamento) {
        results.packaging = attributes.embalamento;
      } else {
        results.packaging = "f";
      }
      if (attributes?.descricao_produto) {
        results.description = attributes.descricao_produto;
      } else {
        results.description = "Sem descrição";
      }
      if (attributes?.fotos && attributes.fotos.length > 0) {
        results.pictures = await Promise.all(
          attributes.fotos.map(async (foto: Buffer, index: number) => {
            if (index === 0) {
              return await ImageService.resizePrimaryImageBuffer(foto);
            }
            return await ImageService.resizeImageBuffer(foto);
          }),
        );
      } else {
        results.pictures = [];
      }
      return results;
    } catch (error) {
      console.error("Erro ao buscar atributos do MongoDB:", error);
      return null;
    }
  }

  // Categorias
  private static getCategorys(product: IAttributes): number[] {
    let categoryIds = [] as number[];

    for (const rule of rulesCategoryJson) {
      const conditions = rule.rules as ICategoryCondition[];

      for (const condition of conditions) {
        // Regra "All"
        if (condition.all) {
          for (const item of condition.all) {
            if (Array.isArray(item.categoryId)) {
              categoryIds = categoryIds.concat(item.categoryId);
            } else {
              categoryIds.push(item.categoryId);
            }
          }
        }

        // Regra "Gender + type"
        if (condition.gender && condition.type) {
          const genderMatch = condition.gender.find(
            (g) => g.value === product.gender,
          );
          const typeMatch = condition.type.find(
            (t) => t.value === product.type,
          );
          if (genderMatch && typeMatch) {
            if (typeMatch.categoryId !== 0)
              categoryIds.push(typeMatch.categoryId);
            if (genderMatch.categoryId !== 0)
              categoryIds.push(genderMatch.categoryId);
          }
        }

        // Regra "Brand"
        if (condition.brand && condition.gender) {
          const genderMatch = condition.gender.find(
            (g) => g.value === product.gender,
          );
          const brandMatch = condition.brand.find(
            (b) => b.value === product.brand,
          );
          if (genderMatch && brandMatch) {
            if (brandMatch.categoryId !== 0)
              categoryIds.push(brandMatch.categoryId);
            if (genderMatch.categoryId !== 0)
              categoryIds.push(genderMatch.categoryId);
          }
        }

        // Regra "Others"
        if (condition.name) {
          for (const item of condition.name) {
            if (Array.isArray(item.value)) {
              for (const val of item.value) {
                if (product.name && product.name.includes(val)) {
                  if (Array.isArray(item.categoryId)) {
                    categoryIds = categoryIds.concat(item.categoryId);
                  } else {
                    categoryIds.push(item.categoryId);
                  }
                }
              }
            } else {
              if (product.name && product.name.includes(item.value)) {
                if (Array.isArray(item.categoryId)) {
                  categoryIds = categoryIds.concat(item.categoryId);
                } else {
                  categoryIds.push(item.categoryId);
                }
              }
            }
          }
        }

        // Regra "Promotion"
        if (condition.promotion && condition.gender) {
          const promoMatch = condition.promotion.find((p) =>
            product.promotion ? "PROMO" : "NÃO PROMO" === p.value,
          );
          if (promoMatch) {
            if (promoMatch.categoryId !== 0)
              categoryIds.push(promoMatch.categoryId);

            const genderMatch = condition.gender.find(
              (g) => g.value === product.gender,
            );
            if (genderMatch && genderMatch.categoryId !== 0)
              categoryIds.push(genderMatch.categoryId);
          }
          // Remove a categoria de lançamento se for promoção
          if (promoMatch && promoMatch.value === "PROMO") {
            categoryIds = categoryIds.filter((id) => id !== 173);
          }
        }

        // Regra "Release"
        if (condition.gender && (rule as any).name === "Release") {
          const genderMatch = condition.gender.find(
            (g) => g.value === product.gender,
          );
          if (genderMatch && genderMatch.categoryId !== 0) {
            categoryIds.push(genderMatch.categoryId);
          }
        }
      }
    }

    // Remover duplicados e zeros
    categoryIds = categoryIds.filter(
      (id, idx, arr) => id !== 0 && arr.indexOf(id) === idx,
    );
    return categoryIds || [];
  }

  // Pega as datas de criação e atualização do produto
  private static getDatesFromProduct(product: IProductMagento): {
    news_from_date: string;
    news_to_date: string;
  } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // dia 20 desse mês e ano, às 00:00:00
    const fromDate = new Date(year, month, 20, 0, 0, 0);

    // dia 20 do próximo mês, às 23:59:59 (Se for Dezembro, o JS joga para Janeiro do ano seguinte)
    const toDate = new Date(year, month + 1, 20, 23, 59, 59);

    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return {
      news_from_date: formatter.format(fromDate),
      news_to_date: formatter.format(toDate),
    };
  }
}
