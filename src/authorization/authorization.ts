import { Client } from '../client/client';
import { AuthorizationResource } from './resource/authorization-resource';
import { AuthorizationPermission } from './permission/authorization-permission';
import { AuthorizationScope } from './scope/authorization-scope';
import { DetailedPermission, Policy, Scope } from './authorization.type';
import { AuthorizationPolicy } from './policy/authorization-policy';
import { Resource } from './resource/resource.type';

export class Authorization {
  readonly resourceManager: AuthorizationResource;
  readonly scope: AuthorizationScope;
  readonly policy: AuthorizationPolicy;
  readonly permissionManager: AuthorizationPermission;
  resources: Resource[] | undefined;
  permissions: DetailedPermission[] | undefined;
  scopes: Scope[] | undefined;
  policies: Policy[] | undefined;

  constructor(client: Client) {
    this.resourceManager = new AuthorizationResource(client);
    this.scope = new AuthorizationScope(client);
    this.policy = new AuthorizationPolicy(client);
    this.permissionManager = new AuthorizationPermission(client);
  }

  async getResources() {
    if (this.resources === undefined) {
      this.resources = await this.resourceManager.getResources();
    }
    return this.resources;
  }

  async getPermissions() {
    if (this.permissions === undefined) {
      this.permissions = await this.permissionManager.getDetailedPermissions();
    }
    return this.permissions;
  }

  cacheScopes(scopes: Scope[]) {
    this.scopes = scopes;
  }

  cachePolicies(policies: Policy[]) {
    this.policies = policies;
  }
}
