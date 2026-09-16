// Hotel Environment and Test Configuration - Synchronized with Flights URL
import { FLIGHT_ENV_CONFIG } from '../flights/environment.js';

export const HOTEL_ENV_CONFIG = {
  ssoUrl: FLIGHT_ENV_CONFIG.ssoUrl,
  portalBaseUrl: FLIGHT_ENV_CONFIG.portalBaseUrl,
  timeout: 30000,
};

// Default hotel search parameters
export const HOTEL_SEARCH_DEFAULTS = {
  destinationCity: 'Goa',
  checkInDayOffset: 15,   // days from today
  checkOutDayOffset: 17,  // days from today (2-night stay)
  rooms: 1,
  adults: 2,
  children: 0,
  nationality: 'Indian',
};
