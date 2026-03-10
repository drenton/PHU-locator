export type Language = 'en' | 'fr';

export interface AddressStructured {
  street: string;
  city: string;
  province: string;
  postal: string;
}

export interface OntarioCaData {
  name: string;
  address: string;
  phone: string;
  toll_free?: string;
  website: string;
  region: string;
}

export interface PHULocatorData {
  phu_name: string;
  phu_website_url: string;
  moh: string;
  address: string;
  phone: string;
  fax: string;
  after_hours: string;
}

export interface RawPHU {
  ontario_ca_name: string;
  phu_locator_names: string[];
  ontario_health_region: string;
  ontario_ca_data: OntarioCaData;
  phu_locator_data: PHULocatorData;
  municipalities_served: string[];
  municipality_count: number;
  name_fr: string;
  ontario_health_region_fr: string;
  municipalities_served_fr: string[];
  address_fr: string;
  address_structured: AddressStructured;
  address_structured_fr: AddressStructured;
}

export interface RawPHUData {
  metadata: {
    total_phus: number;
    total_municipalities: number;
  };
  public_health_units: RawPHU[];
}

export interface NormalizedPHU {
  id: number;
  name_en: string;
  name_fr: string;
  region_en: string;
  region_fr: string;
  phone: string;
  toll_free: string;
  fax: string;
  after_hours: string;
  website: string;
  moh: string;
  address_en: string;
  address_fr: string;
  address_structured: AddressStructured;
  address_structured_fr: AddressStructured;
  municipalities_en: string[];
  municipalities_fr: string[];
  phu_locator_names: string[];
}

export interface SearchItem {
  text: string;
  textNormalized: string;
  type: 'municipality' | 'phu' | 'region';
  phuId: number;
  displayLabel: string;
  phuName: string;
}
