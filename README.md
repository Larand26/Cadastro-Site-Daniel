# 🛍️ Magento 2 Auto Catalog Product

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Magento 2](https://img.shields.io/badge/Magento_2-EE6C2E?style=flat&logo=magento&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

Uma automação robusta desenvolvida em Node.js e TypeScript projetada para realizar o cadastro em lote e a sincronização automática de produtos diretamente na plataforma Magento 2 utilizando a API REST nativa.

---

## 🎯 Objetivo

O projeto resolve o gargalo do cadastro manual de grandes volumes de produtos, variações e grades de catálogos (como calçados e vestuário). Ele automatiza a finalização de produtos simples e configuráveis, vinculação de atributos, definição de preços e estoque, acelerando drasticamente o processo de atualização do e-commerce.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/) (v24+)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Integração:** Magento 2 REST API (OAuth 1.0a / Bearer Token)
- **Consumo de Dados:** Axios para requisições HTTP assíncronas com tratamento de concorrência e rate limit.

---

## ✨ Funcionalidades

- [] **Suporte a Atributos Complexos:** Vinculação automática de categorias, descrições, fotos.
- [] **Gerenciamento de Estoque:** Atualização imediata do inventário (Stock Item) no momento do cadastro.
- [] **Tratamento de Erros e Logs:** Sistema de logs detalhado para identificar SKUs duplicados ou falhas de validação na API.

---

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js instalado globalmente.
- Gerenciador de pacotes (NPM, Yarn ou Pnpm).
- Credenciais de Integração de Integrações do Magento 2 (Admin -> System -> Extensions -> Integrations).

### Passo a Passo

```bash
# 1. Clone este repositório
$ git clone [https://github.com/seu-usuario/Cadastro-Site-Daniel.git](https://github.com/seu-usuario/Cadastro-Site-Daniel.git)

# 2. Acesse a pasta do projeto
$ cd Cadastro-Site-Daniel

# 3. Instale as dependências
$ npm install

# 4. Configure suas variáveis de ambiente no arquivo .env (conforme seção abaixo)

# 5. Inicie o script de automação
$ npm run start
```
