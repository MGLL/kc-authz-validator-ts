import { AuthenticationContext } from '../stage/stage.type';

export interface TokenManager {
  authenticationContext: AuthenticationContext;
  getAccessToken(): Promise<string>;
}
