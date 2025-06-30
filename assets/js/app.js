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
        },

        charts: new Map(),

        init() {
            this.elements.refreshBtn.addEventListener('click', () => this.loadData());
            this.loadData();
            setInterval(() => this.loadData(), 5000);
        },
        
        async loadData() {
            const isFirstLoad = this.charts.size === 0;
            if (isFirstLoad) {
                this.setLoading(true);
            }

            try {
                const servers = await fetchServerData();
                // Pass isFirstLoad to render function for animations
                this.render(servers, isFirstLoad);
                this.setError(false);
            } catch (error) {
                console.error("Error fetching server data:", error);
                this.setError(true);
            } finally {
                if (isFirstLoad) {
                    this.setLoading(false);
                }
            }
        },
        
        setLoading(isLoading) {
            this.elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
            if (isLoading) {
                this.elements.serverGrid.style.display = 'none';
                this.elements.errorState.style.display = 'none';
            } else {
                this.elements.serverGrid.style.display = 'grid';
            }
        },

        setError(hasError) {
            this.elements.errorState.style.display = hasError ? 'block' : 'none';
        },

        render(servers, isFirstLoad) {
            servers.forEach((server, index) => {
                const vmid = server.vmid;
                const serverExists = this.charts.has(vmid);

                if (!serverExists) {
                    // Pass index for animation delay
                    this.createServerCard(server, index);
                } else {
                    this.updateChart(vmid, server);
                }
            });
            this.elements.lastUpdated.textContent = new Date().toLocaleTimeString();
        },

        createServerCard(server, index) {
            const card = this.elements.template.content.cloneNode(true);
            const serverCard = card.querySelector('.server-card');
            
            // NEW: Set staggered animation delay
            serverCard.style.setProperty('--animation-delay', `${index * 100}ms`);
            
            serverCard.dataset.vmid = server.vmid;
            
            const cpuCanvas = card.querySelector('.cpu-chart');
            const ramCanvas = card.querySelector('.ram-chart');
            
            this.elements.serverGrid.appendChild(card);
            
            const chartColors = this.getChartColors(server.status);
            const cpuChart = this.createChart(cpuCanvas, 'CPU Usage', chartColors);
            const ramChart = this.createChart(ramCanvas, 'Memory', chartColors);
            
            this.charts.set(server.vmid, { cpuChart, ramChart, serverCard });
            this.updateChart(server.vmid, server);
        },

        updateChart(vmid, serverData) {
            const { cpuChart, ramChart, serverCard } = this.charts.get(vmid);
            
            serverCard.dataset.status = serverData.status;
            serverCard.querySelector('.server-card__type').textContent = `${serverData.type.toUpperCase()} (ID: ${vmid})`;
            serverCard.querySelector('.status-text').textContent = serverData.status;
            serverCard.querySelector('.server-card__name').textContent = serverData.name;
            serverCard.querySelector('.uptime').textContent = this.formatUptime(serverData.uptime);

            const chartColors = this.getChartColors(serverData.status);
            this.addData(cpuChart, serverData.cpu, chartColors);
            this.addData(ramChart, serverData.mem / serverData.maxmem, chartColors);
        },
        
        createChart(canvas, label, colors) {
            return new Chart(canvas, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{
                        label: label,
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
                backgroundColor: 'rgba(255, 77, 77, 0.1)',
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