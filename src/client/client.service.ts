import path from 'node:path';
import * as fs from 'node:fs';
import * as config from '../config/config.json';
import { Client } from './client';
import { Authorization } from '../authorization/authorization';
import {
  comparePermissions,
  synchronizePermissions,
} from '../authorization/permission/permission.service';
import {
  compareResources,
  synchronizeResources,
} from '../authorization/resource/resource.service';
import {
  initScopesAndPolicies,
  verifyAndPopulateClientIds,
} from '../utils/initializer';
import { Mode } from '../type/type';
import assert from 'node:assert';

// todo move to report process
const utf8 = 'utf-8';
const stringifySpace = 2;

export const compareClients = async (
  sourceClient: Client,
  targetClient: Client,
) => {
  await verifyAndPopulateClientIds(sourceClient, targetClient);
  // todo const sourceAuthz = client.generateAuthorization();
  // todo sourceAuthz.initScopesAndPolicies();
  const [source, target] = getAuthorization(sourceClient, targetClient);
  assert(source !== undefined);
  assert(target !== undefined);
  await initScopesAndPolicies(source, target);
  //

  // todo extract report process from there
  const directory = path.join(__dirname, '..', 'report');

  // todo ResourceComparator class?
  const resourceComparisonResult = await compareResources(source, target);
  fs.writeFileSync(
    `${directory}/${sourceClient.stage}-to-${targetClient.stage}-resource-report.json`,
    JSON.stringify(resourceComparisonResult.report, null, stringifySpace),
    utf8,
  );

  if (config.mode == Mode.SYNCHRONIZE) {
    await synchronizeResources(resourceComparisonResult.data, target);
  }

  // todo PermissionComparator class?
  const permissionComparisonResult = await comparePermissions(source, target);
  fs.writeFileSync(
    `${directory}/${sourceClient.stage}-to-${targetClient.stage}-permission-report.json`,
    JSON.stringify(permissionComparisonResult.report, null, stringifySpace),
    utf8,
  );

  if (config.mode == Mode.SYNCHRONIZE) {
    await synchronizePermissions(permissionComparisonResult.data, target);
  }

  targetClient.authorization = target;
};

const getAuthorization = (sourceClient: Client, targetClient: Client) => {
  if (
    sourceClient.authorization === undefined &&
    targetClient.authorization === undefined
  ) {
    return [new Authorization(sourceClient), new Authorization(targetClient)];
  } else if (targetClient.authorization === undefined) {
    return [sourceClient.authorization, new Authorization(targetClient)];
  } else {
    return [new Authorization(sourceClient), targetClient.authorization];
  }
};
