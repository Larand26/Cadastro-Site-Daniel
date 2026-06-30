export interface IProductMagento {
  id: number;
  sku: string;
  name: string;
  attribute_set_id: number;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  extension_attributes: {
    website_ids: number[];
    category_links: {
      position: number;
      category_id: string;
    }[];
    product_labels: string[];
  };
  media_gallery_entries: {
    id: number;
    media_type: string;
    label: string | null;
    position: number;
    disabled: boolean;
    types: string[];
    file: string;
  }[];
  tier_prices: any[];
  custom_attributes: {
    attribute_code: string;
    value: any;
  }[];
}

export interface IAttributes {
  sku: string;
  name: string;
  brand: string;
  gender: string;
  manufacturer_code: string;
  color: string;
  pictures: Buffer[];
  resale_price: number;
  packaging: string;
  type: string;
  numeration: number;
  typeNum: number;
  description: string;
  seo_description: string;
  seo_keywords: string;
  visibility: number;
  categories: number[];
  configurable: boolean;
  promotion: boolean;
  created_at: string;
  updated_at: string;
}

export interface ICategoryCondition {
  all?: any[];
  gender?: { value: string; categoryId: number }[];
  type?: { value: string; categoryId: number }[];
  brand?: { value: string; categoryId: number }[];
  name?: { value: string | string[]; categoryId: number | number[] }[];
  promotion?: { value: string; categoryId: number }[];
}
