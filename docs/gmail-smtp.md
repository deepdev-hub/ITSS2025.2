# Gmail SMTP sender for forgot password

The forgot-password flow sends a 6-digit OTP from a Gmail sender account.

## One-time Gmail setup

1. Create a dedicated Gmail account for the system, for example `vbas.rescue.noreply@gmail.com`.
2. Enable 2-Step Verification for that account.
3. Create a 16-character App Password for SMTP access. Do not use the normal Gmail login password.

## Local backend setup

Run this from the repository root:

```powershell
.\scripts\setup-gmail-smtp.ps1
```

The script asks for the Gmail sender address and App Password, then writes a local `.env` file:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=vbas.rescue.noreply@gmail.com
MAIL_PASSWORD=<gmail-app-password>
MAIL_FROM=VBAS Rescue <vbas.rescue.noreply@gmail.com>
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
```

The `.env` file is ignored by Git. Never commit a Gmail App Password.

After creating `.env`, restart the backend:

```powershell
.\mvnw.cmd spring-boot:run
```

## Team members after pulling the code

Each developer must create their own local `.env` or receive the shared sender account App Password through a private channel. The code in GitHub does not include secrets.
