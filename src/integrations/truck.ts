// ============================================
// TRUCK / ROAD FREIGHT INTEGRATION STUB
// Providers: BlackBuck, Porter, TCI, GATI etc.
// ============================================
// When API is available:
// - Add API keys to .env
// - Replace stub functions with real API calls
// ============================================

const TRUCK_API_URL = process.env.TRUCK_API_URL || 'https://api.blackbuck.com';
const TRUCK_API_KEY = process.env.TRUCK_API_KEY || '';

export interface TruckQuoteRequest {
  originPincode: string;
  destinationPincode: string;
  weight: number;
  loadType: 'FTL' | 'PTL';
  truckType: string;
  numberOfTrucks: number;
  cargoType: string;
  bookingDate: string;
  hazardous: boolean;
}

export interface TruckQuoteResponse {
  provider: string;
  originPincode: string;
  destinationPincode: string;
  price: number;
  currency: string;
  transitDays: number;
  truckType: string;
  validUntil: string;
}

export interface TruckBookingRequest {
  quoteId: string;
  originPincode: string;
  destinationPincode: string;
  originAddress: string;
  destinationAddress: string;
  weight: number;
  loadType: 'FTL' | 'PTL';
  truckType: string;
  numberOfTrucks: number;
  cargoType: string;
  bookingDate: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    gstin: string;
  };
}

export interface TruckBookingResponse {
  bookingId: string;
  lrNumber: string;
  status: string;
  originAddress: string;
  destinationAddress: string;
  truckNumber: string;
  driverName: string;
  driverMobile: string;
  estimatedPickup: string;
  estimatedDelivery: string;
  totalAmount: number;
}

export interface TruckTrackingResponse {
  bookingId: string;
  lrNumber: string;
  truckNumber: string;
  driverName: string;
  driverMobile: string;
  currentLocation: string;
  currentCoordinates: { lat: number; lng: number };
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

export const getTruckQuotes = async (request: TruckQuoteRequest): Promise<TruckQuoteResponse[]> => {
  // TODO: Replace with real BlackBuck/Porter API call
  // const response = await axios.post(`${TRUCK_API_URL}/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${TRUCK_API_KEY}` }
  // });
  // return response.data;

  return [
    {
      provider: 'BlackBuck',
      originPincode: request.originPincode,
      destinationPincode: request.destinationPincode,
      price: 18000,
      currency: 'INR',
      transitDays: 2,
      truckType: request.truckType || '20ft Container',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'TCI',
      originPincode: request.originPincode,
      destinationPincode: request.destinationPincode,
      price: 16500,
      currency: 'INR',
      transitDays: 3,
      truckType: request.truckType || '20ft Container',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'GATI',
      originPincode: request.originPincode,
      destinationPincode: request.destinationPincode,
      price: 15000,
      currency: 'INR',
      transitDays: 4,
      truckType: request.truckType || '20ft Container',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const createTruckBooking = async (request: TruckBookingRequest): Promise<TruckBookingResponse> => {
  // TODO: Replace with real API call
  return {
    bookingId: `TRK-${Date.now()}`,
    lrNumber: `LR-${Math.floor(Math.random() * 900000) + 100000}`,
    status: 'confirmed',
    originAddress: request.originAddress,
    destinationAddress: request.destinationAddress,
    truckNumber: 'TN-01-AB-1234',
    driverName: 'Ramesh Kumar',
    driverMobile: '+91-9876543210',
    estimatedPickup: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 18000,
  };
};

export const trackTruckShipment = async (lrNumber: string): Promise<TruckTrackingResponse> => {
  // TODO: Replace with real API call
  return {
    bookingId: lrNumber,
    lrNumber,
    truckNumber: 'TN-01-AB-1234',
    driverName: 'Ramesh Kumar',
    driverMobile: '+91-9876543210',
    currentLocation: 'Bangalore Toll',
    currentCoordinates: { lat: 12.9716, lng: 77.5946 },
    status: 'in_transit',
    lastUpdated: new Date().toISOString(),
    events: [
      {
        location: 'Chennai Warehouse',
        status: 'picked_up',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        description: 'Cargo picked up from origin',
      },
      {
        location: 'Bangalore Toll',
        status: 'in_transit',
        timestamp: new Date().toISOString(),
        description: 'Truck in transit',
      },
    ],
  };
};