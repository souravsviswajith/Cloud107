import pytest
from runtime.plugins.manager import PluginManager

def test_plugin_manager():
    manager = PluginManager()
    assert manager.load_plugin("test_plugin", {"enabled": True}) is True
    status = manager.get_plugin_status()
    assert len(status) == 1
    assert status[0]["name"] == "test_plugin"
    assert status[0]["status"] == "loaded"
    assert manager.unload_plugin("test_plugin") is True
