export class HyperVCommandBuilder {
  static getVM(id: string): string {
    return `Get-VM -Name "${id}" | Select-Object State, Name, Uptime | ConvertTo-Json`;
  }

  static startVM(id: string): string {
    return `Start-VM -Name "${id}"`;
  }

  static stopVM(id: string): string {
    return `Stop-VM -Name "${id}" -Force`;
  }

  static restartVM(id: string): string {
    return `Restart-VM -Name "${id}" -Force`;
  }

  static suspendVM(id: string): string {
    return `Suspend-VM -Name "${id}"`;
  }

  static getVMMetrics(id: string): string {
    return `Measure-VM -Name "${id}" | Select-Object AverageProcessorUsage, AverageMemoryUsage | ConvertTo-Json`;
  }

  static createVM(id: string, name: string): string {
    // Scaffold for VM creation
    return `New-VM -Name "${id}" -Notes "${name}" -MemoryStartupBytes 2GB -BootDevice VHD`;
  }
}
