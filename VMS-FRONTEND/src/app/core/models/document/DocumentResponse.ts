export type NdaStatus = 'ACTIVE' | 'EXPIRED' | 'SUPERSEDED';

export interface DocumentResponse {
  documentId: string;
  documentPath: string;
  documentType:String;
  createdAt: string | null;
  effective_validity: string | null;
  validUntil: string | null;
  overwrittenBy: string | null;
  status: NdaStatus | null;
}