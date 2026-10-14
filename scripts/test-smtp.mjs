import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ quiet: true });
const required = name => {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
  return process.env[name];
};
const port = Number(required('SMTP_PORT'));
if (![465, 587].includes(port)) throw new Error('Use SMTP port 465 or 587.');
const transport = nodemailer.createTransport({
  host: required('SMTP_HOST'), port, secure: port === 465, requireTLS: port === 587,
  auth: { user: required('SMTP_USER'), pass: required('SMTP_PASSWORD') },
  tls: { rejectUnauthorized: true }, connectionTimeout: 10000,
  greetingTimeout: 10000, socketTimeout: 20000,
});
const deadline = setTimeout(() => {
  console.error('SMTP test failed: overall connection/delivery timeout (45 seconds).');
  transport.close();
  process.exit(1);
}, 45000);
console.log(`Testing SMTP ${process.env.SMTP_HOST}:${port} with TLS certificate verification.`);
try {
  await transport.verify();
  console.log('SMTP TLS connection and authentication passed.');
  if (process.argv.includes('--send')) {
    if (process.env.EMAIL_DELIVERY_MODE !== 'test') throw new Error('Sending this test requires EMAIL_DELIVERY_MODE=test.');
    const to = required('EMAIL_TEST_TO');
    const info = await transport.sendMail({
      from: required('EMAIL_FROM'), to,
      subject: 'Outbound Holidays SMTP test',
      text: `This is a test of the Outbound Holidays SMTP configuration.\nSent at ${new Date().toISOString()}.`,
    });
    if (!info.accepted?.length) throw new Error('SMTP did not accept the test recipient.');
    console.log(`SMTP accepted the test email for ${to}. Check the inbox and spam folder.`);
  }
} catch (error) {
  console.error('SMTP test failed:', error.code ?? error.name, error.responseCode ?? '', error.command ?? '');
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  transport.close();
}
