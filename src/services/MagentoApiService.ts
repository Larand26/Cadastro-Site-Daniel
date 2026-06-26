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
      "searchCriteria[filterGroups][0][filters][0][value]": 1,
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
}
