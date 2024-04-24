import { Client } from '../client/client';
import { TokenManagerFactory } from '../token/token.manager';
import {
  AuthenticationContext,
  RawStageConfig,
  StageUri,
  UserClient,
} from './stage.type';
import { TokenManager } from '../token/token.type';

export class Stage {
  stage: number;
  stageName: string;
  uri: StageUri;
  clients: Client[] = [];
  tokenManager: TokenManager;

  private constructor(env: RawStageConfig) {
    this.stage = env.stage;
    this.stageName = env.stage_name;
    this.uri = {
      adminUri: `${env.hostname}/admin/realms/${env.realm}`,
      tokenUri: `${env.hostname}/realms/${env.realm}/protocol/openid-connect/token`,
    };

    const authenticationContext: AuthenticationContext = {
      tokenUri: this.uri.tokenUri,
      user: new UserClient(
        env.admin_user_client.client_id,
        env.admin_user_client.client_secret,
      ),
    };
    this.tokenManager = TokenManagerFactory.newTokenManager(
      'default',
      authenticationContext,
    );

    for (const client of env.clients) {
      this.clients.push(new Client('', client, this));
    }
  }

  static fromConfig(env: RawStageConfig) {
    return new Stage(env);
  }

  getTokenManager() {
    return this.tokenManager;
  }

  getAdminUri() {
    return this.uri.adminUri;
  }
}
