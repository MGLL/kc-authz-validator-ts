export type PermissionReport = {
  name: string;
  resources: string[];
  policies: string[];
  scopes: string[];
  strategy: string;
  reportType: PermissionReportType[];
};

export type PermissionConfigurationComparisonResult = {
  resources: string[];
  policies: string[];
  scopes: string[];
  shouldInclude: boolean;
  reportType: PermissionReportType[];
};

export enum PermissionReportType {
  MISSING_PERMISSION = 'MISSING_PERMISSION',
  MISSING_SCOPES = 'MISSING_SCOPES',
  MISSING_RESOURCES = 'MISSING_RESOURCES',
  MISSING_POLICIES = 'MISSING_POLICIES',
  EMPTY = '',
}

export type CreateUpdatePermission = {
  type?: string;
  name: string;
  description: string;
  decisionStrategy: string;
  resources: string[];
  policies: string[];
  scopes: string[];
};
