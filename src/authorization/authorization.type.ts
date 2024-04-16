import { Client } from '../client/client';
import { SimpleResource } from './resource/resource.type';

export abstract class AuthorizationType {
  readonly client: Client;

  protected constructor(client: Client) {
    this.client = client;
  }

  protected async getBaseConfig() {
    const accessToken = await this.client.tokenManager.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
}

export type SimpleClient = {
  id: string;
  clientId: string;
};

export interface Name {
  name: string;
}

interface IDName extends Name {
  id: string;
}

export interface Scope extends IDName {}

interface AuthorizationMetaData extends IDName {
  description: string;
  type: string;
  logic: string;
  decisionStrategy: string;
}

export interface Policy extends AuthorizationMetaData {
  config: object;
}

export interface Permission extends AuthorizationMetaData {}

export class DetailedPermission implements Permission {
  id: string;
  name: string;
  description: string;
  logic: string;
  type: string;
  decisionStrategy: string;
  policies: Policy[] = [];
  resources: SimpleResource[] = [];
  scopes: Scope[] = [];

  constructor(permission: Permission) {
    this.id = permission.id;
    this.name = permission.name;
    this.description = permission.description;
    this.decisionStrategy = permission.decisionStrategy;
    this.logic = permission.logic;
    this.type = permission.type;
  }
}
