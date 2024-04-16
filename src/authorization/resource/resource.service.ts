import { compareConfiguration, searchMatching } from '../../utils/comparator';
import { Authorization } from '../authorization';
import {
  Resource,
  ResourceConfigurationComparisonResult,
  ResourceReport,
  ResourceReportType,
} from './resource.type';

export const compareResources = async (
  source: Authorization,
  target: Authorization,
) => {
  const [sourceResources, targetResources] = await Promise.all([
    source.getResources(),
    target.getResources(),
  ]);

  const resourceReports: ResourceReport[] = [];
  for (const sourceResource of sourceResources) {
    const targetResource = searchMatching(sourceResource, targetResources);
    const hasResource = targetResource != undefined;

    const baseReport = {
      name: sourceResource.name,
      displayName: sourceResource.displayName,
      type: sourceResource.type,
    };

    if (hasResource) {
      const configReport = compareResourceConfigurations(
        sourceResource,
        targetResource,
      );
      if (configReport.shouldInclude) {
        // todo extract targetDataReference here to clarify, create prepare object
        const currentScopes = targetResource.scopes;
        const missingScopes = target!.scopes!.filter((s) =>
          configReport.missingScopes.includes(s.name),
        );
        const newScopes = currentScopes.concat(missingScopes);

        resourceReports.push({
          ...baseReport,
          missingUris: configReport.missingUris,
          missingScopes: configReport.missingScopes,
          reportType: configReport.reportType,
          targetDataReference: {
            id: configReport.targetDataReference.id,
            uris: targetResource!.uris.concat(configReport.missingUris),
            scopes: newScopes,
          },
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
        targetDataReference: {
          id: undefined,
          uris: sourceResource.uris,
          scopes: matchingTargetScopes,
        },
      });
    }
  }

  // todo maybe split return: report & syncData
  return resourceReports;
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

  // todo remove targetDataReference from here
  return {
    shouldInclude: hasMissingUris || hasMissingScopes,
    missingUris: missingUris.map((uri) => uri.name),
    missingScopes: missingScopes.map((scope) => scope.name),
    reportType: getReportType(hasMissingUris, hasMissingScopes),
    targetDataReference: {
      id: target._id,
      uris: [],
      scopes: target.scopes,
    },
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
  reports: ResourceReport[],
  target: Authorization,
) => {
  for (const report of reports) {
    const data = {
      name: report.name,
      displayName: report.displayName,
      type: report.type,
      icon_uri: '',
      uris: report.targetDataReference!.uris,
      scopes: report.targetDataReference!.scopes,
      ownerManagedAccess: false,
      attributes: {},
    };

    if (report.reportType == ResourceReportType.MISSING_RESOURCE) {
      await target.resourceManager.createResource(data);
    } else {
      await target.resourceManager.updateResource(
        report.targetDataReference!.id!,
        data,
      );
    }
  }
};
