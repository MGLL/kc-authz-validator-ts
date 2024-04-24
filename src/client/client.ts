import { TokenManager } from '../token/token.type';
import { Stage } from '../stage/stage';
import { Authorization } from '../authorization/authorization';

export class Client {
  readonly name: string;
  id: string;
  readonly stage: string;
  readonly tokenManager: TokenManager;
  readonly adminUri: string;
  authorization?: Authorization;

  constructor(clientId: string, clientName: string, stage: Stage) {
    this.id = clientId;
    this.name = clientName;
    this.stage = stage.stageName;
    this.tokenManager = stage.getTokenManager();
    this.adminUri = stage.getAdminUri();
  }

  equals(client: Client) {
    return this.name == client.name;
  }

  setClientId(id: string) {
    this.id = id;
  }

  isClientIdUndefined() {
    return this.id == '';
  }
}
