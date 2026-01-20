import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_OJZDBP7Ni',
      userPoolClientId: '5778u2lklu9lo09jhgql23v1bt',
      region: 'us-east-1',
    }
  }
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
