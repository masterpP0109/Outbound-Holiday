export function emailRecipient(email: string, env: NodeJS.ProcessEnv = process.env, options: { customerAcknowledgement?: boolean; testPreview?: boolean } = {}) {
  const mode = env.EMAIL_DELIVERY_MODE ?? 'disabled';
  if (mode === 'live') return email;
  if (mode === 'test') {
    if (options.customerAcknowledgement && !options.testPreview) {
      throw new Error('Customer acknowledgements require live delivery mode; test mode cannot redirect them to the team mailbox.');
    }
    if (!env.EMAIL_TEST_TO) throw new Error('Missing server configuration: EMAIL_TEST_TO');
    return env.EMAIL_TEST_TO;
  }
  throw new Error('Email delivery is disabled.');
}
