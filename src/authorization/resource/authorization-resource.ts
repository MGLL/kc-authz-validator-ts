import axios from 'axios';
import { AuthorizationType } from '../authorization.type';
import { Client } from '../../client/client';
import { CreateUpdateResource, Resource } from './resource.type';

export class AuthorizationResource extends AuthorizationType {
  constructor(client: Client) {
    super(client);
  }

  private getResourceUri = () => {
    return `${this.client.adminUri}/clients/${this.client.id}/authz/resource-server/resource`;
  };

  getResources = async (): Promise<Resource[]> => {
    try {
      const uri = this.getResourceUri() + '?first=0&max=100';
      const config = await this.getBaseConfig();
      const response = await axios.get<Resource[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  createResource = async (data: CreateUpdateResource) => {
    try {
      const uri = this.getResourceUri();
      const config = await this.getBaseConfig();
      const response = await axios.post(uri, data, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  updateResource = async (id: string, data: CreateUpdateResource) => {
    try {
      const uri = this.getResourceUri() + `/${id}`;
      const config = await this.getBaseConfig();
      const response = await axios.put(uri, data, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };
}
