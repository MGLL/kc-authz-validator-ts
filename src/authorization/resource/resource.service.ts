import { compareConfiguration, searchMatching } from '../../utils/comparator';
import { Authorization } from '../authorization';
import {
  CreateUpdateResource,
  Resource,
  ResourceConfigurationComparisonResult,
  ResourceReport,
  ResourceReportType,
} from './resource.type';
import assert from "node:assert";

export const compareResources = async (
  source: Authorization,
  target: Authorization,
) => {
  const [sourceResources, targetResources] = await getResources(source, target);
  assert(sourceResources !== undefined);
  assert(targetResources !== undefined);

  const resourceReports: ResourceReport[] = [];
  const dataToSynchronize: CreateUpdateResource[] = [];

  for (const sourceResource of sourceResources) {
    const targetResource = searchMatching(sourceResource, targetResources);
    const hasResource = targetResource != undefined;

    const baseReport = {
      name: sourceResource.name,
      displayName: sourceResource.displayName,
      type: sourceResource.type,
    };

    if (hasResource) {
      const comparisonReport = compareResourceConfigurations(
        sourceResource,
        targetResource,
      );

      if (comparisonReport.shouldInclude) {
        const currentScopes = targetResource.scopes;
        const missingScopes = target!.scopes!.filter((s) =>
            comparisonReport.missingScopes.includes(s.name),
        );
        const newScopes = currentScopes.concat(missingScopes);

        dataToSynchronize.push({
          id: targetResource._id,
          process: 'UPDATE',
          data: {
            type: sourceResource.type,
            name: sourceResource.name,
            displayName: sourceResource.displayName,
            icon_uri: sourceResource.icon_uri,
            ownerManagedAccess: sourceResource.ownerManagedAccess,
            scopes: newScopes,
            uris: sourceResource.uris,
            attributes: sourceResource.attributes
          }
        });

        resourceReports.push({
          ...baseReport,
          missingUris: comparisonReport.missingUris,
          missingScopes: comparisonReport.missingScopes,
          reportType: comparisonReport.reportType,
        });
      }
    } else {
      const sourceScopes = sourceResource.scopes.map((scope) => scope.name);
      const matchingTargetScopes = target.scopes!.filter((scope) =>
        sourceScopes.includes(scope.name),
      );

      resourceReports.push({
        ...baseReport,
        missingUris: sourceResource.uris,
        missingScopes: sourceScopes,
        reportType: ResourceReportType.MISSING_RESOURCE,
      });

      dataToSynchronize.push({
        process: 'CREATE',
        data: {
          type: sourceResource.type,
          name: sourceResource.name,
          displayName: sourceResource.displayName,
          icon_uri: sourceResource.icon_uri,
          ownerManagedAccess: sourceResource.ownerManagedAccess,
          scopes: matchingTargetScopes,
          uris: sourceResource.uris,
          attributes: sourceResource.attributes,
        }
      });
    }
  }

  return {report: resourceReports, data: dataToSynchronize};
};

const getResources = async (source: Authorization, target: Authorization) => {
  if (source.resources === undefined && target.resources === undefined) {
    return await Promise.all([
      source.getResources(),
      target.getResources(),
    ]);
  } else if (target.resources === undefined) {
    return [source.resources, await target.getResources()];
  } else {
    return [await source.getResources(), target.resources];
  }
};

const compareResourceConfigurations = (
  source: Resource,
  target: Resource,
): ResourceConfigurationComparisonResult => {
  const missingUris = compareConfiguration(
    source.uris.map((uri) => ({ name: uri })),
    target.uris.map((uri) => ({ name: uri })),
  );
  const hasMissingUris = missingUris.length != 0;

  const missingScopes = compareConfiguration(source.scopes, target.scopes);
  const hasMissingScopes = missingScopes.length != 0;

  return {
    shouldInclude: hasMissingUris || hasMissingScopes,
    missingUris: missingUris.map((uri) => uri.name),
    missingScopes: missingScopes.map((scope) => scope.name),
    reportType: getReportType(hasMissingUris, hasMissingScopes),
  };
};

const getReportType = (hasMissingUris: boolean, hasMissingScopes: boolean) => {
  if (hasMissingUris && hasMissingScopes) {
    return ResourceReportType.MISSING_URIS_AND_SCOPE;
  } else if (hasMissingUris) {
    return ResourceReportType.MISSING_URIS;
  } else if (hasMissingScopes) {
    return ResourceReportType.MISSING_SCOPES;
  } else {
    return ResourceReportType.EMPTY;
  }
};

export const synchronizeResources = async (
  resources: CreateUpdateResource[],
  target: Authorization,
) => {
  for (const resource of resources) {
    if (resource.process === 'CREATE') {
      const createdResource = await target.resourceManager.createResource(resource.data);
      target.pushNewResourceToCache(createdResource);
    } else {
      await target.resourceManager.updateResource(resource.id!, resource.data);
      target.updateCachedResource(resource);
    }
  }
};
