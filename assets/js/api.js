/**
 * @file api.js
 * @description This file simulates fetching data from a Proxmox server API.
 * This version simulates fluctuating resource usage for the graphs.
 */

const mockServerData = [
    { vmid: 101, name: 'Minecraft-Survival', status: 'running', type: 'qemu', maxcpu: 4, maxmem: 8589934592, uptime: 723600 },
    { vmid: 102, name: 'Valheim-Wilderness', status: 'running', type: 'qemu', maxcpu: 2, maxmem: 4294967296, uptime: 180000 },
    { vmid: 201, name: 'Plex-Media-Server', status: 'stopped', type: 'lxc', maxcpu: 2, maxmem: 2147483648, uptime: 0 },
    { vmid: 202, name: 'AdGuard-DNS', status: 'running', type: 'lxc', maxcpu: 1, maxmem: 536870912, uptime: 2592000 },
    { vmid: 103, name: 'CSGO-Retakes-VM', status: 'running', type: 'qemu', maxcpu: 4, maxmem: 2147483648, uptime: 3600 },
];

/**
 * Generates randomized resource usage data for a more dynamic simulation.
 */
function getSimulatedUsage(server) {
    if (server.status !== 'running') {
        return { cpu: 0, mem: 0 };
    }
    // Simulate some realistic-looking random data
    const cpu = Math.random() * 0.6 + 0.1; // CPU usage between 10% and 70%
    const mem = Math.random() * (server.maxmem * 0.8) + (server.maxmem * 0.1); // RAM between 10% and 90%
    return { cpu, mem };
}

/**
 * Fetches server status data.
 * @returns {Promise<Array<Object>>} A promise that resolves with the server data.
 */
export function fetchServerData() {
    console.log("Fetching server data... (simulated)");

    return new Promise((resolve) => {
        setTimeout(() => {
            // Add simulated usage to each server
            const dataWithUsage = mockServerData.map(server => ({
                ...server,
                ...getSimulatedUsage(server)
            }));
            resolve(dataWithUsage);
        }, 800); // Simulate a network delay
    });
}