import dotenv from "dotenv";
dotenv.config();

export default {
  txtFilePath: process.env.TXT_FILE_PATH || "Produtos.txt",
  magentoApiUrl:
    process.env.MAGENTO_BASE_URL || "https://your-magento-site.com",
  magentoApiToken: process.env.MAGENTO_ACCESS_TOKEN || "your-magento-api-token",
  mongoDbUrl: process.env.MONGO_DB_URL || "mongodb://localhost:27017/mydb",
  qualityOfImages: Number(process.env.QUALITY_OF_IMAGES) || 45,
  activeProducts: process.env.ACTIVE_PRODUCTS === "true" || false,
};
