import pytest
from runtime.policy.engine import PolicyEngine

def test_policy_engine():
    engine = PolicyEngine()
    engine.update_policies({"blocked_apps": ["calc.exe"]})
    assert not engine.validate_action("launch_app", {"app_name": "calc.exe"})
    assert engine.validate_action("launch_app", {"app_name": "notepad.exe"})
