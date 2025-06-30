document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA ---
    // This is where you would fetch data from your real uptime tracker API.
    // For now, we'll use this placeholder data.
    const servers = [
        {
            name: 'Minecraft Survival',
            game: 'Minecraft',
            ip: '192.168.1.100:25565',
            status: 'Online'
        },
        {
            name: 'Valheim Wilderness',
            game: 'Valheim',
            ip: '192.168.1.100:2456',
            status: 'Online'
        },
        {
            name: 'Plex Media Server',
            game: 'Utility',
            ip: '192.168.1.100:32400',
            status: 'Offline'
        },
        {
            name: 'CS:GO Retakes',
            game: 'Counter-Strike',
            ip: '192.168.1.100:27015',
            status: 'Starting'
        },
        {
            name: 'Development Server',
            game: 'Utility',
            ip: 'localhost:8080',
            status: 'Online'
        },
    ];

    // --- DOM Elements ---
    const serverGrid = document.getElementById('serverGrid');
    const statusSummary = document.getElementById('statusSummary');
    const lastUpdated = document.getElementById('lastUpdated');
    const template = document.getElementById('server-card-template');

    /**
     * Renders all server cards to the page.
     */
    function renderServers() {
        // Clear the grid before rendering
        serverGrid.innerHTML = '';

        let onlineCount = 0;

        servers.forEach(server => {
            const card = template.content.cloneNode(true);
            
            const serverCard = card.querySelector('.server-card');
            const gameEl = card.querySelector('.server-card__game');
            const statusTextEl = card.querySelector('.status-text');
            const nameEl = card.querySelector('.server-card__name');
            const ipEl = card.querySelector('.ip-address');
            const copyBtn = card.querySelector('.copy-ip-btn');

            // Set data attribute for CSS styling
            serverCard.dataset.status = server.status;

            // Populate the card with data
            gameEl.textContent = server.game;
            statusTextEl.textContent = server.status;
            nameEl.textContent = server.name;
            ipEl.textContent = server.ip;
            
            if (server.status === 'Online') {
                onlineCount++;
            }

            // Add event listener for the copy button
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(server.ip).then(() => {
                    copyBtn.title = 'Copied!';
                    setTimeout(() => { copyBtn.title = 'Copy IP Address'; }, 2000);
                });
            });

            serverGrid.appendChild(card);
        });
        
        // Update the summary text
        statusSummary.innerHTML = `<strong>${onlineCount}</strong> of <strong>${servers.length}</strong> servers are currently online.`;
        
        // Update the timestamp
        lastUpdated.textContent = new Date().toLocaleTimeString();
    }

    // Initial render
    renderServers();

    // --- IMPORTANT ---
    // The line below simulates refreshing the data every 10 seconds.
    // In a real application, you would replace this with a `fetch` call to your API inside the interval.
    // For example:
    // setInterval(() => {
    //   fetch('http://your-uptime-api/status')
    //     .then(response => response.json())
    //     .then(data => {
    //       // Here, you would update the `servers` array with the new `data`
    //       // and then call renderServers() again.
    //       servers = data;
    //       renderServers();
    //     });
    // }, 10000); // 10000ms = 10 seconds

    console.log("Server Dashboard Initialized.");
});