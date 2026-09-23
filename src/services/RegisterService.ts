import type { IAttributes } from "../interfaces/interfaces.js";
import MagentoApiService from "./MagentoApiService.js";
import Utils from "../utils/Utils.js";
import appConfig from "../config/app.config.js";

interface attribute {
  attribute_code: string;
  value: any;
}

export default abstract class RegisterService {
  static async registerProducts(products: IAttributes[]): Promise<void> {
    try {
      for (const product of products) {
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

          const mediaList = this.insertMedia(product);
          const isActive = appConfig.activeProducts;

          // 🚀 ETAPA 1: Salva o produto sem payload de imagem
          const response = await MagentoApiService.saveFullProduct(
            product.sku,
            attributes,
            isActive,
          );

          if (response.success) {
            console.log(
              `Dados principais do produto ${product.sku} salvos com sucesso.`,
            );

            // 🚀 ETAPA 2: Se a etapa 1 funcionou, processa as mídias de forma isolada
            if (mediaList && mediaList.length > 0) {
              for (const media of mediaList) {
                // Try/catch isolado garante que falhas no Base64 não anulem a gravação do produto
                try {
                  const mediaResponse =
                    await MagentoApiService.uploadProductImage(
                      product.sku,
                      media,
                    );
                  if (mediaResponse.success) {
                    console.log(
                      `Imagem anexada ao produto ${product.sku} com sucesso.`,
                    );
                  } else {
                    console.error(
                      `Falha isolada na imagem do produto ${product.sku}: ${mediaResponse.message}`,
                    );
                  }
                } catch (mediaError) {
                  console.error(
                    `Erro inesperado ao processar mídia para o SKU ${product.sku}:`,
                    mediaError,
                  );
                }
              }
            }
          } else {
            console.error(
              `Falha ao processar produto ${product.sku}: ${response.message}`,
            );
          }
        } catch (innerError) {
          console.error(
            `Erro fatal no processamento completo do produto ${product.sku}:`,
            innerError,
          );
        }
      }

      console.log("Processamento de TODOS os produtos concluído.");
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

  // Imagens formatadas perfeitamente para o schema Entry do Magento Media endpoint
  private static insertMedia(product: IAttributes): any[] {
    if (product.configurable) return [];
    if (product.pictures.length === 0) return [];

    return product.pictures.map((picture: Buffer, index: number) => {
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
          // ✅ NOME CURTO E SEGURO: Usando o SKU em vez do nome do produto
          name: `${Utils.cleanFileName(product.name)}_${product.sku}_${index + 1}.jpg`,
        },
      };
    });
  }

  // Auto Categoria removida
  private static removeCategory(product: IAttributes): attribute {
    if (product.configurable)
      return { attribute_code: "auto_category_removed", value: "1" };

    return {
      attribute_code: "auto_category_removed",
      value: "0",
    };
  }
}
