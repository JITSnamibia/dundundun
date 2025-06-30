import { fetchServerData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    const app = {
        // --- DOM Elements ---
        elements: {
            serverGrid: document.getElementById('serverGrid'),
            lastUpdated: document.getElementById('lastUpdated'),
            template: document.getElementById('server-card-template'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorState: document.getElementById('errorState'),
            refreshBtn: document.getElementById('refreshBtn'),
        },

        // --- App Initializer ---
        init() {
            this.elements.refreshBtn.addEventListener('click', () => this.loadData());
            this.loadData(); // Initial load
            setInterval(() => this.loadData(), 30000); // Auto-refresh every 30 seconds
        },

        // --- Data Handling & State ---
        loadData() {
            this.setLoading(true);
            fetchServerData()
                .then(servers => {
                    this.render(servers);
                    this.setError(false);
                })
                .catch(error => {
                    console.error("Error fetching server data:", error);
                    this.setError(true);
                })
                .finally(() => {
                    this.setLoading(false);
                });
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

        // --- UI Rendering ---
        render(servers) {
            this.elements.serverGrid.innerHTML = ''; // Clear previous cards

            servers.forEach(server => {
                const card = this.elements.template.content.cloneNode(true);
                const serverCard = card.querySelector('.server-card');
                
                // Set data attributes for styling
                serverCard.dataset.status = server.status;

                // Populate data
                card.querySelector('.server-card__type').textContent = `${server.type.toUpperCase()} (ID: ${server.vmid})`;
                card.querySelector('.status-text').textContent = server.status;
                card.querySelector('.server-card__name').textContent = server.name;
                card.querySelector('.cpu-usage').style.width = `${server.cpu * 100}%`;
                card.querySelector('.ram-usage').style.width = `${(server.mem / server.maxmem) * 100}%`;
                card.querySelector('.uptime').textContent = this.formatUptime(server.uptime);
                
                this.elements.serverGrid.appendChild(card);
            });
            
            this.elements.lastUpdated.textContent = new Date().toLocaleTimeString();
        },

        // --- Helper Utilities ---
        formatUptime(seconds) {
            if (seconds === 0) return 'N/A';
            const d = Math.floor(seconds / (3600*24));
            const h = Math.floor(seconds % (3600*24) / 3600);
            const m = Math.floor(seconds % 3600 / 60);
            
            let result = '';
            if (d > 0) result += `${d}d `;
            if (h > 0) result += `${h}h `;
            if (m > 0 && d === 0) result += `${m}m`; // Only show minutes if less than a day
            return result.trim();
        },
    };

    app.init();
});