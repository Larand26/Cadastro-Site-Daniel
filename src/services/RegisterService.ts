import type { IAttributes } from "../interfaces/interfaces.js";

import MagentoApiService from "./MagentoApiService.js";
import Utils from "../utils/Utils.js";

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
        attributes.push(this.insertPackaging(product));
        attributes.push(this.insertNumeration(product));
        attributes.push(this.insertTypeNum(product));
        attributes.push(this.insertResalePrice(product));
        attributes.push(this.insertDescription(product));
        attributes.push(this.insertSeoDescription(product));
        attributes.push(this.insertSeoKeywords(product));
        attributes.push(this.insertSeoTitle(product));
        attributes.push(this.insertNewsFromDate(product));
        attributes.push(this.insertNewsToDate(product));

        const responseAttributes =
          await MagentoApiService.updateProductAttributes(
            product.sku,
            attributes,
          );

        const media = this.insertMedia(product);

        const responseMedia = await MagentoApiService.addProductMedia(
          product.sku,
          media,
        );
      }
    } catch (error) {
      console.error(`Erro ao registrar os produtos: ${error}`);
    }
  }

  // Categorias
  private static insertCategories(product: IAttributes): attribute {
    if (product.configurable)
      return { attribute_code: "category_ids", value: [] };
    return { attribute_code: "category_ids", value: product.categories };
  }

  // Embalagem
  private static insertPackaging(product: IAttributes): attribute {
    const value = product.packaging === "c" ? 1084 : 1083;
    return { attribute_code: "embalamento", value: value };
  }

  // Numeração
  private static insertNumeration(product: IAttributes): attribute {
    return { attribute_code: "numeracao", value: product.numeration };
  }

  // Tipo de Numeração
  private static insertTypeNum(product: IAttributes): attribute {
    return { attribute_code: "tipo_de_grade", value: product.typeNum };
  }

  // Preço de Revenda
  private static insertResalePrice(product: IAttributes): attribute {
    return { attribute_code: "preco_revenda", value: product.resale_price };
  }

  // Descrição
  private static insertDescription(product: IAttributes): attribute {
    return { attribute_code: "description", value: product.description };
  }

  // SEO Descrição
  private static insertSeoDescription(product: IAttributes): attribute {
    return {
      attribute_code: "meta_description",
      value: product.seo_description,
    };
  }

  // SEO Palavras-chave
  private static insertSeoKeywords(product: IAttributes): attribute {
    return { attribute_code: "meta_keyword", value: product.seo_keywords };
  }

  // SEO Título
  private static insertSeoTitle(product: IAttributes): attribute {
    return { attribute_code: "meta_title", value: product.name };
  }

  // Data de início da coleção
  private static insertNewsFromDate(product: IAttributes): attribute {
    return { attribute_code: "news_from_date", value: product.news_from_date };
  }

  // Data de fim da coleção
  private static insertNewsToDate(product: IAttributes): attribute {
    return { attribute_code: "news_to_date", value: product.news_to_date };
  }

  // Imagens
  private static insertMedia(product: IAttributes): any[] {
    if (product.pictures.length === 0) return [];
    const media = product.pictures.map((picture: Buffer, index: number) => {
      const base64Image = picture.toString("base64");
      return {
        media_type: "image",
        label: `${product.name}`,
        position: index + 1,
        disabled: false,
        types:
          index === 0
            ? [
                "image",
                "small_image",
                "thumbnail",
                "swatch_image",
                "flash_sale_image",
              ]
            : [],
        content: {
          base64_encoded_data: base64Image,
          type: "image/jpeg",
          name: Utils.cleanFileName(product.name) + "_" + (index + 1) + ".jpg",
        },
      };
    });
    return media;
  }
}
