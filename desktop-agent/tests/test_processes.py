import pytest
from agent.processes.manager import ProcessManager

def test_get_running_processes():
    processes = ProcessManager.get_running_processes()
    assert len(processes) > 0
    assert "pid" in processes[0]
    assert "name" in processes[0]
