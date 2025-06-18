
export function extractLocationCity(location: string): string {
  // Extract city from location string (e.g., "Dallas, TX" -> "Dallas")
  const parts = location.split(',');
  return parts[0]?.trim() || location;
}

export function extractLocationState(location: string): string {
  // Extract state from location string (e.g., "Dallas, TX" -> "TX")
  const parts = location.split(',');
  if (parts.length > 1) {
    const statePart = parts[1]?.trim();
    // Handle cases like "Texas" or "TX"
    if (statePart) {
      // Common state name to abbreviation mapping
      const stateMap: { [key: string]: string } = {
        'texas': 'TX',
        'california': 'CA',
        'florida': 'FL',
        'new york': 'NY',
        'illinois': 'IL',
        'pennsylvania': 'PA',
        'ohio': 'OH',
        'georgia': 'GA',
        'north carolina': 'NC',
        'michigan': 'MI'
      };
      
      const normalized = statePart.toLowerCase();
      return stateMap[normalized] || statePart;
    }
  }
  return 'Unknown';
}

export function extractCity(address: string): string {
  if (!address) return 'Unknown';
  
  // Try to extract city from full address
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Usually city is the second to last part in "Street, City, State ZIP"
    return parts[parts.length - 2]?.trim() || 'Unknown';
  }
  
  return 'Unknown';
}

export function extractState(address: string): string {
  if (!address) return 'Unknown';
  
  // Try to extract state from full address
  const parts = address.split(',');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1]?.trim();
    if (lastPart) {
      // Extract state abbreviation from "State ZIP" format
      const stateMatch = lastPart.match(/([A-Z]{2})\s+\d/);
      if (stateMatch) {
        return stateMatch[1];
      }
      // If no ZIP, might just be state
      const words = lastPart.split(' ');
      return words[0] || 'Unknown';
    }
  }
  
  return 'Unknown';
}

export function extractZipCode(address: string): string {
  if (!address) return '';
  
  // Extract ZIP code from address
  const zipMatch = address.match(/\b(\d{5}(?:-\d{4})?)\b/);
  return zipMatch ? zipMatch[1] : '';
}

export function extractStateFromCensus(countyName: string): string {
  if (!countyName) return 'Unknown';
  
  // Census data usually comes as "County Name, State"
  const parts = countyName.split(',');
  if (parts.length > 1) {
    return parts[1]?.trim() || 'Unknown';
  }
  
  return 'Unknown';
}

export async function storeScrapedProperties(supabase: any, properties: any[], source: string) {
  if (!properties || properties.length === 0) {
    console.log('No properties to store');
    return;
  }

  console.log(`Storing ${properties.length} properties from ${source}`);
  
  try {
    // Format properties for database insertion
    const formattedProperties = properties.map(property => ({
      address: property.address || 'Unknown Address',
      city: property.city || 'Unknown',
      state: property.state || 'Unknown',
      zip_code: property.zip_code || '',
      property_type: property.property_type || 'unknown',
      source: source,
      listing_url: property.listing_url || null,
      description: property.description || null,
      square_footage: property.square_footage || null,
      asking_price: property.asking_price || null,
      lot_size_acres: property.lot_size_acres || null,
      power_capacity_mw: property.power_capacity_mw || null,
      substation_distance_miles: property.substation_distance_miles || null,
      transmission_access: property.transmission_access || false,
      zoning: property.zoning || null,
      ai_analysis: property.coordinates ? { coordinates: property.coordinates } : null,
      scraped_at: new Date().toISOString(),
      moved_to_properties: false
    }));

    // Insert properties in batches to avoid conflicts
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < formattedProperties.length; i += batchSize) {
      const batch = formattedProperties.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('scraped_properties')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        // Continue with next batch instead of failing completely
        continue;
      }

      if (data) {
        insertedCount += data.length;
        console.log(`Successfully inserted batch ${i / batchSize + 1}: ${data.length} properties`);
      }
    }

    console.log(`Successfully stored ${insertedCount} out of ${properties.length} properties`);
    return { success: true, inserted: insertedCount };
    
  } catch (error) {
    console.error('Error storing properties:', error);
    throw error;
  }
}
