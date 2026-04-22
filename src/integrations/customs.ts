// ============================================
// CUSTOMS INTEGRATION STUB
// ICEGATE / CBIC India
// ============================================
// When API is available:
// - Add API keys to .env as ICEGATE_API_KEY
// - Replace stub functions with real API calls
// ============================================

const ICEGATE_API_URL = process.env.ICEGATE_API_URL || 'https://api.icegate.gov.in';
const ICEGATE_API_KEY = process.env.ICEGATE_API_KEY || '';

export interface CustomsQuoteRequest {
  serviceType: 'import' | 'export' | 'transit';
  cargoType: string;
  cargoValue: number;
  weight: number;
  hsCode: string;
  countryOfOrigin: string;
  portOfEntry: string;
  incoterms: string;
}

export interface CustomsQuoteResponse {
  provider: string;
  serviceType: string;
  estimatedDuty: number;
  customsFee: number;
  chaFee: number;
  totalEstimatedCost: number;
  currency: string;
  processingDays: number;
  validUntil: string;
}

export interface CustomsFilingRequest {
  serviceType: 'import' | 'export' | 'transit';
  cargoType: string;
  cargoValue: number;
  weight: number;
  hsCode: string;
  countryOfOrigin: string;
  portOfEntry: string;
  incoterms: string;
  invoiceNumber: string;
  billOfLadingNumber: string;
  customerDetails: {
    name: string;
    iec: string;
    gstin: string;
    email: string;
    mobile: string;
  };
}

export interface CustomsFilingResponse {
  filingId: string;
  beNumber: string;
  status: string;
  serviceType: string;
  estimatedClearanceDate: string;
  totalDutyAmount: number;
  totalAmount: number;
}

export interface CustomsStatusResponse {
  filingId: string;
  beNumber: string;
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

export const getCustomsQuote = async (request: CustomsQuoteRequest): Promise<CustomsQuoteResponse> => {
  // TODO: Replace with real ICEGATE API call
  // const response = await axios.post(`${ICEGATE_API_URL}/duty-calculator`, request, {
  //   headers: { 'Authorization': `Bearer ${ICEGATE_API_KEY}` }
  // });
  // return response.data;

  const estimatedDuty = request.cargoValue * 0.18;
  const customsFee = 5000;
  const chaFee = 8000;

  return {
    provider: 'ICEGATE',
    serviceType: request.serviceType,
    estimatedDuty,
    customsFee,
    chaFee,
    totalEstimatedCost: estimatedDuty + customsFee + chaFee,
    currency: 'INR',
    processingDays: 3,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const fileCustomsDeclaration = async (request: CustomsFilingRequest): Promise<CustomsFilingResponse> => {
  // TODO: Replace with real ICEGATE API call
  return {
    filingId: `CUS-${Date.now()}`,
    beNumber: `BE-${Math.floor(Math.random() * 9000000) + 1000000}`,
    status: 'filed',
    serviceType: request.serviceType,
    estimatedClearanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalDutyAmount: request.cargoValue * 0.18,
    totalAmount: request.cargoValue * 0.18 + 13000,
  };
};

export const getCustomsStatus = async (beNumber: string): Promise<CustomsStatusResponse> => {
  // TODO: Replace with real ICEGATE API call
  return {
    filingId: beNumber,
    beNumber,
    status: 'under_examination',
    currentStage: 'Document Verification',
    lastUpdated: new Date().toISOString(),
    events: [
      {
        stage: 'Filing',
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        remarks: 'Bill of Entry filed successfully',
      },
      {
        stage: 'Document Verification',
        status: 'in_progress',
        timestamp: new Date().toISOString(),
        remarks: 'Documents under examination',
      },
    ],
  };
};

export const getHSCodeDetails = async (hsCode: string): Promise<{
  hsCode: string;
  description: string;
  basicDutyRate: number;
  igstRate: number;
  cessRate: number;
}> => {
  // TODO: Replace with real ICEGATE API call
  return {
    hsCode,
    description: 'General Merchandise',
    basicDutyRate: 10,
    igstRate: 18,
    cessRate: 0,
  };
};