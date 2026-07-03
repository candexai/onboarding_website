const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== 'false';

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const email = String(body.email || '').trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const notifyTo = process.env.NOTIFY_TO || process.env.SMTP_USER || 'tech@candexai.co.in';
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"CandexAI Onboarding" <${from}>`,
      to: notifyTo,
      replyTo: email,
      subject: `Onboarding guide access — ${email}`,
      text: [
        'A user is trying to access the CandexAI onboarding guide.',
        '',
        `Email: ${email}`,
        `Time: ${time} (IST)`,
        `IP: ${ip}`,
        `User agent: ${userAgent}`,
      ].join('\n'),
      html: `
        <h2>Onboarding guide access request</h2>
        <p>A user is trying to access the CandexAI onboarding guide.</p>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Time</strong></td><td>${time} (IST)</td></tr>
          <tr><td><strong>IP</strong></td><td>${ip}</td></tr>
          <tr><td><strong>User agent</strong></td><td>${userAgent}</td></tr>
        </table>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Access notification failed:', err);
    return res.status(500).json({ error: 'Could not verify access. Please try again.' });
  }
};
