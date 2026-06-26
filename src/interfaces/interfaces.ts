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

export interface IAtributes {
  sku: string;
  name: string;
  brand: string;
  gender: string;
  manufacturer_code: string;
  color: string;
  pictures: string[];
  resale_price: number;
  packaging: string;
  type: string;
  numeration: string;
  description: string;
  seo_description: string;
  seo_keywords: string;
  visibility: number;
  categories: string[];
  configurable: boolean;
  promotion: boolean;
  created_at: string;
  updated_at: string;
}
