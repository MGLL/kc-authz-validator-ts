import { Client } from '../client/client';
import { AuthorizationResource } from './resource/authorization-resource';
import { AuthorizationPermission } from './permission/authorization-permission';
import { AuthorizationScope } from './scope/authorization-scope';
import { Policy, Scope } from './authorization.type';
import { AuthorizationPolicy } from './policy/authorization-policy';

export class Authorization {
  readonly resource: AuthorizationResource;
  readonly scope: AuthorizationScope;
  readonly policy: AuthorizationPolicy;
  readonly permission: AuthorizationPermission;
  scopes: Scope[] | undefined;
  policies: Policy[] | undefined;

  constructor(client: Client) {
    this.resource = new AuthorizationResource(client);
    this.scope = new AuthorizationScope(client);
    this.policy = new AuthorizationPolicy(client);
    this.permission = new AuthorizationPermission(client);
  }

  cacheScopes(scopes: Scope[]) {
    this.scopes = scopes;
  }

  cachePolicies(policies: Policy[]) {
    this.policies = policies;
  }
}
