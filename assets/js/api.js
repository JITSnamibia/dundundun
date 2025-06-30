/**
 * @file api.js
 * @description Simulates fetching data from a Proxmox server API.
 */

const mockServerData = [
    { vmid: 101, name: 'Minecraft-Survival', status: 'running', type: 'qemu', maxcpu: 4, maxmem: 8589934592, uptime: 723600 },
    { vmid: 102, name: 'Valheim-Wilderness', status: 'running', type: 'qemu', maxcpu: 2, maxmem: 4294967296, uptime: 180000 },
    { vmid: 201, name: 'Plex-Media-Server', status: 'stopped', type: 'lxc', maxcpu: 2, maxmem: 2147483648, uptime: 0 },
    { vmid: 202, name: 'AdGuard-DNS', status: 'running', type: 'lxc', maxcpu: 1, maxmem: 536870912, uptime: 2592000 },
    { vmid: 103, name: 'CSGO-Retakes-VM', status: 'running', type: 'qemu', maxcpu: 4, maxmem: 2147483648, uptime: 3600 },
];

// NEW: Mock data for the host system
const mockHostData = {
    cpu: 0.35, // 35%
    memory: {
        used: 68719476736, // 64GB
        total: 137438953472 // 128GB
    },
    storage: {
        used: 400000000000, // 400GB
        total: 1000000000000 // 1TB
    }
};

function getSimulatedUsage(server) {
    if (server.status !== 'running') return { cpu: 0, mem: 0 };
    return { 
        cpu: Math.random() * 0.7 + 0.1, 
        mem: Math.random() * (server.maxmem * 0.8) + (server.maxmem * 0.1) 
    };
}

/**
 * Fetches status for all VMs/containers and the host.
 * @returns {Promise<{servers: Array<Object>, host: Object}>}
 */
export function fetchServerData() {
    console.log("Fetching all server and host data... (simulated)");

    return new Promise((resolve) => {
        setTimeout(() => {
            const serversWithUsage = mockServerData.map(server => ({
                ...server,
                ...getSimulatedUsage(server)
            }));
            
            // Also simulate slight fluctuations in host data
            const dynamicHostData = {
                ...mockHostData,
                cpu: Math.random() * 0.4 + 0.2, // Simulate host CPU between 20-60%
            };

            resolve({ servers: serversWithUsage, host: dynamicHostData });
        }, 800);
    });
}