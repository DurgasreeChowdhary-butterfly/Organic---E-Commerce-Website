"""
Email/SMS/push notification service for order updates, OTPs, marketing.
TODO: implement provider integration (e.g. SES, SendGrid).
"""


def send_order_confirmation_email(order_id: str) -> None:
    raise NotImplementedError


def send_order_status_update(order_id: str) -> None:
    raise NotImplementedError


def send_low_stock_alert(product_id: str) -> None:
    raise NotImplementedError
