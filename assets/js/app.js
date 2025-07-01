import { DEVICE_TYPES, addDevice, connectDevices, placedDevices, connections, resetGame, getDeviceById } from './api.js';

const gridSize = 60;
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

let draggingDevice = null;
let dragOffset = { x: 0, y: 0 };
let selectedDeviceId = null;
let connectMode = false;
let connectFromId = null;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#eee';
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawDevices() {
  for (const device of placedDevices) {
    ctx.fillStyle = device.color;
    ctx.beginPath();
    ctx.arc(device.x, device.y, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = selectedDeviceId === device.id ? '#000' : '#333';
    ctx.lineWidth = selectedDeviceId === device.id ? 4 : 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(device.name, device.x, device.y + 5);
  }
}

function drawConnections() {
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  for (const conn of connections) {
    const d1 = getDeviceById(conn.from);
    const d2 = getDeviceById(conn.to);
    if (d1 && d2) {
      ctx.beginPath();
      ctx.moveTo(d1.x, d1.y);
      ctx.lineTo(d2.x, d2.y);
      ctx.stroke();
    }
  }
}

function redraw() {
  drawGrid();
  drawConnections();
  drawDevices();
}

function snapToGrid(x, y) {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  for (const device of placedDevices) {
    const dx = mouse.x - device.x;
    const dy = mouse.y - device.y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
      draggingDevice = device;
      dragOffset = { x: dx, y: dy };
      selectedDeviceId = device.id;
      redraw();
      return;
    }
  }
  selectedDeviceId = null;
  redraw();
});

canvas.addEventListener('mousemove', e => {
  if (draggingDevice) {
    const rect = canvas.getBoundingClientRect();
    const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const snapped = snapToGrid(mouse.x - dragOffset.x, mouse.y - dragOffset.y);
    draggingDevice.x = snapped.x;
    draggingDevice.y = snapped.y;
    redraw();
  }
});

canvas.addEventListener('mouseup', e => {
  draggingDevice = null;
});

canvas.addEventListener('dblclick', e => {
  if (selectedDeviceId && connectMode) {
    if (connectFromId && connectFromId !== selectedDeviceId) {
      connectDevices(connectFromId, selectedDeviceId);
      connectFromId = null;
      connectMode = false;
      redraw();
    } else {
      connectFromId = selectedDeviceId;
    }
  }
});

document.getElementById('reset-btn').onclick = () => {
  resetGame();
  selectedDeviceId = null;
  connectFromId = null;
  connectMode = false;
  redraw();
};

document.getElementById('connect-btn').onclick = () => {
  if (selectedDeviceId) {
    connectMode = true;
    connectFromId = selectedDeviceId;
  }
};

function createInventory() {
  const inv = document.getElementById('inventory');
  inv.innerHTML = '';
  for (const type of DEVICE_TYPES) {
    const btn = document.createElement('button');
    btn.className = 'inv-btn';
    btn.style.background = type.color;
    btn.textContent = type.name;
    btn.onclick = () => {
      const id = 'dev-' + Math.random().toString(36).substr(2, 9);
      addDevice({
        id,
        type: type.type,
        name: type.name,
        color: type.color,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200
      });
      redraw();
    };
    inv.appendChild(btn);
  }
}

window.onload = () => {
  createInventory();
  redraw();
};
import { fetchServerData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    const app = {
        userRole: sessionStorage.getItem('userRole') || 'viewer',
        
        elements: {
            serverGrid: document.getElementById('serverGrid'),
            lastUpdated: document.getElementById('lastUpdated'),
            template: document.getElementById('server-card-template'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorState: document.getElementById('errorState'),
            refreshBtn: document.getElementById('refreshBtn'),
            hostStatusPanel: document.getElementById('hostStatusPanel'),
            hostCpuFill: document.getElementById('hostCpuFill'),
            hostCpuValue: document.getElementById('hostCpuValue'),
            hostMemFill: document.getElementById('hostMemFill'),
            hostMemValue: document.getElementById('hostMemValue'),
            hostStorageFill: document.getElementById('hostStorageFill'),
            hostStorageValue: document.getElementById('hostStorageValue'),
            headerContainer: document.querySelector('.header__container'),
        },

        charts: new Map(),

        init() {
            document.body.dataset.role = this.userRole;
            this.elements.refreshBtn.addEventListener('click', () => this.loadData());
            this.addLogoutButton();
            this.loadData();
            setInterval(() => this.loadData(), 5000);
        },
        
        addLogoutButton() {
            if (this.userRole === 'admin') {
                const logoutBtn = document.createElement('button');
                logoutBtn.textContent = 'Logout';
                logoutBtn.className = 'btn-logout';
                logoutBtn.addEventListener('click', () => {
                    sessionStorage.removeItem('userRole');
                    window.location.href = 'login.html';
                });
                this.elements.headerContainer.appendChild(logoutBtn);
            }
        },

        async loadData() {
            const isFirstLoad = !this.charts.size;
            if (isFirstLoad) this.setLoading(true);

            try {
                const { servers, host } = await fetchServerData();
                this.renderHostStatus(host);
                this.renderServerCards(servers);
                this.setError(false);
            } catch (error) {
                console.error("Error fetching server data:", error);
                this.setError(true);
            } finally {
                if (isFirstLoad) this.setLoading(false);
            }
        },
        
        setLoading(isLoading) {
            this.elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
            this.elements.serverGrid.style.display = isLoading ? 'none' : 'grid';
            this.elements.hostStatusPanel.style.display = isLoading ? 'none' : 'grid';
            if (isLoading) this.elements.errorState.style.display = 'none';
        },

        setError(hasError) {
            this.elements.errorState.style.display = hasError ? 'block' : 'none';
        },

        renderHostStatus(host) {
            const memUsage = host.memory.used / host.memory.total;
            const storageUsage = host.storage.used / host.storage.total;

            this.elements.hostCpuFill.style.width = `${host.cpu * 100}%`;
            this.elements.hostCpuValue.textContent = `${(host.cpu * 100).toFixed(1)}%`;
            this.elements.hostMemFill.style.width = `${memUsage * 100}%`;
            this.elements.hostMemValue.textContent = `${(host.memory.used / 1024**3).toFixed(1)} / ${(host.memory.total / 1024**3).toFixed(1)} GB`;
            this.elements.hostStorageFill.style.width = `${storageUsage * 100}%`;
            this.elements.hostStorageValue.textContent = `${(host.storage.used / 1024**3).toFixed(1)} / ${(host.storage.total / 1024**3).toFixed(1)} GB`;
        },

        renderServerCards(servers) {
            servers.forEach((server, index) => {
                if (!this.charts.has(server.vmid)) {
                    this.createServerCard(server, index);
                }
                this.updateServerCard(server.vmid, server);
            });
            this.elements.lastUpdated.textContent = new Date().toLocaleTimeString();
        },

        createServerCard(server, index) {
            const cardTemplate = this.elements.template.content.cloneNode(true);
            const cardContainerEl = cardTemplate.querySelector('.card-container');
            
            cardContainerEl.style.setProperty('--animation-delay', `${index * 100}ms`);

            if (this.userRole === 'admin') {
                this.addCardEventListeners(cardContainerEl, server);
            }
            
            this.elements.serverGrid.appendChild(cardTemplate);
            
            const cpuCanvas = cardContainerEl.querySelector('.cpu-chart');
            const ramCanvas = cardContainerEl.querySelector('.ram-chart');
            const cpuChart = this.createChart(cpuCanvas);
            const ramChart = this.createChart(ramCanvas);
            
            this.charts.set(server.vmid, { cpuChart, ramChart, cardContainerEl });
        },

        addCardEventListeners(container, server) {
            container.addEventListener('click', (e) => {
                if (e.target.closest('.card__front')) {
                    container.classList.add('is-flipped');
                } else if (e.target.closest('.btn-flip')) {
                    container.classList.remove('is-flipped');
                }
            });

            container.querySelectorAll('.vm-control-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleVmControl(server.vmid, btn);
                });
            });
        },

        handleVmControl(vmid, button) {
            const { cardContainerEl } = this.charts.get(vmid);
            const statusEl = cardContainerEl.querySelector('.vm-controls-status');
            const allButtons = cardContainerEl.querySelectorAll('.vm-control-btn');
            
            const action = button.textContent;
            statusEl.textContent = `Sending '${action}' command...`;
            button.classList.add('loading');
            allButtons.forEach(b => b.disabled = true);
            
            setTimeout(() => {
                button.classList.remove('loading');
                statusEl.textContent = `Command sent! Refreshing...`;
                setTimeout(() => this.loadData(), 2000);
            }, 1500);
        },

        updateServerCard(vmid, serverData) {
            const { cpuChart, ramChart, cardContainerEl } = this.charts.get(vmid);
            const serverCardEl = cardContainerEl.querySelector('.server-card');
            
            serverCardEl.dataset.status = serverData.status;
            
            serverCardEl.querySelector('.server-card__type').textContent = `${serverData.type.toUpperCase()} (ID: ${vmid})`;
            serverCardEl.querySelector('.status-text').textContent = serverData.status;
            serverCardEl.querySelector('.server-card__name').textContent = serverData.name;
            serverCardEl.querySelector('.uptime').textContent = this.formatUptime(serverData.uptime);

            if(this.userRole === 'admin') {
                serverCardEl.querySelector('.detail-ip').textContent = serverData.ip;
                serverCardEl.querySelector('.detail-cores').textContent = serverData.maxcpu;
                serverCardEl.querySelector('.detail-memory').textContent = `${(serverData.maxmem / 1024**3).toFixed(1)} GB`;
                
                const isRunning = serverData.status === 'running';
                serverCardEl.querySelector('.btn-start').disabled = isRunning;
                serverCardEl.querySelector('.btn-stop').disabled = !isRunning;
                serverCardEl.querySelector('.btn-reboot').disabled = !isRunning;
            }

            const chartColors = this.getChartColors(serverData.status);
            this.updateChartData(cpuChart, serverData.cpu, chartColors);
            this.updateChartData(ramChart, serverData.mem / serverData.maxmem, chartColors);
        },
        
        createChart(canvas) {
            return new Chart(canvas, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{ data: Array(20).fill(0), fill: true, borderWidth: 2, tension: 0.4, pointRadius: 0 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 1.05, display: false }, x: { display: false } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    animation: { duration: 400 }
                }
            });
        },
        
        updateChartData(chart, data, colors) {
            const dataArray = chart.data.datasets[0].data;
            dataArray.push(data);
            dataArray.shift();
            chart.data.datasets[0].borderColor = colors.borderColor;
            chart.data.datasets[0].backgroundColor = colors.backgroundColor;
            chart.update('quiet');
        },

        getChartColors(status) {
            const rootStyles = getComputedStyle(document.documentElement);
            const onlineColor = rootStyles.getPropertyValue('--status-online').trim();
            const offlineColor = rootStyles.getPropertyValue('--status-offline').trim();
            if (status === 'running') {
                return { borderColor: onlineColor, backgroundColor: 'rgba(0, 255, 157, 0.1)' };
            }
            return { borderColor: offlineColor, backgroundColor: 'rgba(136, 136, 136, 0.1)' };
        },

        formatUptime(seconds) {
            if (seconds === 0) return 'Offline';
            const d = Math.floor(seconds / (3600*24));
            const h = Math.floor(seconds % (3600*24) / 3600);
            const m = Math.floor(seconds % 3600 / 60);
            let result = '';
            if (d > 0) result += `${d}d `;
            if (h > 0) result += `${h}h `;
            if (m > 0 && d === 0) result += `${m}m`;
            return result.trim() || 'Just now';
        },
    };

    app.init();
});