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
      "searchCriteria[pageSize]": 1,
      "searchCriteria[currentPage]": 1,

      // --- GRUPO 0: Status (Condição E principal) ---
      "searchCriteria[filterGroups][0][filters][0][field]": "status",
      "searchCriteria[filterGroups][0][filters][0][value]": 2,
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

  // Pega as opções de cores
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

  // Atualiza os atributos do produto no Magento
  static async updateProductAttributes(
    sku: string,
    attributes: { attribute_code: string; value: any }[],
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        product: {
          sku,
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
    } catch (error) {
      logger.error(
        `Erro ao atualizar os atributos do produto ${sku} no Magento: ${error}`,
      );
      console.log(JSON.stringify(error, null, 2));
      return {
        success: false,
        message: "Erro ao atualizar os atributos do produto.",
      };
    }
    return {
      success: true,
      message: "Atributos do produto atualizados com sucesso.",
    };
  }

  static async addProductMedia(
    sku: string,
    media: any[],
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        product: {
          sku,
          // CORREÇÃO: A chave correta é media_gallery_entries
          media_gallery_entries: media,
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
    } catch (error) {
      logger.error(
        `Erro ao adicionar mídia ao produto ${sku} no Magento: ${error}`,
      );
      console.log(JSON.stringify(error, null, 2));
      return {
        success: false,
        message: "Erro ao adicionar mídia ao produto.",
      };
    }
    return {
      success: true,
      message: "Mídia do produto adicionada com sucesso.",
    };
  }

  // Ativa o produto no Magento
  static async activateProduct(
    sku: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        product: {
          sku,
          status: appConfig.activeProducts ? 1 : 2, // Ativo ou Inativo
        },
      };
      console.log(
        `Ativando produto ${sku} com status: ${payload.product.status}`,
      );
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
    } catch (error) {
      logger.error(`Erro ao ativar o produto ${sku} no Magento: ${error}`);
      console.log(JSON.stringify(error, null, 2));
      return {
        success: false,
        message: "Erro ao ativar o produto.",
      };
    }
    return {
      success: true,
      message: "Produto ativado com sucesso.",
    };
  }
}
