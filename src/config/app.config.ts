import dotenv from "dotenv";
dotenv.config();

export default {
  txtFilePath: process.env.TXT_FILE_PATH || "Produtos.txt",
  magentoApiUrl:
    process.env.MAGENTO_BASE_URL || "https://your-magento-site.com",
  magentoApiToken: process.env.MAGENTO_ACCESS_TOKEN || "your-magento-api-token",
};
