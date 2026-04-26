import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function contactAdminTemplate({ name, email, reason, message }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Contact — Capsul</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; font-family: 'Inter', sans-serif; color: #e8e0d4; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1a1508 0%, #111 100%); padding: 40px 36px; border-bottom: 1px solid rgba(200,169,106,0.15); }
  .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .logo-dot { width: 28px; height: 28px; background: linear-gradient(135deg, #c8a96a, #e8c988); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .logo-dot span { color: #0a0a0a; font-size: 13px; font-weight: 700; }
  .logo-text { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #8a7a60; }
  .eyebrow { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #c8a96a; margin-bottom: 10px; }
  .title { font-size: 26px; font-weight: 300; color: #f0e8d8; letter-spacing: -0.01em; }
  .body { padding: 32px 36px; }
  .reason-badge { display: inline-block; padding: 4px 12px; background: rgba(200,169,106,0.12); border: 1px solid rgba(200,169,106,0.3); color: #c8a96a; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; border-radius: 2px; margin-bottom: 24px; }
  .field { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .field:last-of-type { border-bottom: none; margin-bottom: 0; }
  .field-label { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #6a5f4a; margin-bottom: 6px; }
  .field-value { font-size: 14px; font-weight: 300; color: #d4c8b0; line-height: 1.6; }
  .message-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-left: 2px solid #c8a96a; padding: 16px 20px; margin-top: 6px; border-radius: 0 2px 2px 0; }
  .footer { padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); }
  .footer-text { font-size: 11px; color: #4a4030; line-height: 1.7; }
  .footer-link { color: #8a7a60; text-decoration: none; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,169,106,0.2), transparent); margin: 4px 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="logo-row">
        <div class="logo-dot"><span>C</span></div>
        <div>
          <div class="logo-text">Capsul — Admin</div>
        </div>
      </div>
      <div class="divider"></div>
      <br/>
      <p class="eyebrow">New message received</p>
      <p class="title">Contact request<br/>from ${name}</p>
    </div>
    <div class="body">
      <span class="reason-badge">${reason}</span>
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${email}" style="color:#c8a96a;text-decoration:none;">${email}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Reason</div>
        <div class="field-value">${reason}</div>
      </div>
      <div class="field">
        <div class="field-label">Message</div>
        <div class="message-box field-value">${message.replace(/\n/g, '<br/>')}</div>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">
        Sent via the contact form at <a class="footer-link" href="https://capsul.tn">capsul.tn</a>.
        Reply directly to this email to respond to ${name}.
      </p>
    </div>
  </div>
</div>
</body>
</html>`
}

function contactAutoReplyTemplate({ name, reason }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>We received your message — Capsul</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; font-family: 'Inter', sans-serif; color: #e8e0d4; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1a1508 0%, #111 100%); padding: 44px 36px; border-bottom: 1px solid rgba(200,169,106,0.15); text-align: center; }
  .diamond { width: 52px; height: 52px; background: rgba(200,169,106,0.1); border: 1px solid rgba(200,169,106,0.3); transform: rotate(45deg); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
  .diamond-inner { transform: rotate(-45deg); color: #c8a96a; font-size: 20px; }
  .eyebrow { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #c8a96a; margin-bottom: 12px; }
  .title { font-size: 28px; font-weight: 300; color: #f0e8d8; letter-spacing: -0.01em; }
  .body { padding: 36px 36px; text-align: center; }
  .body p { font-size: 14px; font-weight: 300; color: #8a7a60; line-height: 1.9; }
  .body p strong { color: #d4c8b0; font-weight: 400; }
  .meta-row { display: flex; justify-content: center; gap: 24px; margin: 28px 0; flex-wrap: wrap; }
  .meta-item { text-align: center; }
  .meta-label { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #4a4030; margin-bottom: 5px; }
  .meta-value { font-size: 13px; color: #8a7a60; font-weight: 300; }
  .divider { height: 1px; background: rgba(255,255,255,0.04); margin: 24px 0; }
  .footer { padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); text-align: center; }
  .footer-text { font-size: 11px; color: #4a4030; line-height: 1.7; }
  .footer-link { color: #8a7a60; text-decoration: none; }
  .logo-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px; }
  .logo-dot { width: 26px; height: 26px; background: linear-gradient(135deg, #c8a96a, #e8c988); border-radius: 5px; display: flex; align-items: center; justify-content: center; }
  .logo-dot span { color: #0a0a0a; font-size: 12px; font-weight: 700; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="logo-row">
        <div class="logo-dot"><span>C</span></div>
      </div>
      <div class="diamond"><span class="diamond-inner">✓</span></div>
      <p class="eyebrow">Message received</p>
      <p class="title">We'll be in touch,<br/>${name.split(' ')[0]}.</p>
    </div>
    <div class="body">
      <p>
        Your message about <strong>${reason}</strong> has reached our team.
        A Capsul scout reads every message personally — expect a real reply within 24 hours.
      </p>
      <div class="divider"></div>
      <div class="meta-row">
        <div class="meta-item">
          <div class="meta-label">Response time</div>
          <div class="meta-value">Within 24h</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Studio hours</div>
          <div class="meta-value">Mon–Fri 09:00–19:00</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Direct email</div>
          <div class="meta-value">hello@capsul.tn</div>
        </div>
      </div>
      <div class="divider"></div>
      <p style="font-size:12px;">In the meantime, explore our curated spaces across Tunisia.</p>
    </div>
    <div class="footer">
      <p class="footer-text">
        © 2025 Capsul · <a class="footer-link" href="https://capsul.tn">capsul.tn</a> · Tunis, Tunisia
      </p>
    </div>
  </div>
</div>
</body>
</html>`
}

function verificationTemplate({ confirmationUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify your email — Capsul</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; font-family: 'Inter', sans-serif; color: #e8e0d4; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
  .header { padding: 48px 36px 36px; border-bottom: 1px solid rgba(255,255,255,0.05); background: linear-gradient(160deg, #1a1508 0%, #0f0f0f 60%); }
  .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .logo-dot { width: 28px; height: 28px; background: linear-gradient(135deg, #c8a96a, #e8c988); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .logo-dot span { color: #0a0a0a; font-size: 13px; font-weight: 700; }
  .logo-name { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #8a7a60; }
  .line { width: 32px; height: 1px; background: #c8a96a; margin-bottom: 14px; }
  .eyebrow { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: #c8a96a; margin-bottom: 12px; }
  .title { font-size: 30px; font-weight: 300; color: #f0e8d8; line-height: 1.15; }
  .title em { font-style: italic; font-weight: 200; color: #c8a96a; }
  .body { padding: 36px; }
  .body p { font-size: 14px; font-weight: 300; color: #8a7a60; line-height: 1.85; margin-bottom: 28px; }
  .btn-wrap { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; padding: 14px 40px; background: #c8a96a; color: #0a0a0a; font-size: 10px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; border-radius: 2px; }
  .fallback { font-size: 11px; color: #4a4030; word-break: break-all; line-height: 1.6; }
  .fallback a { color: #8a7a60; }
  .divider { height: 1px; background: rgba(255,255,255,0.04); margin: 28px 0; }
  .footer { padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center; }
  .footer-text { font-size: 11px; color: #4a4030; line-height: 1.7; }
  .footer-link { color: #8a7a60; text-decoration: none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <div class="logo-row">
        <div class="logo-dot"><span>C</span></div>
        <div class="logo-name">Capsul</div>
      </div>
      <div class="line"></div>
      <p class="eyebrow">Account setup</p>
      <p class="title">Confirm your<br/><em>email address.</em></p>
    </div>
    <div class="body">
      <p>
        You're one step away from accessing curated spaces across Tunisia.
        Click the button below to verify your email and activate your Capsul account.
      </p>
      <div class="btn-wrap">
        <a class="btn" href="{{ .ConfirmationURL }}">Confirm email</a>
      </div>
      <div class="divider"></div>
      <p class="fallback">
        Button not working? Copy and paste this link into your browser:<br/>
        <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a>
      </p>
      <div class="divider"></div>
      <p style="font-size:12px;color:#4a4030;">
        This link expires in 24 hours. If you didn't create a Capsul account, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p class="footer-text">
        © 2025 Capsul · <a class="footer-link" href="https://capsul.tn">capsul.tn</a> · Tunis, Tunisia
      </p>
    </div>
  </div>
</div>
</body>
</html>`
}

// POST /api/contact — save message and send emails
app.post('/api/contact', async (req, res) => {
  const { name, email, reason, message } = req.body

  if (!name || !email || !reason || !message) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER

    await transporter.sendMail({
      from: `"Capsul Contact" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[Capsul] New message — ${reason} from ${name}`,
      html: contactAdminTemplate({ name, email, reason, message }),
    })

    await transporter.sendMail({
      from: `"Capsul" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `We received your message, ${name.split(' ')[0]} — Capsul`,
      html: contactAutoReplyTemplate({ name, reason }),
    })

    res.json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

app.listen(3001, () => console.log('Server on http://localhost:3001'))
