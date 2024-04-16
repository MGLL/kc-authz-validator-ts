import { DetailedPermission } from '../authorization.type';
import { compareConfiguration, searchMatching } from '../../utils/comparator';
import {
  PermissionConfigurationComparisonResult,
  PermissionReport,
  PermissionReportType,
} from './permission.type';
import { Authorization } from '../authorization';

export const comparePermissions = async (
  source: Authorization,
  target: Authorization,
) => {
  const [sourcePermissions, targetPermissions] = await Promise.all([
    source.permission.getDetailedPermissions(),
    target.permission.getDetailedPermissions(),
  ]);

  const permissionReports: PermissionReport[] = [];
  for (const sourcePermission of sourcePermissions) {
    const targetPermission = searchMatching(
      sourcePermission,
      targetPermissions,
    );
    const hasPermission = targetPermission != undefined;

    const baseReport = {
      name: sourcePermission.name,
      strategy: sourcePermission.decisionStrategy,
    };

    if (hasPermission) {
      const comparisonReport = comparePermissionConfigurations(
        sourcePermission,
        targetPermission,
      );
      if (comparisonReport.shouldInclude) {
        permissionReports.push({
          ...baseReport,
          resources: comparisonReport.resources,
          policies: comparisonReport.policies,
          scopes: sourcePermission.scopes.map((scope) => scope.name),
          reportType: comparisonReport.reportType,
        });
      }
    } else {
      permissionReports.push({
        ...baseReport,
        resources: sourcePermission.resources.map(
          (simpleResource) => simpleResource.name,
        ),
        policies: sourcePermission.policies.map((policy) => policy.name),
        scopes: sourcePermission.scopes.map((scope) => scope.name),
        reportType: PermissionReportType.MISSING_PERMISSION,
      });
    }
  }

  return permissionReports;
};

const comparePermissionConfigurations = (
  source: DetailedPermission,
  target: DetailedPermission,
): PermissionConfigurationComparisonResult => {
  const missingPermissionResources = compareConfiguration(
    source.resources,
    target.resources,
  );
  const missingPermissionPolicies = compareConfiguration(
    source.policies,
    target.policies,
  );

  const hasMissingResources = missingPermissionResources.length != 0;
  const hasMissingPolicies = missingPermissionPolicies.length != 0;

  return {
    resources: missingPermissionResources.map((r) => r.name),
    policies: missingPermissionPolicies.map((p) => p.name),
    reportType: getReportType(hasMissingResources, hasMissingPolicies),
    shouldInclude: hasMissingResources || hasMissingPolicies,
  };
};

const getReportType = (
  hasMissingResources: boolean,
  hasMissingPolicies: boolean,
) => {
  if (hasMissingResources && hasMissingPolicies) {
    return PermissionReportType.MISSING_RESOURCES_AND_POLICIES;
  } else if (hasMissingResources) {
    return PermissionReportType.MISSING_RESOURCES;
  } else if (hasMissingPolicies) {
    return PermissionReportType.MISSING_POLICIES;
  } else {
    return PermissionReportType.EMPTY;
  }
};
