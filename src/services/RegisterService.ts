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
      const productPromises = products.map(async (product) => {
        try {
          const attributes = [
            this.removeCategory(product),
            this.insertCategories(product),
            this.insertPackaging(product),
            this.insertNumeration(product),
            this.insertTypeNum(product),
            this.insertResalePrice(product),
            this.insertDescription(product),
            this.insertSeoDescription(product),
            this.insertSeoKeywords(product),
            this.insertSeoTitle(product),
            this.insertNewsFromDate(product),
            this.insertNewsToDate(product),
          ];

          // 1. Enviamos os atributos
          const responseAttributes =
            await MagentoApiService.updateProductAttributes(
              product.sku,
              attributes,
            );

          // 2. Enviamos a mídia
          const media = this.insertMedia(product);
          const responseMedia = await MagentoApiService.addProductMedia(
            product.sku,
            media,
          );

          // 3. Forçamos a alteração de status enviando um PUT limpo ANTES de remover a categoria
          if (responseAttributes.success || responseMedia.success) {
            await MagentoApiService.activateProduct(product.sku);
          }

          // 4. O GRAN FINALE: Agora que o produto já foi atualizado, teve mídia inserida e mudou de status,
          // nós removemos a categoria. Nada mais vai rodar depois disso para recriá-la!
          if (product.configurable) {
            await MagentoApiService.removeProductFromCategory(product.sku, 173);
          }

          return {
            success: responseAttributes.success && responseMedia.success,
            product: product,
          };
        } catch (innerError) {
          console.error(
            `Erro ao processar o produto ${product.sku}:`,
            innerError,
          );
          return { success: false, product: product };
        }
      });

      await Promise.all(productPromises);
      console.log("Processamento de todos os produtos concluído.");
    } catch (error) {
      console.error(`Erro fatal ao registrar a fila de produtos: ${error}`);
    }
  }

  // Categorias
  private static insertCategories(product: IAttributes): attribute {
    if (product.configurable)
      return { attribute_code: "category_ids", value: [] };
    return {
      attribute_code: "category_ids",
      value: product.categories.map((categoryId) => String(categoryId)),
    };
  }

  // Embalagem
  private static insertPackaging(product: IAttributes): attribute {
    const value = product.packaging === "c" ? 1084 : 1083;
    return { attribute_code: "embalamento", value: String(value) };
  }

  // Numeração
  private static insertNumeration(product: IAttributes): attribute {
    return { attribute_code: "numeracao", value: String(product.numeration) };
  }

  // Tipo de Numeração
  private static insertTypeNum(product: IAttributes): attribute {
    return { attribute_code: "tipo_de_grade", value: String(product.typeNum) };
  }

  // Preço de Revenda
  private static insertResalePrice(product: IAttributes): attribute {
    return {
      attribute_code: "preco_revenda",
      value: `${product.resale_price}.99`,
    };
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
    if (product.configurable)
      return { attribute_code: "news_from_date", value: "" };
    return { attribute_code: "news_from_date", value: product.news_from_date };
  }

  // Data de fim da coleção
  private static insertNewsToDate(product: IAttributes): attribute {
    if (product.configurable)
      return { attribute_code: "news_to_date", value: "" };
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

  // Auto Categoria remova
  private static removeCategory(product: IAttributes): attribute {
    if (product.configurable)
      return { attribute_code: "auto_category_removed", value: "1" };

    return {
      attribute_code: "auto_category_removed",
      value: "0",
    };
  }
}
