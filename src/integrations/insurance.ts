// ============================================
// CARGO INSURANCE INTEGRATION STUB
// Providers: New India, ICICI Lombard, Bajaj etc.
// ============================================
// When API is available:
// - Add API keys to .env as INSURANCE_API_KEY
// - Replace stub functions with real API calls
// ============================================

const INSURANCE_API_URL = process.env.INSURANCE_API_URL || 'https://api.newindia.co.in';
const INSURANCE_API_KEY = process.env.INSURANCE_API_KEY || '';

export interface InsuranceQuoteRequest {
  cargoValue: number;
  cargoType: string;
  origin: string;
  destination: string;
  modeOfTransport: 'rail' | 'sea' | 'air' | 'road';
  policyType: 'single' | 'open';
  startDate: string;
  endDate: string;
  hazardous: boolean;
}

export interface InsuranceQuoteResponse {
  provider: string;
  policyType: string;
  cargoValue: number;
  premiumAmount: number;
  coverageAmount: number;
  currency: string;
  coverageDetails: string[];
  validUntil: string;
}

export interface InsurancePolicyRequest {
  quoteId: string;
  cargoValue: number;
  cargoType: string;
  origin: string;
  destination: string;
  modeOfTransport: string;
  policyType: string;
  startDate: string;
  endDate: string;
  hazardous: boolean;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    gstin: string;
    pan: string;
  };
}

export interface InsurancePolicyResponse {
  policyId: string;
  policyNumber: string;
  status: string;
  provider: string;
  cargoValue: number;
  premiumAmount: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  certificateUrl: string;
}

export interface ClaimRequest {
  policyNumber: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  claimAmount: number;
  documents: string[];
}

export interface ClaimResponse {
  claimId: string;
  claimNumber: string;
  status: string;
  policyNumber: string;
  claimAmount: number;
  estimatedSettlementDate: string;
}

// ============================================
// STUB FUNCTIONS — Replace with real API calls
// ============================================

export const getInsuranceQuotes = async (request: InsuranceQuoteRequest): Promise<InsuranceQuoteResponse[]> => {
  // TODO: Replace with real Insurance API call
  // const response = await axios.post(`${INSURANCE_API_URL}/quotes`, request, {
  //   headers: { 'Authorization': `Bearer ${INSURANCE_API_KEY}` }
  // });
  // return response.data;

  const premiumRate = request.hazardous ? 0.025 : 0.015;

  return [
    {
      provider: 'New India Assurance',
      policyType: request.policyType,
      cargoValue: request.cargoValue,
      premiumAmount: request.cargoValue * premiumRate,
      coverageAmount: request.cargoValue * 1.1,
      currency: 'INR',
      coverageDetails: [
        'All risk coverage',
        'Fire and explosion',
        'Theft and pilferage',
        'Water damage',
        'Natural disasters',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'ICICI Lombard',
      policyType: request.policyType,
      cargoValue: request.cargoValue,
      premiumAmount: request.cargoValue * (premiumRate - 0.002),
      coverageAmount: request.cargoValue * 1.1,
      currency: 'INR',
      coverageDetails: [
        'All risk coverage',
        'Fire and explosion',
        'Theft and pilferage',
        'Water damage',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      provider: 'Bajaj Allianz',
      policyType: request.policyType,
      cargoValue: request.cargoValue,
      premiumAmount: request.cargoValue * (premiumRate - 0.003),
      coverageAmount: request.cargoValue,
      currency: 'INR',
      coverageDetails: [
        'Fire and explosion',
        'Theft and pilferage',
        'Water damage',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const createInsurancePolicy = async (request: InsurancePolicyRequest): Promise<InsurancePolicyResponse> => {
  // TODO: Replace with real Insurance API call
  const premiumRate = request.hazardous ? 0.025 : 0.015;

  return {
    policyId: `INS-${Date.now()}`,
    policyNumber: `POL-${Math.floor(Math.random() * 9000000) + 1000000}`,
    status: 'active',
    provider: 'New India Assurance',
    cargoValue: request.cargoValue,
    premiumAmount: request.cargoValue * premiumRate,
    coverageAmount: request.cargoValue * 1.1,
    startDate: request.startDate,
    endDate: request.endDate,
    certificateUrl: `https://certificates.shippitin.co/insurance/POL-${Date.now()}.pdf`,
  };
};

export const fileClaim = async (request: ClaimRequest): Promise<ClaimResponse> => {
  // TODO: Replace with real Insurance API call
  return {
    claimId: `CLM-${Date.now()}`,
    claimNumber: `CLM-${Math.floor(Math.random() * 900000) + 100000}`,
    status: 'filed',
    policyNumber: request.policyNumber,
    claimAmount: request.claimAmount,
    estimatedSettlementDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
};