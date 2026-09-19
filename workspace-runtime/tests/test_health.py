import pytest
from runtime.health.monitor import HealthMonitor

def test_health_monitor():
    health = HealthMonitor.check_health()
    assert "status" in health
    assert "cpu_percent" in health
    assert "memory_percent" in health
