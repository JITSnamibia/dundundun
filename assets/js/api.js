/**
 * @file api.js
 * @description Game logic and device definitions for the network-building game prototype.
 */

// Device types for the game
export const DEVICE_TYPES = [
  { type: 'computer', name: 'Computer', color: '#4caf50' },
  { type: 'server', name: 'Server', color: '#2196f3' },
  { type: 'switch', name: 'Switch', color: '#ff9800' },
  { type: 'router', name: 'Router', color: '#9c27b0' }
];

// Game state (in-memory for now)
export let placedDevices = [];
export let connections = [];

export function addDevice(device) {
  placedDevices.push(device);
}

export function connectDevices(id1, id2) {
  connections.push({ from: id1, to: id2 });
}

export function resetGame() {
  placedDevices = [];
  connections = [];
}

// Utility to get device by id
export function getDeviceById(id) {
  return placedDevices.find(d => d.id === id);
}