/**
 * @file api.js
 * @description This file simulates fetching data from a Proxmox server API.
 * LATER, YOU WILL REPLACE THE MOCK DATA LOGIC WITH A REAL `fetch` CALL.
 */

// This is mock data structured like the Proxmox API might return.
// 'cpu' is a value from 0 to 1 (e.g., 0.75 = 75%).
// 'mem' and 'maxmem' are in bytes.
const mockServerData = [
    { vmid: 101, name: 'Minecraft-Survival', status: 'running', type: 'qemu', cpu: 0.75, mem: 4294967296, maxmem: 8589934592, uptime: 723600 },
    { vmid: 102, name: 'Valheim-Wilderness', status: 'running', type: 'qemu', cpu: 0.40, mem: 3221225472, maxmem: 4294967296, uptime: 180000 },
    { vmid: 201, name: 'Plex-Media-Server', status: 'stopped', type: 'lxc', cpu: 0, mem: 0, maxmem: 2147483648, uptime: 0 },
    { vmid: 202, name: 'AdGuard-DNS', status: 'running', type: 'lxc', cpu: 0.05, mem: 268435456, maxmem: 536870912, uptime: 2592000 },
    { vmid: 103, name: 'CSGO-Retakes-VM', status: 'running', type: 'qemu', cpu: 0.95, mem: 2147483648, maxmem: 2147483648, uptime: 3600 },
];

/**
 * Fetches server status data.
 * Currently returns a Promise with mock data to simulate a real API call.
 * @returns {Promise<Array<Object>>} A promise that resolves with the server data.
 */
export function fetchServerData() {
    console.log("Fetching server data... (simulated)");

    return new Promise((resolve, reject) => {
        // Simulate a network delay of 1 second.
        setTimeout(() => {
            // To test the error state, you can uncomment the next line:
            // reject(new Error("Failed to connect to Proxmox API."));
            
            resolve(mockServerData);
        }, 1000);

        /*
            *** HOW TO MAKE THIS REAL ***
            When you're ready, replace the entire Promise block above with this:

            return fetch('http://YOUR_PROXMOX_IP:8006/api2/json/nodes/YOUR_NODE/qemu', {
                method: 'GET',
                headers: {
                    'Authorization': 'PVEAPIToken=YOUR_USER@pve!YOUR_TOKEN_ID=YOUR_TOKEN_SECRET'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => data.data); // The actual VM list is in the 'data' property
        */
    });
}