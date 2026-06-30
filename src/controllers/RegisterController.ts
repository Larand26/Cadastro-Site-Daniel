import type { IAttributes } from "../interfaces/interfaces.js";

import RegisterService from "../services/RegisterService.js";

export default abstract class RegisterController {
  static async registerProducts(products: IAttributes[]): Promise<void> {
    await RegisterService.registerProducts(products);
  }
}
