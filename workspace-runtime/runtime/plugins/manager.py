import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class PluginManager:
    def __init__(self):
        self.plugins: Dict[str, Any] = {}

    def discover_plugins(self):
        # Scan for plugins in plugin directory
        pass

    def load_plugin(self, name: str, config: Dict[str, Any]) -> bool:
        logger.info(f"Loading plugin: {name}")
        self.plugins[name] = {"status": "loaded", "config": config}
        return True

    def unload_plugin(self, name: str) -> bool:
        if name in self.plugins:
            logger.info(f"Unloading plugin: {name}")
            del self.plugins[name]
            return True
        return False
        
    def get_plugin_status(self) -> List[Dict[str, Any]]:
        return [{"name": name, "status": info["status"]} for name, info in self.plugins.items()]
