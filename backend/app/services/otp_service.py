"""
OTP generation and SMS delivery service.
TODO: integrate an SMS/OTP provider (e.g. MSG91, Twilio Verify).
"""


def generate_otp(phone: str) -> str:
    raise NotImplementedError


def send_otp_sms(phone: str, otp_code: str) -> None:
    raise NotImplementedError


def verify_otp(phone: str, otp_code: str) -> bool:
    raise NotImplementedError
