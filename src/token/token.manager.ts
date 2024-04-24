import { authenticate } from './token.service';
import { AuthenticationContext } from '../stage/stage.type';
import { TokenManager } from './token.type';

export class TokenManagerFactory {
  public static newTokenManager(
    type: string,
    authenticationContext: AuthenticationContext,
  ): TokenManager {
    switch (type.toLowerCase()) {
      case 'default':
        return new DefaultTokenManager(authenticationContext);
      default:
        throw new Error(`Unknown TokenManager type: ${type}`);
    }
  }
}

class DefaultTokenManager implements TokenManager {
  readonly authenticationContext: AuthenticationContext;
  private accessToken = '';
  // todo refresh token when expired (shouldn't be the case)

  public constructor(authenticationContext: AuthenticationContext) {
    this.authenticationContext = authenticationContext;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken == '') {
      this.accessToken = await authenticate(this.authenticationContext);
    }
    return this.accessToken;
  }
}
