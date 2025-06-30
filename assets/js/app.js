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

        // A new map to store our chart instances so we can update them
        charts: new Map(),

        init() {
            this.elements.refreshBtn.addEventListener('click', () => this.loadData());
            this.loadData();
            setInterval(() => this.loadData(), 5000); // Refresh every 5 seconds for smoother graphs
        },
        
        async loadData() {
            // If it's the first load, show the main spinner
            if (this.charts.size === 0) {
                this.setLoading(true);
            }

            try {
                const servers = await fetchServerData();
                this.render(servers);
                this.setError(false);
            } catch (error) {
                console.error("Error fetching server data:", error);
                this.setError(true);
            } finally {
                this.setLoading(false);
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

        render(servers) {
            servers.forEach(server => {
                const vmid = server.vmid;
                const serverExists = this.charts.has(vmid);

                if (!serverExists) {
                    this.createServerCard(server);
                } else {
                    this.updateChart(vmid, server);
                }
            });
            this.elements.lastUpdated.textContent = new Date().toLocaleTimeString();
        },

        createServerCard(server) {
            const card = this.elements.template.content.cloneNode(true);
            const serverCard = card.querySelector('.server-card');
            
            serverCard.dataset.vmid = server.vmid;
            
            const cpuCanvas = card.querySelector('.cpu-chart');
            const ramCanvas = card.querySelector('.ram-chart');
            
            this.elements.serverGrid.appendChild(card);
            
            const cpuChart = this.createChart(cpuCanvas, 'CPU Usage');
            const ramChart = this.createChart(ramCanvas, 'Memory');
            
            this.charts.set(server.vmid, { cpuChart, ramChart, serverCard });
            this.updateChart(server.vmid, server);
        },

        updateChart(vmid, serverData) {
            const { cpuChart, ramChart, serverCard } = this.charts.get(vmid);
            
            // Update text content
            serverCard.dataset.status = serverData.status;
            serverCard.querySelector('.server-card__type').textContent = `${serverData.type.toUpperCase()} (ID: ${vmid})`;
            serverCard.querySelector('.status-text').textContent = serverData.status;
            serverCard.querySelector('.server-card__name').textContent = serverData.name;
            serverCard.querySelector('.uptime').textContent = this.formatUptime(serverData.uptime);

            // Update chart data
            this.addData(cpuChart, `${(serverData.cpu * 100).toFixed(0)}%`, serverData.cpu);
            this.addData(ramChart, `${(serverData.mem / 1024**3).toFixed(1)}GB`, serverData.mem / serverData.maxmem);
        },
        
        createChart(canvas, label) {
            const chartConfig = {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{
                        label: label,
                        data: Array(20).fill(0),
                        borderColor: 'var(--color-accent)',
                        backgroundColor: 'rgba(0, 255, 157, 0.1)',
                        fill: true,
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1,
                            display: false,
                        },
                        x: {
                            display: false,
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                    },
                    animation: {
                        duration: 250
                    }
                }
            };
            return new Chart(canvas, chartConfig);
        },
        
        addData(chart, label, data) {
            chart.data.datasets[0].data.push(data);
            chart.data.datasets[0].data.shift();
            chart.update();
        },

        formatUptime(seconds) {
            if (seconds === 0) return 'N/A';
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