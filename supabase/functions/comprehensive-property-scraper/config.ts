
import { BrokerageSite } from './types.ts';

export const brokerageSites: BrokerageSite[] = [
  {
    name: 'CBRE',
    id: 'cbre',
    baseUrl: 'https://www.cbre.com',
    searchPath: '/real-estate-services/real-estate-for-lease-and-sale',
    selectors: {
      listings: '.property-card, .listing-item, .result-item',
      address: '.address, .property-address, .location',
      price: '.price, .asking-price, .rental-rate',
      sqft: '.square-feet, .sqft, .size',
      type: '.property-type, .asset-type'
    },
    strategy: 'dom'
  },
  {
    name: 'JLL',
    id: 'jll',
    baseUrl: 'https://www.jll.com',
    searchPath: '/en/properties',
    selectors: {
      listings: '.property-listing, .listing-card, .property-item',
      address: '.property-location, .address-text',
      price: '.price-display, .asking-price',
      sqft: '.building-size, .property-size',
      type: '.property-type-label'
    },
    strategy: 'dom'
  },
  {
    name: 'Cushman & Wakefield',
    id: 'cushman-wakefield',
    baseUrl: 'https://www.cushmanwakefield.com',
    searchPath: '/en/properties',
    selectors: {
      listings: '.property-card, .listing-container',
      address: '.property-address, .location-info',
      price: '.price-info, .lease-rate',
      sqft: '.size-info, .square-footage',
      type: '.asset-class, .property-category'
    },
    strategy: 'dom'
  },
  {
    name: 'Colliers',
    id: 'colliers',
    baseUrl: 'https://www.colliers.com',
    searchPath: '/en-us/properties',
    selectors: {
      listings: '.property-result, .listing-card',
      address: '.property-location',
      price: '.price-range, .asking-price',
      sqft: '.building-area',
      type: '.property-type'
    },
    strategy: 'dom'
  },
  {
    name: 'Marcus & Millichap',
    id: 'marcus-millichap',
    baseUrl: 'https://www.marcusmillichap.com',
    searchPath: '/listings',
    selectors: {
      listings: '.listing-tile, .property-listing',
      address: '.listing-address',
      price: '.listing-price',
      sqft: '.listing-sqft',
      type: '.listing-type'
    },
    strategy: 'dom'
  }
];

export const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
];
