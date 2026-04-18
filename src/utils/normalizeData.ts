import type { RawPHU, NormalizedPHU, OntarioCaData, PHULocatorData } from '../types/phu';

export function normalizePHU(raw: RawPHU, index: number): NormalizedPHU {
  const ca = raw.ontario_ca_data || ({} as Partial<OntarioCaData>);
  const loc = raw.phu_locator_data || ({} as Partial<PHULocatorData>);

  return {
    id: index,
    name_en: raw.ontario_ca_name || loc.phu_name || '',
    name_fr: raw.name_fr || raw.ontario_ca_name || '',
    region_en: raw.ontario_health_region || '',
    region_fr: raw.ontario_health_region_fr || raw.ontario_health_region || '',
    phone: ca.phone || loc.phone || '',
    toll_free: ca.toll_free || '',
    fax: loc.fax || '',
    after_hours: loc.after_hours || '',
    website: ca.website || loc.phu_website_url || '',
    moh: loc.moh || '',
    address_en: ca.address || loc.address || '',
    address_fr: raw.address_fr || ca.address || loc.address || '',
    address_structured: raw.address_structured || { street: '', city: '', province: '', postal: '' },
    address_structured_fr: raw.address_structured_fr || raw.address_structured || { street: '', city: '', province: '', postal: '' },
    municipalities_en: raw.municipalities_served || [],
    municipalities_fr: raw.municipalities_served_fr || raw.municipalities_served || [],
    phu_locator_names: raw.phu_locator_names || [],
  };
}

export function normalizePHUs(rawPHUs: RawPHU[]): NormalizedPHU[] {
  return rawPHUs.map(normalizePHU);
}
