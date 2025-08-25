const { Resend } = require('resend');
const dotenv = require('dotenv');
const REGISTER_TEMPLATE = require('@/templates/register');

dotenv.config();

async function sendEmail() {
  const RESEND_API_KEY = process.env.RESEND_EMAIL_API_KEY || null;

  if (!RESEND_API_KEY) {
    throw new Error('Error: Resend API key is missing or invalid');
  }

  const resend = new Resend(RESEND_API_KEY);

  const content = await resend.emails.send({
    from: 'Itihaas <testing@sunilshastry.com>',
    to: ['itihaas.dev@gmail.com', 'sunil.shastry69@gmail.com'],
    subject: 'Email Testing (Resend) 🧪',
    html: REGISTER_TEMPLATE,
  });

  if (content?.error) {
    throw new Error('Error: Failed to send email');
  }

  return content;
}

module.exports = sendEmail;
