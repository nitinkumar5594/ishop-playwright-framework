// @ts-check
/**
 * iShop Environment and Test Configuration
 * Re-exports unified multi-environment configuration (UAT, Preprod, Prod)
 */
import { FLIGHT_ENV_CONFIG, ENVIRONMENTS, ACTIVE_ENV } from '../flights/environment.js';

export const ISHOP_ENV_CONFIG = FLIGHT_ENV_CONFIG;
export { ENVIRONMENTS, ACTIVE_ENV };

export const ISHOP_TRAVEL_TYPES = [
  'Flights',
  'Hotels',
  'Bus'
];
