# Email Template Setup for Capsul

## Supabase Email Configuration

To customize the verification email template in Supabase:

### 1. Go to Supabase Dashboard
- Navigate to your Supabase project: https://supabase.com
- Click on **Authentication** → **Email Templates**

### 2. Edit Confirmation Email Template

Replace the default template with:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        background-color: #0a0a0a;
        color: #e5e2e1;
        line-height: 1.6;
        padding: 20px;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        background-color: #121212;
        border: 1px solid rgba(77, 70, 58, 0.4);
        border-radius: 8px;
        padding: 40px;
        text-align: center;
      }
      .header {
        margin-bottom: 40px;
      }
      .logo {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 0.35em;
        color: #e5e2e1;
        text-transform: uppercase;
        margin-bottom: 30px;
      }
      .logo-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #c8a96a;
      }
      h1 {
        font-size: 28px;
        font-weight: 300;
        color: #e5e2e1;
        margin: 0 0 20px 0;
      }
      .subtitle {
        font-size: 14px;
        color: #d0c5bb;
        margin-bottom: 40px;
      }
      .button {
        display: inline-block;
        background-color: #c8a96a;
        color: #0a0a0a;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        margin: 30px 0;
        transition: background-color 0.3s;
      }
      .button:hover {
        background-color: #e5c483;
      }
      .code-section {
        background-color: #1c1b1b;
        border: 1px solid rgba(77, 70, 58, 0.4);
        border-radius: 4px;
        padding: 20px;
        margin: 30px 0;
      }
      .code {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        color: #c8a96a;
        word-break: break-all;
      }
      .footer {
        font-size: 12px;
        color: #8b8680;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid rgba(77, 70, 58, 0.2);
      }
      .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200, 169, 106, 0.3), transparent);
        margin: 30px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">
          <div class="logo-dot"></div>
          Capsul Tunisia
        </div>
        <h1>Verify Your Account</h1>
        <p class="subtitle">Welcome to your space collection</p>
      </div>

      <p style="color: #d0c5bb; margin: 20px 0; font-size: 14px;">
        Thanks for signing up! Click the button below to verify your email and start saving your favorite locations.
      </p>

      <a href="{{ .ConfirmationURL }}" class="button">Verify Email</a>

      <div class="code-section">
        <p style="font-size: 12px; color: #8b8680; margin: 0 0 10px 0;">Or copy this code:</p>
        <div class="code">{{ .Token }}</div>
      </div>

      <div class="divider"></div>

      <div class="footer">
        <p style="margin: 10px 0; color: #8b8680;">
          This link expires in 24 hours
        </p>
        <p style="margin: 10px 0; color: #8b8680;">
          If you didn't create this account, please ignore this email
        </p>
        <p style="margin: 20px 0 0 0; color: #6b6660; font-size: 11px;">
          Capsul Studios • Tunisia
        </p>
      </div>
    </div>
  </body>
</html>
```

### 3. Apply Template
- Click **Save** to apply the new template
- All new signup verification emails will use this template

## Features
✓ Dark theme matching your app design  
✓ Gold accent colors (Capsul branding)  
✓ Mobile-responsive layout  
✓ Clear call-to-action button  
✓ Fallback code for manual verification  
✓ Security notes about link expiration  

## Testing
1. Create a test account with an email you control
2. Check the verification email arrives
3. Test both the button link and manual code entry

## Template Variables
- `{{ .ConfirmationURL }}` — Direct verification link
- `{{ .Token }}` — Verification token (if user needs to enter manually)
- `{{ .SiteURL }}` — Your app's base URL (optional to add anywhere)
