// ============================================
// CONCOR / RAIL INTEGRATION STUB
// Indian Railways Container Corporation
// ============================================
// When CONCOR API is available:
// - Replace BASE_URL with real API endpoint
// - Add real API key to .env as CONCOR_API_KEY
// - Replace stub functions with real API calls
// ============================================

const CONCOR_API_URL = process.env.CONCOR_API_URL || 'https://api.concor.gov.in';
const CONCOR_API_KEY = process.env.CONCOR_API_KEY || '';

export interface RailQuoteRequest {
  origin: string;
  destination: string;
  containerType: string;
  numberOfContainers: number;
  weight: number;
  cargoType: string;
  serviceType: string;
  isDomestic: boolean;
  bookingDate: string;
}

export interface RailQuoteResponse {
  provider: string;
  origin: string;
  destination: string;
  price: number;
  currency: string;
  transitDays: number;
  serviceType: string;
  availableRakes: number;
  validUntil: string;
}

export interface RailBookingRequest {
  quoteId: string;
  origin: string;
  destination: string;
  containerType: string;
  numberOfContainers: number;
  weight: number;
  cargoType: string;
  serviceType: string;
  bookingDate: string;
  customerDetails: {
    name: string;
    gstin: string;
    email: string;
    mobile: string;
  };
}

export interface RailBookingResponse {
  bookingId: string;
  indentNumber: string;
  status: string;
  origin: string;
  destination: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  totalAmount: number;
}

export interface RailTrackingResponse {
  bookingId: string;
  indentNumber: string;
  currentLocation: string;
  status: string;
  lastUpdated: string;
  events: {
    location: string;
    status: string;
    timestamp: string;
    description: string;
  }[];
}

// ============================================
// STUB FUNCTIONS — Replace with real API calls
// ============================================

export const getRailQuotes = async (request: RailQuoteRequest): Promise<RailQuoteResponse[]> => {
  // TODO: Replace with real CONCOR API call
  // const response = await axios.post(`${CONCOR_API_URL}/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${CONCOR_API_KEY}` }
  // });
  // return response.data;

  return [
    {
      provider: 'CONCOR',
      origin: request.origin,
      destination: request.destination,
      price: 62500,
      currency: 'INR',
      transitDays: 3,
      serviceType: request.serviceType,
      availableRakes: 5,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'CONCOR',
      origin: request.origin,
      destination: request.destination,
      price: 50000,
      currency: 'INR',
      transitDays: 5,
      serviceType: request.serviceType,
      availableRakes: 10,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const createRailBooking = async (request: RailBookingRequest): Promise<RailBookingResponse> => {
  // TODO: Replace with real CONCOR API call
  // const response = await axios.post(`${CONCOR_API_URL}/bookings`, request, {
  //   headers: { 'Authorization': `Bearer ${CONCOR_API_KEY}` }
  // });
  // return response.data;

  return {
    bookingId: `CONCOR-${Date.now()}`,
    indentNumber: `IND-${Math.floor(Math.random() * 900000) + 100000}`,
    status: 'confirmed',
    origin: request.origin,
    destination: request.destination,
    estimatedDeparture: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedArrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 62500,
  };
};

export const trackRailShipment = async (indentNumber: string): Promise<RailTrackingResponse> => {
  // TODO: Replace with real FOIS/CRIS API call
  // const response = await axios.get(`${CONCOR_API_URL}/tracking/${indentNumber}`, {
  //   headers: { 'Authorization': `Bearer ${CONCOR_API_KEY}` }
  // });
  // return response.data;

  return {
    bookingId: indentNumber,
    indentNumber,
    currentLocation: 'Nagpur Junction',
    status: 'in_transit',
    lastUpdated: new Date().toISOString(),
    events: [
      {
        location: 'Chennai ICD',
        status: 'departed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Shipment departed from origin terminal',
      },
      {
        location: 'Nagpur Junction',
        status: 'in_transit',
        timestamp: new Date().toISOString(),
        description: 'Shipment in transit',
      },
    ],
  };
};

export const getTerminals = async (): Promise<{ code: string; name: string; city: string; state: string }[]> => {
  // TODO: Replace with real CONCOR API call
  return [
    { code: 'INMAA', name: 'Chennai ICD', city: 'Chennai', state: 'Tamil Nadu' },
    { code: 'INDEL', name: 'Tughlakabad ICD', city: 'New Delhi', state: 'Delhi' },
    { code: 'INMUM', name: 'Mumbai ICD', city: 'Mumbai', state: 'Maharashtra' },
    { code: 'INHYD', name: 'Hyderabad ICD', city: 'Hyderabad', state: 'Telangana' },
    { code: 'INBLR', name: 'Bangalore ICD', city: 'Bangalore', state: 'Karnataka' },
    { code: 'INKOL', name: 'Kolkata ICD', city: 'Kolkata', state: 'West Bengal' },
  ];
};