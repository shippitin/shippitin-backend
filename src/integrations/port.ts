// ============================================
// PORT SERVICES INTEGRATION STUB
// Major Ports: JNPT, Chennai, Vizag etc.
// ============================================
// When API is available:
// - Add API keys to .env as PORT_API_KEY
// - Replace stub functions with real API calls
// ============================================

const PORT_API_URL = process.env.PORT_API_URL || 'https://api.jnport.gov.in';
const PORT_API_KEY = process.env.PORT_API_KEY || '';

export interface PortServiceRequest {
  portCode: string;
  serviceCategory: 'stevedoring' | 'storage' | 'bunkering' | 'pilotage' | 'tug' | 'mooring';
  vesselName: string;
  vesselType: string;
  grt: number;
  arrivalDate: string;
  departureDate: string;
  cargoType?: string;
  cargoWeight?: number;
}

export interface PortServiceQuoteResponse {
  provider: string;
  portCode: string;
  portName: string;
  serviceCategory: string;
  charges: {
    portDues: number;
    pilotage: number;
    tugCharges: number;
    berthingCharges: number;
    storageCharges: number;
    miscCharges: number;
  };
  totalAmount: number;
  currency: string;
  validUntil: string;
}

export interface PortBookingRequest {
  portCode: string;
  serviceCategory: string;
  vesselName: string;
  vesselType: string;
  grt: number;
  arrivalDate: string;
  departureDate: string;
  cargoType?: string;
  cargoWeight?: number;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    gstin: string;
  };
}

export interface PortBookingResponse {
  bookingId: string;
  portCallNumber: string;
  status: string;
  portCode: string;
  portName: string;
  vesselName: string;
  berthNumber: string;
  estimatedArrival: string;
  estimatedDeparture: string;
  totalAmount: number;
}

export interface PortStatusResponse {
  bookingId: string;
  portCallNumber: string;
  vesselName: string;
  berthNumber: string;
  status: string;
  currentStage: string;
  lastUpdated: string;
  events: {
    stage: string;
    status: string;
    timestamp: string;
    remarks: string;
  }[];
}

// ============================================
// STUB FUNCTIONS — Replace with real API calls
// ============================================

export const getPortServiceQuote = async (request: PortServiceRequest): Promise<PortServiceQuoteResponse> => {
  // TODO: Replace with real Port API call
  // const response = await axios.post(`${PORT_API_URL}/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${PORT_API_KEY}` }
  // });
  // return response.data;

  return {
    provider: 'JNPT',
    portCode: request.portCode,
    portName: 'Jawaharlal Nehru Port Trust',
    serviceCategory: request.serviceCategory,
    charges: {
      portDues: 25000,
      pilotage: 15000,
      tugCharges: 12000,
      berthingCharges: 8000,
      storageCharges: 5000,
      miscCharges: 2000,
    },
    totalAmount: 67000,
    currency: 'INR',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const createPortBooking = async (request: PortBookingRequest): Promise<PortBookingResponse> => {
  // TODO: Replace with real Port API call
  return {
    bookingId: `PORT-${Date.now()}`,
    portCallNumber: `PCN-${Math.floor(Math.random() * 900000) + 100000}`,
    status: 'confirmed',
    portCode: request.portCode,
    portName: 'Jawaharlal Nehru Port Trust',
    vesselName: request.vesselName,
    berthNumber: 'Berth-12A',
    estimatedArrival: request.arrivalDate,
    estimatedDeparture: request.departureDate,
    totalAmount: 67000,
  };
};

export const getPortStatus = async (portCallNumber: string): Promise<PortStatusResponse> => {
  // TODO: Replace with real Port API call
  return {
    bookingId: portCallNumber,
    portCallNumber,
    vesselName: 'MV Chennai Express',
    berthNumber: 'Berth-12A',
    status: 'at_berth',
    currentStage: 'Loading Operations',
    lastUpdated: new Date().toISOString(),
    events: [
      {
        stage: 'Arrival',
        status: 'completed',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        remarks: 'Vessel arrived at anchorage',
      },
      {
        stage: 'Berthing',
        status: 'completed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        remarks: 'Vessel berthed at Berth-12A',
      },
      {
        stage: 'Loading Operations',
        status: 'in_progress',
        timestamp: new Date().toISOString(),
        remarks: 'Loading operations in progress',
      },
    ],
  };
};

export const getPorts = async (): Promise<{ code: string; name: string; city: string; state: string }[]> => {
  // TODO: Replace with real API call
  return [
    { code: 'INJNP', name: 'Jawaharlal Nehru Port (JNPT)', city: 'Mumbai', state: 'Maharashtra' },
    { code: 'INMAA', name: 'Chennai Port', city: 'Chennai', state: 'Tamil Nadu' },
    { code: 'INVTZ', name: 'Visakhapatnam Port', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { code: 'INCCU', name: 'Kolkata Port', city: 'Kolkata', state: 'West Bengal' },
    { code: 'INKOC', name: 'Kochi Port', city: 'Kochi', state: 'Kerala' },
    { code: 'INPAV', name: 'Pipavav Port', city: 'Amreli', state: 'Gujarat' },
    { code: 'INMUN', name: 'Mumbai Port', city: 'Mumbai', state: 'Maharashtra' },
  ];
};