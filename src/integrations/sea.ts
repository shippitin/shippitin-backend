// ============================================
// SEA FREIGHT INTEGRATION STUB
// Shipping Lines: Maersk, MSC, CMA CGM etc.
// ============================================
// When API is available:
// - Add API keys to .env
// - Replace stub functions with real API calls
// ============================================

const SEA_API_URL = process.env.SEA_API_URL || 'https://api.maersk.com';
const SEA_API_KEY = process.env.SEA_API_KEY || '';

export interface SeaQuoteRequest {
  originPort: string;
  destinationPort: string;
  containerType: string;
  numberOfContainers: number;
  weight: number;
  cargoType: string;
  shipmentMode: 'FCL' | 'LCL';
  bookingDate: string;
  hazardous: boolean;
}

export interface SeaQuoteResponse {
  provider: string;
  originPort: string;
  destinationPort: string;
  price: number;
  currency: string;
  transitDays: number;
  vesselName: string;
  departureDate: string;
  arrivalDate: string;
  validUntil: string;
}

export interface SeaBookingRequest {
  quoteId: string;
  originPort: string;
  destinationPort: string;
  containerType: string;
  numberOfContainers: number;
  weight: number;
  cargoType: string;
  bookingDate: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    gstin: string;
  };
}

export interface SeaBookingResponse {
  bookingId: string;
  billOfLadingNumber: string;
  status: string;
  originPort: string;
  destinationPort: string;
  vesselName: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  totalAmount: number;
}

export interface SeaTrackingResponse {
  bookingId: string;
  billOfLadingNumber: string;
  vesselName: string;
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

export const getSeaQuotes = async (request: SeaQuoteRequest): Promise<SeaQuoteResponse[]> => {
  // TODO: Replace with real Maersk/MSC/CMA CGM API call
  // const response = await axios.post(`${SEA_API_URL}/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${SEA_API_KEY}` }
  // });
  // return response.data;

  return [
    {
      provider: 'Maersk',
      originPort: request.originPort,
      destinationPort: request.destinationPort,
      price: 125000,
      currency: 'INR',
      transitDays: 14,
      vesselName: 'Maersk Sentosa',
      departureDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'MSC',
      originPort: request.originPort,
      destinationPort: request.destinationPort,
      price: 115000,
      currency: 'INR',
      transitDays: 16,
      vesselName: 'MSC Lucia',
      departureDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const createSeaBooking = async (request: SeaBookingRequest): Promise<SeaBookingResponse> => {
  // TODO: Replace with real API call
  return {
    bookingId: `SEA-${Date.now()}`,
    billOfLadingNumber: `BL-${Math.floor(Math.random() * 900000) + 100000}`,
    status: 'confirmed',
    originPort: request.originPort,
    destinationPort: request.destinationPort,
    vesselName: 'Maersk Sentosa',
    estimatedDeparture: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedArrival: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 125000,
  };
};

export const trackSeaShipment = async (billOfLadingNumber: string): Promise<SeaTrackingResponse> => {
  // TODO: Replace with real API call
  return {
    bookingId: billOfLadingNumber,
    billOfLadingNumber,
    vesselName: 'Maersk Sentosa',
    currentLocation: 'Singapore Port',
    status: 'at_sea',
    lastUpdated: new Date().toISOString(),
    events: [
      {
        location: 'Mumbai Port',
        status: 'departed',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Vessel departed from origin port',
      },
      {
        location: 'Singapore Port',
        status: 'transshipment',
        timestamp: new Date().toISOString(),
        description: 'Vessel at transshipment port',
      },
    ],
  };
};

export const getSeaPorts = async (): Promise<{ code: string; name: string; city: string; country: string }[]> => {
  // TODO: Replace with real API call
  return [
    { code: 'INNSA', name: 'Nhava Sheva (JNPT)', city: 'Mumbai', country: 'India' },
    { code: 'INMAA', name: 'Chennai Port', city: 'Chennai', country: 'India' },
    { code: 'INCCU', name: 'Kolkata Port', city: 'Kolkata', country: 'India' },
    { code: 'INPAV', name: 'Pipavav Port', city: 'Pipavav', country: 'India' },
    { code: 'SGSIN', name: 'Singapore Port', city: 'Singapore', country: 'Singapore' },
    { code: 'CNSHA', name: 'Shanghai Port', city: 'Shanghai', country: 'China' },
    { code: 'AEJEA', name: 'Jebel Ali Port', city: 'Dubai', country: 'UAE' },
  ];
};