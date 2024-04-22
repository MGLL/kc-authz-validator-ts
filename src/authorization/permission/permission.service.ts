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

        const currentScopes = targetPermission.scopes;
        const missingScopes = target!.scopes!.filter((s) =>
            comparisonReport.scopes.includes(s.name),
        );
        const newScopes = currentScopes.concat(missingScopes);

        const currentResources = targetPermission.resources;
        const missingResources = target!.resources!.filter((r) =>
            comparisonReport.resources.includes(r.name),
        );
        const newResources = currentResources.concat(missingResources);

        const currentPolicies = targetPermission.policies;
        const missingPolicies = target!.policies!.filter((p) =>
            comparisonReport.policies.includes(p.name),
        );
        const newPolicies = currentPolicies.concat(missingPolicies);


        dataToSynchronize.push({
          type: 'UPDATE',
          name: targetPermission.name,
          description: targetPermission.description,
          decisionStrategy: targetPermission.decisionStrategy,
          resources: newResources.map(r => r._id),
          policies: newPolicies.map(p => p.id),
          scopes: newScopes.map(s => s.id),
        });

        permissionReports.push({
          ...baseReport,
          resources: comparisonReport.resources,
          policies: comparisonReport.policies,
          scopes: comparisonReport.scopes,
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
        reportType: [PermissionReportType.MISSING_PERMISSION],
      });

      dataToSynchronize.push({
        type: 'CREATE',
        name: sourcePermission.name,
        description: sourcePermission.description,
        decisionStrategy: sourcePermission.decisionStrategy,
        resources: target
          .resources!.filter((tr) =>
            sourcePermission.resources.map((sr) => sr.name).includes(tr.name)
          )
          .map((r) => r._id),
        policies: target.policies!.filter((tp) =>
          sourcePermission.policies.map((sp) => sp.name).includes(tp.name)
        ).map((p) => p.id),
        scopes: target.scopes!.filter((t) =>
          sourcePermission.scopes.map((s) => s.name).includes(t.name)
        ).map((s) => s.id),
      });
    }
  }

  return {report: permissionReports, data: dataToSynchronize};
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

  const missingPermissionScopes = compareConfiguration(
      source.scopes,
      target.scopes
  );
  const hasMissingScopes = missingPermissionScopes.length != 0;

  return {
    resources: missingPermissionResources.map((r) => r.name),
    policies: missingPermissionPolicies.map((p) => p.name),
    scopes: missingPermissionScopes.map((s) => s.name),
    reportType: getReportType(hasMissingResources, hasMissingPolicies, hasMissingScopes),
    shouldInclude: hasMissingResources || hasMissingPolicies || hasMissingScopes,
  };
};

const getReportType = (
  hasMissingResources: boolean,
  hasMissingPolicies: boolean,
  hasMissingScopes: boolean
) => {
  const missingElements = [];

  if (hasMissingScopes) {
    missingElements.push(PermissionReportType.MISSING_SCOPES);
  }

  if (hasMissingResources) {
    missingElements.push(PermissionReportType.MISSING_RESOURCES)
  }

  if (hasMissingPolicies) {
    missingElements.push(PermissionReportType.MISSING_POLICIES)
  }

  return missingElements;
};

export const synchronizePermissions = async (
  permissions: CreateUpdatePermission[],
  target: Authorization,
) => {
  for (const permission of permissions) {
    const data = {
      ...permission
    };
    delete data.type;

    if (permission.type === 'CREATE') {
      await target.permissionManager.createPermission(data);
    } else {
      await target.permissionManager.updatePermission('', data);
    }
  }
};
