import axios from 'axios';
import {
  AuthorizationType,
  DetailedPermission,
  Permission,
  Policy,
  Scope,
} from '../authorization.type';
import { SimpleResource } from '../resource/resource.type';
import { Client } from '../../client/client';
import {CreateUpdatePermission, PermissionRequestData} from './permission.type';

export class AuthorizationPermission extends AuthorizationType {
  constructor(client: Client) {
    super(client);
  }

  private getPermissionUri = () => {
    return `${this.client.adminUri}/clients/${this.client.id}/authz/resource-server/permission`;
  };

  getDetailedPermissions = async () => {
    const permissions = await this.getPermissions();
    const detailedPermissions: DetailedPermission[] = [];

    // todo split and parallelize?
    for (const permission of permissions) {
      const detailedPermission = new DetailedPermission(permission);

      const [resources, policies, scopes] = await Promise.all([
        this.getPermissionResources(permission.id),
        this.getPermissionPolicies(permission.id),
        this.getPermissionScopes(permission.id),
      ]);

      detailedPermission.resources = resources;
      detailedPermission.policies = policies;
      detailedPermission.scopes = scopes;
      detailedPermissions.push(detailedPermission);
    }

    return detailedPermissions;
  };

  private getPermissions = async (): Promise<Permission[]> => {
    try {
      const uri = this.getPermissionUri() + `?first=0&max=100`;
      const config = await this.getBaseConfig();
      const response = await axios.get<Permission[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  private getPermissionResources = async (
    permissionId: string,
  ): Promise<SimpleResource[]> => {
    try {
      const uri = this.getPermissionUri() + `/${permissionId}/resources`;
      const config = await this.getBaseConfig();
      const response = await axios.get<SimpleResource[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  private getPermissionPolicies = async (
    permissionId: string,
  ): Promise<Policy[]> => {
    try {
      const uri =
        this.getPermissionUri() + `/${permissionId}/associatedPolicies`;
      const config = await this.getBaseConfig();
      const response = await axios.get<Policy[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  private getPermissionScopes = async (
    permissionId: string,
  ): Promise<Scope[]> => {
    try {
      const uri = this.getPermissionUri() + `/${permissionId}/scopes`;
      const config = await this.getBaseConfig();
      const response = await axios.get<Scope[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  createPermission = async (data: PermissionRequestData) => {
    try {
      const uri = this.getPermissionUri();
      const config = await this.getBaseConfig();
      const response = await axios.post<PermissionRequestData>(uri, data, config);
      return response.data;
    } catch (error) {
      console.log(`error in creating permission`, error);
      throw error;
    }
  };

  updatePermission = async (id: string, data: PermissionRequestData) => {
    try {
      const uri = this.getPermissionUri() + `/${id}`;
      const config = await this.getBaseConfig();
      const response = await axios.put(uri, data, config);
      return response.data;
    } catch (error) {
      console.log(`error in updating permission`, error);
      throw error;
    }
  };
}
