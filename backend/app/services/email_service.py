"""Transactional email delivery via Resend."""
import logging

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def _password_reset_html(*, full_name: str, reset_url: str, expires_in_minutes: int) -> str:
    return f"""
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f1e8;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:#2f4a3c;padding:28px 32px;text-align:center;">
                <span style="color:#e8c979;font-size:22px;font-weight:bold;letter-spacing:0.5px;">Prakruti Organics</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 24px 32px;color:#2f4a3c;">
                <h1 style="font-size:20px;margin:0 0 16px 0;">Reset your password</h1>
                <p style="font-size:15px;line-height:1.6;color:#5c4a3a;margin:0 0 16px 0;">
                  Hi {full_name},
                </p>
                <p style="font-size:15px;line-height:1.6;color:#5c4a3a;margin:0 0 24px 0;">
                  We received a request to reset the password for your Prakruti Organics account. Click the button below to choose a new password.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
                  <tr>
                    <td style="border-radius:999px;background-color:#2f4a3c;">
                      <a href="{reset_url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:999px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="font-size:13px;line-height:1.6;color:#8a7a6a;margin:0 0 16px 0;">
                  This link will expire in {expires_in_minutes} minutes. If the button above doesn't work, copy and paste this URL into your browser:
                </p>
                <p style="font-size:12px;line-height:1.6;color:#a08e6a;word-break:break-all;margin:0 0 24px 0;">
                  <a href="{reset_url}" style="color:#6a8f5b;">{reset_url}</a>
                </p>
                <p style="font-size:13px;line-height:1.6;color:#8a7a6a;margin:0;">
                  If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f5f1e8;text-align:center;">
                <p style="font-size:12px;color:#a08e6a;margin:0;">&copy; Prakruti Organics. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def send_password_reset_email(*, to_email: str, full_name: str, reset_url: str, expires_in_minutes: int) -> None:
    """Send the branded password-reset email via Resend.

    Raises on API failure so the caller can log it — but the caller must
    never let that failure change the generic response returned to the
    client, or it would leak whether the email address exists.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not configured; skipping password reset email to %s", to_email)
        return

    resend.Emails.send({
        "from": settings.MAIL_FROM,
        "to": [to_email],
        "subject": "Reset your Prakruti Organics password",
        "html": _password_reset_html(
            full_name=full_name, reset_url=reset_url, expires_in_minutes=expires_in_minutes
        ),
    })
