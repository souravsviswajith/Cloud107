import pytest
from agent.clipboard.manager import ClipboardManager

def test_clipboard_read_write():
    test_str = "CloudWorkspace_Test_String_123"
    assert ClipboardManager.write(test_str) == True
    assert ClipboardManager.read() == test_str
