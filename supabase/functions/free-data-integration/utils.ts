
export function extractCity(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 3]?.trim() : '';
}

export function extractState(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  const statePart = parts[parts.length - 2]?.trim();
  return statePart?.split(' ')[0] || '';
}

export function extractZipCode(address: string): string {
  if (!address) return '';
  const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : '';
}

export function extractStateFromCensus(row: any[]): string {
  // Census data includes state codes - would need state code to name mapping
  return row[5] || '';
}

export function extractLocationCity(location: string): string {
  const parts = location.split(',');
  return parts[0]?.trim() || location;
}

export function extractLocationState(location: string): string {
  const parts = location.split(',');
  return parts[1]?.trim() || 'TX';
}

export async function storeScrapedProperties(supabase: any, properties: any[], source: string) {
  try {
    const propertiesToStore = properties.map(property => ({
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      property_type: property.property_type,
      square_footage: property.square_footage,
      asking_price: property.asking_price,
      lot_size_acres: property.lot_size_acres,
      description: property.description,
      listing_url: property.listing_url,
      source: source,
      ai_analysis: property.coordinates ? { coordinates: property.coordinates } : null
    }));

    const { error } = await supabase
      .from('scraped_properties')
      .upsert(propertiesToStore, {
        onConflict: 'address,city,state',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error storing properties:', error);
    } else {
      console.log(`Stored ${propertiesToStore.length} properties from ${source}`);
    }
  } catch (error) {
    console.error('Error in storeScrapedProperties:', error);
  }
}
