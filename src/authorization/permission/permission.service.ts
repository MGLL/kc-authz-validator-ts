import { DetailedPermission } from '../authorization.type';
import { compareConfiguration, searchMatching } from '../../utils/comparator';
import {
  CreateUpdatePermission,
  PermissionConfigurationComparisonResult,
  PermissionReport,
  PermissionReportType,
} from './permission.type';
import { Authorization } from '../authorization';
import assert from 'node:assert';

export const comparePermissions = async (
  source: Authorization,
  target: Authorization,
) => {
  assert(source.resources !== undefined);
  assert(target.resources !== undefined);
  const [sourcePermissions, targetPermissions] = await getPermissions(
    source,
    target,
  );
  assert(sourcePermissions !== undefined);
  assert(targetPermissions !== undefined);

  const permissionReports: PermissionReport[] = [];
  const dataToSynchronize: CreateUpdatePermission[] = [];

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
        // todo dataToSynchronize
        permissionReports.push({
          ...baseReport,
          resources: comparisonReport.resources,
          policies: comparisonReport.policies,
          scopes: sourcePermission.scopes.map((scope) => scope.name),
          reportType: comparisonReport.reportType,
        });
      }
    } else {
      // todo dataToSynchronize
      permissionReports.push({
        ...baseReport,
        resources: sourcePermission.resources.map(
          (simpleResource) => simpleResource.name,
        ),
        policies: sourcePermission.policies.map((policy) => policy.name),
        scopes: sourcePermission.scopes.map((scope) => scope.name),
        reportType: PermissionReportType.MISSING_PERMISSION,
      });

      dataToSynchronize.push({
        name: sourcePermission.name,
        description: sourcePermission.description,
        decisionStrategy: sourcePermission.decisionStrategy,
        resources: target
          .resources!.filter((tp) => {
            sourcePermission.resources.map((sp) => sp.name).includes(tp.name);
          })
          .map((r) => r._id),
        policies: [],
        scopes: [],
      });
    }
  }

  return permissionReports;
};

const getPermissions = async (source: Authorization, target: Authorization) => {
  if (source.permissions === undefined && target.permissions === undefined) {
    return await Promise.all([
      source.getPermissions(),
      target.getPermissions(),
    ]);
  } else if (target.permissions === undefined) {
    return [source.permissions, await target.getPermissions()];
  } else {
    return [await source.getPermissions(), target.permissions];
  }
};

const comparePermissionConfigurations = (
  source: DetailedPermission,
  target: DetailedPermission,
): PermissionConfigurationComparisonResult => {
  const missingPermissionResources = compareConfiguration(
    source.resources,
    target.resources,
  );
  const hasMissingResources = missingPermissionResources.length != 0;

  const missingPermissionPolicies = compareConfiguration(
    source.policies,
    target.policies,
  );
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

export const synchronizePermissions = async (
  reports: PermissionReport[],
  target: Authorization,
) => {
  for (const report of reports) {
    const data = {
      name: '',
      description: '',
      decisionStrategy: '',
      resources: [],
      policies: [],
      scopes: [],
    };

    if (report.reportType == PermissionReportType.MISSING_PERMISSION) {
      await target.permissionManager.createPermission(data);
    } else {
      await target.permissionManager.updatePermission('', data);
    }
  }
};
