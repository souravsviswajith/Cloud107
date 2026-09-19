import logging

logger = logging.getLogger(__name__)

class SecurityValidator:
    ALLOWED_COMMANDS = [
        "launch_application",
        "kill_application",
        "screenshot",
        "read_clipboard",
        "write_clipboard",
        "upload_file",
        "download_file",
        "manage_window",
        "shutdown_agent",
        "restart_agent"
    ]

    @staticmethod
    def is_valid_command(cmd_type: str) -> bool:
        if cmd_type not in SecurityValidator.ALLOWED_COMMANDS:
            logger.warning(f"Rejected unknown or unauthorized command: {cmd_type}")
            return False
        return True
