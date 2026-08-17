import appConfig from "../config/app.config.js";
import { logger } from "../utils/logger.js";
import axios from "axios";

import type { IProductMagento } from "../interfaces/interfaces.js";

export default abstract class MagentoApiService {
  static async fetchProducts(
    manufacturersCodes: string[],
  ): Promise<IProductMagento[]> {
    try {
      const params = this.buildParamsToFetchProducts(manufacturersCodes);

      const response = await axios.get(
        `${appConfig.magentoApiUrl}/rest/V1/products`,
        {
          params,
          headers: { Authorization: `Bearer ${appConfig.magentoApiToken}` },
        },
      );
      return response.data.items;
    } catch (error) {
      logger.error(`Erro ao buscar produtos no Magento: ${error}`);
      return [];
    }
  }

  private static buildParamsToFetchProducts(
    manufacturersCodes: string[],
  ): Record<string, any> {
    const params: Record<string, any> = {
      "searchCriteria[pageSize]": 100,
      "searchCriteria[currentPage]": 1,
      "searchCriteria[filterGroups][0][filters][0][field]": "status",
      "searchCriteria[filterGroups][0][filters][0][value]":
        appConfig.getActiveProducts ? 1 : 2,
      "searchCriteria[filterGroups][0][filters][0][conditionType]": "eq",
    };
    for (let i = 0; i < manufacturersCodes.length; i++) {
      const code = manufacturersCodes[i];
      params[`searchCriteria[filterGroups][1][filters][${i}][field]`] = "name";
      params[`searchCriteria[filterGroups][1][filters][${i}][value]`] =
        `%${code}%`;
      params[`searchCriteria[filterGroups][1][filters][${i}][conditionType]`] =
        "like";
    }
    return params;
  }

  static async fetchColorOptions(): Promise<
    { label: string; value: string }[]
  > {
    try {
      const response = await axios.get(
        `${appConfig.magentoApiUrl}/rest/V1/products/attributes/color`,
        {
          headers: { Authorization: `Bearer ${appConfig.magentoApiToken}` },
        },
      );
      return response.data.options;
    } catch (error) {
      logger.error(`Erro ao pegar as opções de cores: ${error}`);
      return [];
    }
  }

  // ✅ NOVO MÉTODO ATÔMICO: Salva Atributos, Categorias, Mídia e Status de uma só vez!
  static async saveFullProduct(
    sku: string,
    attributes: { attribute_code: string; value: any }[],
    media: any[],
    isActive: boolean = true,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload: any = {
        product: {
          sku,
          status: isActive ? 1 : 2,
          custom_attributes: attributes,
        },
      };

      // Se houver fotos, anexa no mesmo payload
      if (media && media.length > 0) {
        payload.product.media_gallery_entries = media;
      }

      await axios.put(
        `${appConfig.magentoApiUrl}/rest/all/V1/products/${sku}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${appConfig.magentoApiToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        success: true,
        message: "Produto completo atualizado com sucesso.",
      };
    } catch (error) {
      logger.error(`Erro ao atualizar o produto ${sku} no Magento: ${error}`);
      return {
        success: false,
        message: "Erro ao atualizar o produto completo.",
      };
    }
  }
}
