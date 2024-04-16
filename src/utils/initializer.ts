import { Authorization } from '../authorization/authorization';
import { Client } from '../client/client';
import axios from 'axios';
import { SimpleClient } from '../authorization/authorization.type';

export const verifyAndPopulateClientIds = async (
  sourceClient: Client,
  targetClient: Client,
) => {
  if (
    sourceClient.isClientIdUndefined() &&
    targetClient.isClientIdUndefined()
  ) {
    const [sourceClientId, targetClientId] = await Promise.all([
      getClientId(sourceClient),
      getClientId(targetClient),
    ]);
    sourceClient.setClientId(sourceClientId);
    targetClient.setClientId(targetClientId);
  } else if (targetClient.isClientIdUndefined()) {
    const targetClientId = await getClientId(targetClient);
    targetClient.setClientId(targetClientId);
  } else {
    const sourceClientId = await getClientId(sourceClient);
    sourceClient.setClientId(sourceClientId);
  }
};

const getClientId = async (client: Client) => {
  try {
    const uri = `${client.adminUri}/clients?clientId=${client.name}&max=1`;
    const accessToken = await client.tokenManager.getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await axios.get<SimpleClient[]>(uri, config);
    return response.data[0].id;
  } catch (error) {
    throw new Error(`Couldn't populate client id: ${error}`);
  }
};

export const initScopesAndPolicies = async (
  source: Authorization,
  target: Authorization,
) => {
  await initScopes(source, target);
  await initPolicies(source, target);
};

const initScopes = async (source: Authorization, target: Authorization) => {
  if (source.scopes == undefined && target.scopes == undefined) {
    const [sourceScopes, targetScopes] = await Promise.all([
      source.scope.getScopes(),
      target.scope.getScopes(),
    ]);
    source.cacheScopes(sourceScopes);
    target.cacheScopes(targetScopes);
  } else if (target.scopes == undefined) {
    const targetScopes = await target.scope.getScopes();
    target.cacheScopes(targetScopes);
  } else {
    const sourceScopes = await source.scope.getScopes();
    source.cacheScopes(sourceScopes);
  }
};

const initPolicies = async (source: Authorization, target: Authorization) => {
  if (source.policies == undefined && target.policies == undefined) {
    const [sourcePolicies, targetPolicies] = await Promise.all([
      source.policy.getPolicies(),
      target.policy.getPolicies(),
    ]);
    source.cachePolicies(sourcePolicies);
    target.cachePolicies(targetPolicies);
  } else if (target.policies == undefined) {
    const targetPolicies = await target.policy.getPolicies();
    target.cachePolicies(targetPolicies);
  } else {
    const sourcePolicies = await source.policy.getPolicies();
    source.cachePolicies(sourcePolicies);
  }
};
