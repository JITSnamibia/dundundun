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
            if (isFirstLoad) this.setLoading(true);

            try {
                const servers = await fetchServerData();
                this.render(servers, isFirstLoad);
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
            if (isLoading) this.elements.errorState.style.display = 'none';
        },

        setError(hasError) {
            this.elements.errorState.style.display = hasError ? 'block' : 'none';
        },

        render(servers, isFirstLoad) {
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
            
            serverCardEl.addEventListener('click', (e) => {
                // Prevent flipping if a button on the back is clicked
                if (e.target.classList.contains('btn-flip')) {
                     cardContainerEl.classList.remove('is-flipped');
                } else if (e.target.closest('.card__front')) {
                    // Only flip if the front of the card is clicked
                    cardContainerEl.classList.add('is-flipped');
                }
            });

            this.elements.serverGrid.appendChild(cardTemplate);
            
            const cpuCanvas = serverCardEl.querySelector('.cpu-chart');
            const ramCanvas = serverCardEl.querySelector('.ram-chart');
            const chartColors = this.getChartColors(server.status);
            const cpuChart = this.createChart(cpuCanvas, chartColors);
            const ramChart = this.createChart(ramCanvas, chartColors);
            
            this.charts.set(server.vmid, { cpuChart, ramChart, serverCardEl });
            this.updateServerCard(server.vmid, server);
        },

        updateServerCard(vmid, serverData) {
            const { cpuChart, ramChart, serverCardEl } = this.charts.get(vmid);
            
            serverCardEl.dataset.status = serverData.status;
            serverCardEl.querySelector('.server-card__type').textContent = `${serverData.type.toUpperCase()} (ID: ${vmid})`;
            serverCardEl.querySelector('.status-text').textContent = serverData.status;
            serverCardEl.querySelector('.server-card__name').textContent = serverData.name;
            serverCardEl.querySelector('.uptime').textContent = this.formatUptime(serverData.uptime);

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
s        },

        getChartColors(status) {
            const rootStyles = getComputedStyle(document.documentElement);
            const onlineColor = rootStyles.getPropertyValue('--status-online').trim();
            const offlineColor = rootStyles.getPropertyValue('--status-offline').trim();
            if (status === 'running') {
                return { borderColor: onlineColor, backgroundColor: 'rgba(0, 255, 157, 0.1)' };
            }
            return { borderColor: offlineColor, backgroundColor: 'rgba(255, 77, 77, 0.1)' };
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