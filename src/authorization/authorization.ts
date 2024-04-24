import { Client } from '../client/client';
import { AuthorizationResource } from './resource/authorization-resource';
import { AuthorizationPermission } from './permission/authorization-permission';
import { AuthorizationScope } from './scope/authorization-scope';
import { DetailedPermission, Policy, Scope } from './authorization.type';
import { AuthorizationPolicy } from './policy/authorization-policy';
import { CreateUpdateResource, Resource } from './resource/resource.type';
import {
  CreateUpdatePermission,
  PermissionRequestData,
} from './permission/permission.type';

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

  pushNewResourceToCache(newResource: Resource) {
    this.resources!.push(newResource);
  }

  updateCachedResource(newResourceState: CreateUpdateResource) {
    for (const resource of this.resources!) {
      if (resource._id === newResourceState.id) {
        const newState = newResourceState.data;
        resource.name = newState.name;
        resource.displayName = newState.displayName;
        resource.type = newState.type;
        resource.icon_uri = newState.icon_uri;
        resource.ownerManagedAccess = newState.ownerManagedAccess;
        resource.scopes = newState.scopes;
        resource.uris = newState.uris;
        resource.attributes = newState.attributes;
        break;
      }
    }
  }

  pushNewPermissionToCache(newPermission: PermissionRequestData) {
    const newDetailedPermission =
      DetailedPermission.fromPermissionRequestData(newPermission);
    newDetailedPermission.policies = this.policies!.filter((p) =>
      newPermission.policies.includes(p.id),
    );
    newDetailedPermission.resources = this.resources!.filter((r) =>
      newPermission.resources.includes(r._id),
    );
    newDetailedPermission.scopes = this.scopes!.filter((s) =>
      newPermission.scopes.includes(s.id),
    );
    this.permissions!.push(newDetailedPermission);
  }

  updateCachedPermission(newPermissionState: CreateUpdatePermission) {
    for (const permission of this.permissions!) {
      if (permission.id === newPermissionState.id) {
        const newState = newPermissionState.data;
        permission.name = newState.name;
        permission.description = newState.description;
        permission.logic = newState.logic!;
        permission.type = newState.type;
        permission.decisionStrategy = newState.decisionStrategy;
        permission.policies = this.policies!.filter((p) =>
          newState.policies.includes(p.id),
        );
        permission.resources = this.resources!.filter((r) =>
          newState.resources.includes(r._id),
        );
        permission.scopes = this.scopes!.filter((s) =>
          newState.scopes.includes(s.id),
        );
        break;
      }
    }
  }
}
