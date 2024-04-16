import url from 'node:url';
import { Stage } from './stage';

type AdminUserClient = {
  client_id: string;
  client_secret: string;
};

export type RawStageConfig = {
  stage: number;
  stage_name: string;
  hostname: string;
  realm: string;
  clients: string[];
  admin_user_client: AdminUserClient;
};

export class UserClient {
  clientId: string;
  clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  getHasUrlSearchParams(): url.URLSearchParams {
    return new url.URLSearchParams({ client_id: this.clientId, client_secret: this.clientSecret });
  }
}

export type AuthenticationContext = {
  tokenUri: string;
  user: UserClient;
};

export type StageUri = {
  adminUri: string;
  tokenUri: string;
};

export interface StageManager {
  getStages(): Stage[];
  getStage(stageLevel: number): Stage;
  getCurrentStage(): Stage;
  setCurrentStage(stageLevel: number): void;
  nextStage(): void;
  logStages(): void;
}
