// ============================================
// PARCEL / COURIER INTEGRATION STUB
// Providers: Delhivery, BlueDart, FedEx, DHL
// ============================================
// When API is available:
// - Add API keys to .env as PARCEL_API_KEY
// - Replace stub functions with real API calls
// ============================================

const PARCEL_API_URL = process.env.PARCEL_API_URL || 'https://api.delhivery.com';
const PARCEL_API_KEY = process.env.PARCEL_API_KEY || '';

export interface ParcelQuoteRequest {
  originPincode: string;
  destinationPincode: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  parcelCount: number;
  cargoValue: number;
  isDomestic: boolean;
  bookingDate: string;
}

export interface ParcelQuoteResponse {
  provider: string;
  originPincode: string;
  destinationPincode: string;
  price: number;
  currency: string;
  transitDays: number;
  serviceType: string;
  validUntil: string;
}

export interface ParcelBookingRequest {
  quoteId: string;
  originPincode: string;
  destinationPincode: string;
  originAddress: string;
  destinationAddress: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  parcelCount: number;
  cargoValue: number;
  description: string;
  isDomestic: boolean;
  bookingDate: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
  };
}

export interface ParcelBookingResponse {
  bookingId: string;
  awbNumber: string;
  status: string;
  originAddress: string;
  destinationAddress: string;
  provider: string;
  estimatedPickup: string;
  estimatedDelivery: string;
  totalAmount: number;
  trackingUrl: string;
}

export interface ParcelTrackingResponse {
  bookingId: string;
  awbNumber: string;
  provider: string;
  currentLocation: string;
  status: string;
  lastUpdated: string;
  estimatedDelivery: string;
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

export const getParcelQuotes = async (request: ParcelQuoteRequest): Promise<ParcelQuoteResponse[]> => {
  // TODO: Replace with real Delhivery/BlueDart API call
  // const response = await axios.post(`${PARCEL_API_URL}/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${PARCEL_API_KEY}` }
  // });
  // return response.data;

  const volumetricWeight = (request.length * request.width * request.height) / 5000;
  const chargeableWeight = Math.max(request.weight, volumetricWeight);
  const baseRate = 50;

  return [
    {
      provider: 'Delhivery',
      originPincode: request.originPincode,
      destinationPincode: request.destinationPincode,
      price: chargeableWeight * baseRate * request.parcelCount,
      currency: 'INR',
      transitDays: 3,
      serviceType: 'Express',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'BlueDart',
      originPincode: request.originPincode,
      destinationPincode: request.destinationPincode,
      price: chargeableWeight * (baseRate + 10) * request.parcelCount,
      currency: 'INR',
      transitDays: 2,
      serviceType: 'Priority',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'FedEx',
      originPincode: request.originPincode,
      destinationPincode: request.destinationPincode,
      price: chargeableWeight * (baseRate + 20) * request.parcelCount,
      currency: 'INR',
      transitDays: 1,
      serviceType: 'Overnight',
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const createParcelBooking = async (request: ParcelBookingRequest): Promise<ParcelBookingResponse> => {
  // TODO: Replace with real API call
  const volumetricWeight = (request.length * request.width * request.height) / 5000;
  const chargeableWeight = Math.max(request.weight, volumetricWeight);

  return {
    bookingId: `PCL-${Date.now()}`,
    awbNumber: `AWB-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    status: 'confirmed',
    originAddress: request.originAddress,
    destinationAddress: request.destinationAddress,
    provider: 'Delhivery',
    estimatedPickup: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: chargeableWeight * 50 * request.parcelCount,
    trackingUrl: `https://www.delhivery.com/track/package/AWB-${Date.now()}`,
  };
};

export const trackParcel = async (awbNumber: string): Promise<ParcelTrackingResponse> => {
  // TODO: Replace with real API call
  return {
    bookingId: awbNumber,
    awbNumber,
    provider: 'Delhivery',
    currentLocation: 'Bangalore Hub',
    status: 'in_transit',
    lastUpdated: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      {
        location: 'Chennai Facility',
        status: 'picked_up',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        description: 'Parcel picked up from sender',
      },
      {
        location: 'Bangalore Hub',
        status: 'in_transit',
        timestamp: new Date().toISOString(),
        description: 'Parcel arrived at sorting hub',
      },
    ],
  };
};