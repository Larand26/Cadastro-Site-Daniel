import dotenv from "dotenv";
dotenv.config();

export default {
  txtFilePath: process.env.TXT_FILE_PATH || "Produtos.txt",
};
