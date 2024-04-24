import axios from 'axios';
import { AuthenticationContext } from '../stage/stage.type';

export const authenticate = async (
  authenticationContext: AuthenticationContext,
): Promise<string> => {
  try {
    const params = authenticationContext.user.getHasUrlSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'openid');

    const config = {
      bypassInterceptor: true,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    };

    const response = await axios.post(
      authenticationContext.tokenUri,
      params,
      config,
    );
    return response.data.access_token;
  } catch (error) {
    console.log(error);
    return '';
  }
};
