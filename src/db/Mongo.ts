import mongoose from "mongoose";
import appConfig from "../config/app.config.js";

const modelSchema = new mongoose.Schema({
  referencia: String,
  codigo_cor: String,
  nome_cor: String,
  descricao_produto: String,
  preco_revenda: String,
  embalamento: String,
  fotos: [Buffer],
  video_url: String,
});

class Mongo {
  constructor() {
    mongoose.connect(appConfig.mongoDbUrl);
  }

  async connect() {
    try {
      await mongoose.connect(appConfig.mongoDbUrl);
      console.log("Conexão com o MongoDB estabelecida com sucesso.");
    } catch (error) {
      console.error("Erro ao conectar ao MongoDB:", error);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("Desconectado do MongoDB com sucesso.");
    } catch (error) {
      console.error("Erro ao desconectar do MongoDB:", error);
    }
  }

  async query(manufacturerCode?: string, colorName?: string): Promise<any> {
    try {
      const db = mongoose.connection.db;
      const Product = mongoose.model(
        "Product",
        modelSchema,
        "FOTOS_COLLECTION",
      );
      const filter: any = {};
      if (manufacturerCode) {
        filter.referencia = manufacturerCode;
      }
      if (colorName) {
        filter.nome_cor = colorName;
      }
      const result = await Product.findOne(filter);
      return result;
    } catch (error) {
      console.error("Erro ao executar a consulta no MongoDB:", error);
      return [];
    }
  }
}

export default new Mongo();
