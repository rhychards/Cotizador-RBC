export type ClientType = 'normal' | 'corporativo';

export type SpecialRequirementMode = 'incluido' | 'cotizado' | 'cliente';

export interface SpecialRequirementItem {
  enabled: boolean;
  mode: SpecialRequirementMode;
  cost: number;
  details: string;
}

export interface SpecialRequirements {
  transporte: SpecialRequirementItem;
  viaticos: SpecialRequirementItem;
  alimentacion: SpecialRequirementItem;
  hospedaje: SpecialRequirementItem;
  otros: SpecialRequirementItem;
}

export type InternetServiceType = 'cliente' | 'cotizar' | 'no_requerido';

export interface InternetServiceConfig {
  type: InternetServiceType;
  technicalSpecs: string;
  cost: number;
}

export interface QuotationItem {
  id: string;
  serviceName: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface ClientInfo {
  type: ClientType;
  companyName: string;
  contactName: string;
  docId: string; // Cédula o RUC
  phone: string;
  email: string;
  address?: string;
  logoUrl?: string;
}

export interface BankAccountDetails {
  bankName: string;
  beneficiaryName: string;
  accountType: string;
  accountNumber: string;
  email: string;
  idNumber: string;
}

export interface CompanyInfo {
  name: string;
  tradeName: string;
  representativeName?: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoUrl?: string;
  bankDetails?: string;
  bankAccount?: BankAccountDetails;
}

export interface DigitalSignature {
  name: string;
  titleOrRole: string;
  idNumber?: string;
  signatureImage?: string; // base64 data url
  signedAt?: string;
  approved?: boolean;
}

export type QuotationStatus = 'borrador' | 'enviada' | 'firmada' | 'aprobada' | 'rechazada' | 'facturada';

export interface SignedDocumentInfo {
  fileName: string;
  fileSize: number;
  fileDataUrl?: string; // base64 representation of the signed PDF
  uploadedAt: string;
  signedBy: string;
  notes?: string;
  driveFileId?: string;
  driveLink?: string;
  driveUrl?: string;
}

export interface Quotation {
  id: string;
  code: string; // ej: COT-RBC-2026-001
  date: string; // YYYY-MM-DD
  validityDays: 10 | 30 | 45 | 60;
  expiryDate: string;
  client: ClientInfo;
  items: QuotationItem[];
  internetService: InternetServiceConfig;
  specialRequirements: SpecialRequirements;
  generalNotes: string;
  paymentTerms: string;
  taxRate: number; // e.g. 15 for Ecuador
  discountPercentage: number;
  status: QuotationStatus;
  issuerSignature: DigitalSignature;
  clientSignature?: DigitalSignature;
  firmaEcEnabled?: boolean;
  signedDocument?: SignedDocumentInfo;
  bankAccount?: BankAccountDetails;
  createdAt: string;
  updatedAt: string;
}
