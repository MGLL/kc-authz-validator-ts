import { Client } from '../../client/client';
import { AuthorizationType, Scope } from '../authorization.type';
import axios from 'axios';

export class AuthorizationScope extends AuthorizationType {
  constructor(client: Client) {
    super(client);
  }

  private getScopeUri = () => {
    return `${this.client.adminUri}/clients/${this.client.id}/authz/resource-server/scope`;
  };

  getScopes = async (): Promise<Scope[]> => {
    try {
      const uri = this.getScopeUri() + '?first=0&max=100';
      const config = await this.getBaseConfig();
      const response = await axios.get<Scope[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };
}
