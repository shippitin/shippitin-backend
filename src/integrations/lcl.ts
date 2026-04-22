// ============================================
// LCL (Less than Container Load) INTEGRATION STUB
// Providers: Flexport, Freight Tiger, etc.
// ============================================
// When API is available:
// - Add API keys to .env as LCL_API_KEY
// - Replace stub functions with real API calls
// ============================================

const LCL_API_URL = process.env.LCL_API_URL || 'https://api.freighttiger.com';
const LCL_API_KEY = process.env.LCL_API_KEY || '';

export interface LCLQuoteRequest {
  originPort: string;
  destinationPort: string;
  weight: number;
  volume: number;
  numberOfPackages: number;
  cargoType: string;
  bookingDate: string;
  hazardous: boolean;
  cargoValue: number;
}

export interface LCLQuoteResponse {
  provider: string;
  originPort: string;
  destinationPort: string;
  price: number;
  currency: string;
  transitDays: number;
  consolidationPoint: string;
  departureDate: string;
  arrivalDate: string;
  validUntil: string;
}

export interface LCLBookingRequest {
  quoteId: string;
  originPort: string;
  destinationPort: string;
  weight: number;
  volume: number;
  numberOfPackages: number;
  cargoType: string;
  bookingDate: string;
  hazardous: boolean;
  cargoValue: number;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    gstin: string;
  };
}

export interface LCLBookingResponse {
  bookingId: string;
  hblNumber: string;
  mblNumber: string;
  status: string;
  originPort: string;
  destinationPort: string;
  consolidationPoint: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  totalAmount: number;
}

export interface LCLTrackingResponse {
  bookingId: string;
  hblNumber: string;
  mblNumber: string;
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

export const getLCLQuotes = async (request: LCLQuoteRequest): Promise<LCLQuoteResponse[]> => {
  // TODO: Replace with real LCL API call
  // const response = await axios.post(`${LCL_API_URL}/lcl/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${LCL_API_KEY}` }
  // });
  // return response.data;

  const pricePerCBM = 8500;

  return [
    {
      provider: 'Freight Tiger',
      originPort: request.originPort,
      destinationPort: request.destinationPort,
      price: request.volume * pricePerCBM,
      currency: 'INR',
      transitDays: 18,
      consolidationPoint: 'JNPT Consolidation Hub',
      departureDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'Flexport',
      originPort: request.originPort,
      destinationPort: request.destinationPort,
      price: request.volume * (pricePerCBM - 500),
      currency: 'INR',
      transitDays: 21,
      consolidationPoint: 'Chennai Consolidation Hub',
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const createLCLBooking = async (request: LCLBookingRequest): Promise<LCLBookingResponse> => {
  // TODO: Replace with real LCL API call
  return {
    bookingId: `LCL-${Date.now()}`,
    hblNumber: `HBL-${Math.floor(Math.random() * 900000) + 100000}`,
    mblNumber: `MBL-${Math.floor(Math.random() * 900000) + 100000}`,
    status: 'confirmed',
    originPort: request.originPort,
    destinationPort: request.destinationPort,
    consolidationPoint: 'JNPT Consolidation Hub',
    estimatedDeparture: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedArrival: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: request.volume * 8500,
  };
};

export const trackLCLShipment = async (hblNumber: string): Promise<LCLTrackingResponse> => {
  // TODO: Replace with real LCL API call
  return {
    bookingId: hblNumber,
    hblNumber,
    mblNumber: `MBL-${Math.floor(Math.random() * 900000) + 100000}`,
    currentLocation: 'JNPT Consolidation Hub',
    status: 'consolidating',
    lastUpdated: new Date().toISOString(),
    events: [
      {
        location: 'Origin Warehouse',
        status: 'received',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Cargo received at origin warehouse',
      },
      {
        location: 'JNPT Consolidation Hub',
        status: 'consolidating',
        timestamp: new Date().toISOString(),
        description: 'Cargo being consolidated with other shipments',
      },
    ],
  };
};