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

  // ✅ ETAPA 1: Salva apenas Atributos, Categorias e Status sem o payload pesado de mídia
  static async saveFullProduct(
    sku: string,
    attributes: { attribute_code: string; value: any }[],
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
        message: "Dados puros do produto atualizados com sucesso.",
      };
    } catch (error) {
      logger.error(
        `Erro ao atualizar os dados do produto ${sku} no Magento: ${error}`,
      );
      return {
        success: false,
        message: "Erro ao atualizar o produto completo.",
      };
    }
  }

  // ✅ ETAPA 2: Processamento exclusivo da imagem em Base64
  static async uploadProductImage(
    sku: string,
    mediaEntry: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        entry: mediaEntry,
      };

      await axios.post(
        `${appConfig.magentoApiUrl}/rest/all/V1/products/${sku}/media`,
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
        message: "Upload de imagem realizado com sucesso.",
      };
    } catch (error: any) {
      // ✅ CAPTURA DO ERRO DETALHADO DO MAGENTO
      const magentoErrorMessage =
        error.response?.data?.message || error.message;
      const magentoErrorParameters = error.response?.data?.parameters || "";

      console.error(
        `\n[ERRO MAGENTO - SKU ${sku}]: ${magentoErrorMessage}`,
        magentoErrorParameters ? magentoErrorParameters : "",
      );

      return {
        success: false,
        message: magentoErrorMessage,
      };
    }
  }
}
