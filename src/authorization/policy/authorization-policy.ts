import { Client } from '../../client/client';
import { AuthorizationType, Policy } from '../authorization.type';
import axios from 'axios';

export class AuthorizationPolicy extends AuthorizationType {
  constructor(client: Client) {
    super(client);
  }

  private getPolicyUri = () => {
    return `${this.client.adminUri}/clients/${this.client.id}/authz/resource-server/policy`;
  };

  getPolicies = async (): Promise<Policy[]> => {
    try {
      const uri = this.getPolicyUri() + '?first=0&max=100';
      const config = await this.getBaseConfig();
      const response = await axios.get<Policy[]>(uri, config);
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  };
}
