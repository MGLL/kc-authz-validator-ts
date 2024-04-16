export type PermissionReport = {
  name: string;
  resources: string[];
  policies: string[];
  scopes: string[];
  strategy: string;
  reportType: PermissionReportType;
};

export type PermissionConfigurationComparisonResult = {
  resources: string[];
  policies: string[];
  shouldInclude: boolean;
  reportType: PermissionReportType;
};

export enum PermissionReportType {
  MISSING_PERMISSION = 'MISSING_PERMISSION',
  MISSING_RESOURCES_AND_POLICIES = 'MISSING_RESOURCES_AND_POLICIES',
  MISSING_RESOURCES = 'MISSING_RESOURCES',
  MISSING_POLICIES = 'MISSING_POLICIES',
  EMPTY = '',
}
