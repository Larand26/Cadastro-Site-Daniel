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

  static formatDateToMagento(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} 00:00:00`;
  }
}
