export default class Utils {
  static cleanFileName(fileName: string): string {
    // Remove caracteres especiais e espaços em branco
    const cleanedFileName = fileName
      .toLowerCase()
      .normalize("NFD") // Remove acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-") // Troca tudo que não é letra/número por hífen
      .replace(/-+/g, "-"); // Remove hífens duplicados
    return cleanedFileName;
  }
}
