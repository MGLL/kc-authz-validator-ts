import { Name, Scope } from '../authorization.type';

export interface SimpleResource extends Name {
  _id: string;
}

export interface Resource extends SimpleResource {
  owner: object;
  ownerManagedAccess: boolean;
  displayName: string;
  type: string;
  attributes: object;
  uris: string[];
  scopes: Scope[];
}

export type ResourceReport = {
  name: string;
  displayName: string;
  type: string;
  missingUris: string[];
  missingScopes: string[];
  reportType: ResourceReportType;
};

export type ResourceConfigurationComparisonResult = {
  shouldInclude: boolean;
  missingUris: string[];
  missingScopes: string[];
  reportType: ResourceReportType;
};

export enum ResourceReportType {
  MISSING_RESOURCE = 'MISSING_RESOURCE',
  MISSING_URIS_AND_SCOPE = 'MISSING_URIS_AND_SCOPES',
  MISSING_URIS = 'MISSING_URIS',
  MISSING_SCOPES = 'MISSING_SCOPES',
  EMPTY = '',
}

export type CreateUpdateResource = {
  id?: string;
  process: 'CREATE' | 'UPDATE';
  data: ResourceRequestData;
};

export type ResourceRequestData = {
  name: string;
  displayName: string;
  type: string;
  icon_uri: string;
  ownerManagedAccess: boolean;
  scopes: Scope[];
  uris: string[];
  attributes: object;
}

export interface Resource {
  _id: string;
  name: string;
  displayName: string;
  type: string;
  icon_uri: string;
  ownerManagedAccess: boolean;
  scopes: Scope[];
  uris: string[];
  attributes: object;
}
