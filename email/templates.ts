import type { EmailJob } from './types';

const COLORS = {
  background: '#dfd2c8',
  text: '#855e3f',
  heading: '#4a3423',
  divider: '#c2ad9c',
  separator: '#b89b82',
  codeBackground: '#efe6de',
};

const FONTS = {
  heading: "Georgia, 'Times New Roman', serif",
  body: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
};

const BASE_URL =
  process.env['NODE_ENV'] === 'development'
    ? 'http://localhost:3000'
    : 'https://itihaas.netlify.app';

const LINKS = {
  frontend: BASE_URL,
  docs: `${BASE_URL}/docs`,
  resend: `${BASE_URL}/api-resend/`,
  github: 'https://github.com/sunillshastry/itihaas-api',
};

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

const p = (html: string) => `<p style="margin:0 0 16px">${html}</p>`;

const hr = (margin: string) =>
  `<hr style="border:none;border-top:1px solid ${COLORS.divider};margin:${margin}">`;

// Explicit color + underline so mail clients never fall back to default blue
const link = (href: string, label: string) =>
  `<a href="${esc(href)}" style="color:${COLORS.heading};text-decoration:underline">${label}</a>`;

const linkSeparator = `<span style="color:${COLORS.separator}">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>`;

const layout = (title: string, body: string) => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.background}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.background}" style="background:${COLORS.background}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td style="font-family:${FONTS.body};font-size:15px;line-height:1.6;color:${COLORS.text}">
<h1 style="font-family:${FONTS.heading};font-size:24px;line-height:1.3;font-weight:bold;color:${COLORS.heading};margin:0 0 24px">${title}</h1>
${body}
${hr('24px 0')}
<p style="margin:0;font-size:13px;line-height:1.6">${link(LINKS.frontend, 'Itihaas')}${linkSeparator}${link(LINKS.docs, 'Docs')}${linkSeparator}${link(LINKS.github, 'GitHub')}</p>
${hr('24px 0 16px')}
<p style="margin:0;font-size:12px;color:${COLORS.text}">Itihaas API · If you didn't request this, ignore this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const button = (href: string, label: string) =>
  `<p style="margin:8px 0 0"><a href="${esc(href)}" style="display:inline-block;background:${COLORS.heading};color:${COLORS.background};padding:12px 24px;border-radius:6px;font-weight:bold;text-decoration:none">${label}</a></p>
${hr('24px 0 20px')}
${p(`Or alternatively, you can paste this link in the browser:<br><a href="${esc(href)}" style="color:${COLORS.heading};text-decoration:underline;word-break:break-all">${esc(href)}</a>`)}`;

const apiKeyBox = (apiKey: string) =>
  `<p style="margin:0 0 16px"><code style="display:inline-block;background:${COLORS.codeBackground};color:${COLORS.heading};padding:10px 14px;border-radius:6px;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:14px;word-break:break-all">${esc(apiKey)}</code></p>`;

const keyWarning =
  'Keep this key secret. Anyone who has it can make requests on your behalf.';

const textFooter = `Itihaas: ${LINKS.frontend}
Docs: ${LINKS.docs}
GitHub: ${LINKS.github}

--
Itihaas API · If you didn't request this, ignore this email.
`;

const expiredNote = () =>
  p(
    `If your verification code or link appears to be expired, you can use our ${link(LINKS.resend, 'resend code')} page to get a new verification code and link.`,
  );

const textExpiredNote = `If your verification code or link appears to be expired, you can use our resend code page to get a new verification code and link: ${LINKS.resend}`;

export function renderEmail(job: EmailJob, apiKey?: string) {
  const name = esc(job.name);

  switch (job.type) {
    case 'registration':
      return {
        subject: 'Thanks for Registering with Itihaas: Verify your email',
        html: layout(
          'Thank you for registering for the Itihaas API',
          `${p(`Good day, ${name},`)}
${p(`Welcome to Itihaas! Before you get started with our API, please ensure that you have your email and account verified. You can do so with the link provided below. Please note that the verification code and link is valid for exactly ${esc(job.expiresIn)}.`)}
${button(job.link, 'Verify Email')}
${expiredNote()}`,
        ),
        text: `Thank you for registering for the Itihaas API

Good day, ${job.name},

Welcome to Itihaas! Before you get started with our API, please ensure that you have your email and account verified. You can do so with the link provided below. Please note that the verification code and link is valid for exactly ${job.expiresIn}.

Verify your email: ${job.link}

${textExpiredNote}

${textFooter}`,
      };

    case 'verification-resend':
      return {
        subject: 'Your new Itihaas verification link',
        html: layout(
          'Your new verification link',
          `${p(`Good day, ${name},`)}
${p(`Here is a fresh verification code and link for your Itihaas API account. Please note that it is valid for exactly ${esc(job.expiresIn)}.`)}
${button(job.link, 'Verify Email')}
${expiredNote()}`,
        ),
        text: `Your new verification link

Good day, ${job.name},

Here is a fresh verification code and link for your Itihaas API account. Please note that it is valid for exactly ${job.expiresIn}.

Verify your email: ${job.link}

${textExpiredNote}

${textFooter}`,
      };

    case 'verification-success':
      return {
        subject: 'Your Itihaas account is verified: Here is your API key',
        html: layout(
          'Your account is verified',
          `${p(`Good day, ${name},`)}
${p('Thank you for verifying your email. Your Itihaas API account is now active, and your API key is below.')}
${apiKeyBox(apiKey ?? '')}
${p(keyWarning)}
${p(`Ready to get started? Head over to the ${link(LINKS.docs, 'documentation')} to learn how to use your key.`)}`,
        ),
        text: `Your account is verified

Good day, ${job.name},

Thank you for verifying your email. Your Itihaas API account is now active, and your API key is below.

${apiKey}

${keyWarning}

Ready to get started? Head over to the documentation to learn how to use your key: ${LINKS.docs}

${textFooter}`,
      };

    case 'api-key-recovery':
      return {
        subject: 'Your Itihaas API key recovery',
        html: layout(
          'Your API key recovery',
          `${p(`Good day, ${name},`)}
${p('We received a request to recover the API key for your Itihaas API account. Your API key is below.')}
${apiKeyBox(apiKey ?? '')}
${p(keyWarning)}`,
        ),
        text: `Your API key recovery

Good day, ${job.name},

We received a request to recover the API key for your Itihaas API account. Your API key is below.

${apiKey}

${keyWarning}

${textFooter}`,
      };
  }
}
