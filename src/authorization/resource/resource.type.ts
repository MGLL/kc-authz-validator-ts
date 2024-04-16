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

export type CreateUpdateResource = {
  name: string;
  displayName: string;
  type: string;
  icon_uri: string;
  scopes: Scope[];
  ownerManagedAccess: boolean;
  uris: string[];
  attributes: object;
};

export interface Resource extends CreateUpdateResource {
  _id: string;
}

type TargetResourceSync = {
  id?: string;
  uris: string[];
  scopes: Scope[];
};

export type ResourceReport = {
  name: string;
  displayName: string;
  type: string;
  missingUris: string[];
  missingScopes: string[];
  reportType: ResourceReportType;
  targetDataReference?: TargetResourceSync;
};

export type ResourceConfigurationComparisonResult = {
  shouldInclude: boolean;
  missingUris: string[];
  missingScopes: string[];
  reportType: ResourceReportType;
  targetDataReference: TargetResourceSync;
};

export enum ResourceReportType {
  MISSING_RESOURCE = 'MISSING_RESOURCE',
  MISSING_URIS_AND_SCOPE = 'MISSING_URIS_AND_SCOPES',
  MISSING_URIS = 'MISSING_URIS',
  MISSING_SCOPES = 'MISSING_SCOPES',
  EMPTY = '',
}
