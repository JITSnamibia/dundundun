import { fetchServerData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    const app = {
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
        },

        charts: new Map(),

        init() {
            this.elements.refreshBtn.addEventListener('click', () => this.loadData());
            this.loadData();
            setInterval(() => this.loadData(), 5000);
        },
        
        async loadData() {
            const isFirstLoad = !this.charts.size;
            if (isFirstLoad) this.setLoading(true);

            try {
                const { servers, host } = await fetchServerData();
                this.renderHostStatus(host);
                this.render(servers);
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

        render(servers) {
            servers.forEach((server, index) => {
                if (!this.charts.has(server.vmid)) {
                    this.createServerCard(server, index);
                } else {
                    this.updateServerCard(server.vmid, server);
                }
            });
            this.elements.lastUpdated.textContent = new Date().toLocaleTimeString();
        },

        createServerCard(server, index) {
            const cardTemplate = this.elements.template.content.cloneNode(true);
            const cardContainerEl = cardTemplate.querySelector('.card-container');
            const serverCardEl = cardTemplate.querySelector('.server-card');
            
            cardContainerEl.style.setProperty('--animation-delay', `${index * 100}ms`);

            this.addCardEventListeners(cardContainerEl, serverCardEl);
            
            this.elements.serverGrid.appendChild(cardTemplate);
            
            const cpuCanvas = serverCardEl.querySelector('.cpu-chart');
            const ramCanvas = serverCardEl.querySelector('.ram-chart');
            const chartColors = this.getChartColors(server.status);
            const cpuChart = this.createChart(cpuCanvas, chartColors);
            const ramChart = this.createChart(ramCanvas, chartColors);
            
            this.charts.set(server.vmid, { cpuChart, ramChart, serverCardEl });
            this.updateServerCard(server.vmid, server);
        },

        addCardEventListeners(container, card) {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card__front') && !e.target.closest('.vm-control-btn')) {
                    container.classList.add('is-flipped');
                }
            });

            const flipBackButton = card.querySelector('.btn-flip');
            flipBackButton.addEventListener('click', () => container.classList.remove('is-flipped'));

            const controlButtons = card.querySelectorAll('.vm-control-btn');
            controlButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card from flipping when a button is clicked
                    this.handleVmControl(card, btn.textContent);
                });
            });
        },

        handleVmControl(card, action) {
            const statusEl = card.querySelector('.vm-controls-status');
            statusEl.textContent = `Sending ${action} command...`;
            
            // Simulate API call
            setTimeout(() => {
                statusEl.textContent = `${action} command sent!`;
                setTimeout(() => statusEl.textContent = '', 2000); // Clear message
            }, 1500);
        },

        updateServerCard(vmid, serverData) {
            const { cpuChart, ramChart, serverCardEl } = this.charts.get(vmid);
            
            serverCardEl.dataset.status = serverData.status;
            serverCardEl.querySelector('.server-card__type').textContent = `${serverData.type.toUpperCase()} (ID: ${vmid})`;
            serverCardEl.querySelector('.status-text').textContent = serverData.status;
            serverCardEl.querySelector('.server-card__name').textContent = serverData.name;
            serverCardEl.querySelector('.uptime').textContent = this.formatUptime(serverData.uptime);

            // Enable/disable buttons based on status
            serverCardEl.querySelector('.btn-start').disabled = serverData.status === 'running';
            serverCardEl.querySelector('.btn-stop').disabled = serverData.status === 'stopped';
            serverCardEl.querySelector('.btn-reboot').disabled = serverData.status === 'stopped';

            const chartColors = this.getChartColors(serverData.status);
            this.addData(cpuChart, serverData.cpu, chartColors);
            this.addData(ramChart, serverData.mem / serverData.maxmem, chartColors);
        },
        
        createChart(canvas, colors) {
            return new Chart(canvas, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{
                        data: Array(20).fill(0),
                        borderColor: colors.borderColor,
                        backgroundColor: colors.backgroundColor,
                        fill: true,
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 1, display: false }, x: { display: false } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    animation: { duration: 400 }
                }
            });
        },
        
        addData(chart, data, colors) {
            chart.data.datasets[0].data.push(data);
            chart.data.datasets[0].data.shift();
            chart.data.datasets[0].borderColor = colors.borderColor;
            chart.data.datasets[0].backgroundColor = colors.backgroundColor;
            chart.update('quiet');
        },

        getChartColors(status) {
            const rootStyles = getComputedStyle(document.documentElement);
            if (status === 'running') {
                return {
                    borderColor: rootStyles.getPropertyValue('--status-online').trim(),
                    backgroundColor: 'rgba(0, 255, 157, 0.1)',
                };
            }
            return {
                borderColor: rootStyles.getPropertyValue('--status-offline').trim(),
                backgroundColor: 'rgba(136, 136, 136, 0.1)',
            };
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