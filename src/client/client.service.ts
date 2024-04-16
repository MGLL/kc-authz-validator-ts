import path from 'node:path';
import * as fs from 'node:fs';
import * as config from '../config/config.json';
import { Client } from './client';
import { Authorization } from '../authorization/authorization';
import { comparePermissions } from '../authorization/permission/permission.service';
import {
  compareResources,
  synchronizeResources,
} from '../authorization/resource/resource.service';
import {
  initScopesAndPolicies,
  verifyAndPopulateClientIds,
} from '../utils/initializer';

// todo move away
export enum Mode {
  REPORT = 'report',
  SYNCHRONIZE = 'synchronize',
}

const utf8 = 'utf-8';
const stringifySpace = 2;

export const compareClients = async (
  sourceClient: Client,
  targetClient: Client,
) => {
  await verifyAndPopulateClientIds(sourceClient, targetClient);
  // todo const sourceAuthz = client.generateAuthorization();
  // todo sourceAuthz.initScopesAndPolicies();
  const [source, target] = [
    new Authorization(sourceClient),
    new Authorization(targetClient),
  ];
  await initScopesAndPolicies(source, target);
  //

  // todo extract report process from there
  const directory = path.join(__dirname, '..', 'report');

  // todo ResourceComparator class?
  const resourceReport = await compareResources(source, target);
  fs.writeFileSync(
    `${directory}/${sourceClient.stage}-to-${targetClient.stage}-resource-report.json`,
    JSON.stringify(resourceReport, null, stringifySpace),
    utf8,
  );

  if (config.mode == Mode.SYNCHRONIZE) {
    await synchronizeResources(resourceReport, target);
  }

  // todo PermissionComparator class?
  const permissionReport = await comparePermissions(source, target);
  fs.writeFileSync(
    `${directory}/${sourceClient.stage}-to-${targetClient.stage}-permission-report.json`,
    JSON.stringify(permissionReport, null, stringifySpace),
    utf8,
  );

  // todo synchronize permissions
};
