const API = {
        equipements: '/api/equipements',
        interventions: '/api/interventions',
        preventifs: '/api/preventifs',
        users: '/api/users'
    };

    let charts = {
        interventionsStatus: null,
        equipementsStatus: null,
        interventionsType: null
    };

    document.addEventListener('DOMContentLoaded', async () => {
        await loadDashboard();
    });

    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('mainContent').classList.toggle('expanded');
        const logoText = document.getElementById('logo-text');
        if (logoText) {
            logoText.style.display = document.getElementById('sidebar').classList.contains('collapsed') ? 'none' : 'inline';
        }
    }

    async function fetchJson(url) {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' }
        });

        const rawText = await response.text();

        if (!response.ok) {
            let message = rawText;
            try {
                const err = JSON.parse(rawText);
                message = err.message || err.error || rawText;
            } catch (_) {}
            throw new Error(message || ('Erreur HTTP ' + response.status));
        }

        if (!rawText) return [];

        try {
            return JSON.parse(rawText);
        } catch (_) {
            return [];
        }
    }

    async function loadDashboard() {
        try {
            const [equipements, interventions, preventifs, users] = await Promise.all([
                fetchJson(API.equipements).catch(() => []),
                fetchJson(API.interventions).catch(() => []),
                fetchJson(API.preventifs).catch(() => []),
                fetchJson(API.users).catch(() => [])
            ]);

            const safeEquipements = Array.isArray(equipements) ? equipements : [];
            const safeInterventions = Array.isArray(interventions) ? interventions : [];
            const safePreventifs = Array.isArray(preventifs) ? preventifs : [];
            const safeUsers = Array.isArray(users) ? users : [];

            renderStats(safeEquipements, safeInterventions, safePreventifs, safeUsers);
            renderCharts(safeEquipements, safeInterventions);
            renderRecentActivity(safeInterventions, safeUsers);
            renderUpcomingPreventifs(safePreventifs);
        } catch (err) {
            document.getElementById('recentActivity').innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
            document.getElementById('upcomingPreventifs').innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
        }
    }

    function renderStats(equipements, interventions, preventifs, users) {
        const equipActifs = equipements.filter(e => ['ACTIF', 'ACTIVE'].includes((e.statut || '').toUpperCase())).length;
        const interventionsEnCours = interventions.filter(i => (i.statut || '').toUpperCase() === 'EN_COURS').length;
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 7);

        const preventifsAVenir = preventifs.filter(p => {
            if (!p.prochaineDate) return false;
            const d = new Date(p.prochaineDate);
            return d >= startOfDay(today) && d <= endOfDay(next7Days);
        }).length;

        const usersActifs = users.filter(u => u.actif === true || (u.statut || '').toUpperCase() === 'ACTIVE').length;

        document.getElementById('statEquipements').textContent = equipements.length;
        document.getElementById('statEquipementsSub').textContent = `${equipActifs} actifs`;

        document.getElementById('statInterventions').textContent = interventions.length;
        document.getElementById('statInterventionsSub').textContent = `${interventionsEnCours} en cours`;

        document.getElementById('statPreventifs').textContent = preventifs.length;
        document.getElementById('statPreventifsSub').textContent = `${preventifsAVenir} dans les 7 jours`;

        document.getElementById('statUsers').textContent = users.length;
        document.getElementById('statUsersSub').textContent = `${usersActifs} actifs`;
    }

    function renderCharts(equipements, interventions) {
        const interventionStatusCounts = countBy(interventions, i => normalizeStatus(i.statut), ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']);
        const equipementStatusCounts = countBy(equipements, e => normalizeEquipStatus(e.statut), ['ACTIF', 'MAINTENANCE', 'HS', 'ARCHIVED']);
        const interventionTypeCounts = countBy(interventions, i => normalizeType(i.type), ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE']);

        destroyChart('interventionsStatus');
        charts.interventionsStatus = new Chart(document.getElementById('interventionsStatusChart'), {
            type: 'doughnut',
            data: {
                labels: ['Planifiée', 'En cours', 'Terminée', 'Annulée'],
                datasets: [{
                    data: [
                        interventionStatusCounts.PLANIFIEE,
                        interventionStatusCounts.EN_COURS,
                        interventionStatusCounts.TERMINEE,
                        interventionStatusCounts.ANNULEE
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        destroyChart('equipementsStatus');
        charts.equipementsStatus = new Chart(document.getElementById('equipementsStatusChart'), {
            type: 'bar',
            data: {
                labels: ['Actif', 'Maintenance', 'HS', 'Archivé'],
                datasets: [{
                    label: 'Équipements',
                    data: [
                        equipementStatusCounts.ACTIF,
                        equipementStatusCounts.MAINTENANCE,
                        equipementStatusCounts.HS,
                        equipementStatusCounts.ARCHIVED
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        destroyChart('interventionsType');
        charts.interventionsType = new Chart(document.getElementById('interventionsTypeChart'), {
            type: 'bar',
            data: {
                labels: ['Corrective', 'Préventive', 'Prédictive'],
                datasets: [{
                    label: 'Interventions',
                    data: [
                        interventionTypeCounts.CORRECTIVE,
                        interventionTypeCounts.PREVENTIVE,
                        interventionTypeCounts.PREDICTIVE
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function renderRecentActivity(interventions, users) {
        const container = document.getElementById('recentActivity');

        if (!interventions.length) {
            container.innerHTML = '<div class="empty-state">Aucune intervention disponible</div>';
            return;
        }

        const userMap = new Map((users || []).map(u => [Number(u.id), u.nom]));

        const sorted = [...interventions].sort((a, b) => {
            const aDate = new Date(a.dateDebut || 0).getTime();
            const bDate = new Date(b.dateDebut || 0).getTime();
            return bDate - aDate;
        }).slice(0, 5);

        container.innerHTML = sorted.map(item => {
            const creator = userMap.get(Number(item.createdById)) || `User #${item.createdById ?? ''}`;
            return `
                <div class="list-item">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                        <div>
                            <div class="fw-semibold">${escapeHtml(item.libele || 'Sans libellé')}</div>
                            <small class="text-muted d-block">${escapeHtml(item.equipementDescription || 'Équipement non renseigné')}</small>
                            <small class="text-muted d-block">Créé par ${escapeHtml(creator)}</small>
                        </div>
                        <span class="mini-badge ${statusBadgeClass(item.statut)}">${escapeHtml(prettyStatus(item.statut))}</span>
                    </div>
                    <small class="text-muted d-block mt-2">${formatDate(item.dateDebut)}</small>
                </div>
            `;
        }).join('');
    }

    function renderUpcomingPreventifs(preventifs) {
        const container = document.getElementById('upcomingPreventifs');

        if (!preventifs.length) {
            container.innerHTML = '<div class="empty-state">Aucun préventif disponible</div>';
            return;
        }

        const sorted = [...preventifs]
            .filter(p => !!p.prochaineDate)
            .sort((a, b) => new Date(a.prochaineDate) - new Date(b.prochaineDate))
            .slice(0, 5);

        if (!sorted.length) {
            container.innerHTML = '<div class="empty-state">Aucune date de préventif renseignée</div>';
            return;
        }

        container.innerHTML = sorted.map(p => `
            <div class="list-item">
                <div class="fw-semibold">${escapeHtml(p.equipementDescription || 'Équipement non renseigné')}</div>
                <small class="text-muted d-block">${escapeHtml(p.typeFrequence || 'Fréquence non renseignée')}</small>
                <small class="text-muted d-block">${formatDate(p.prochaineDate)}</small>
            </div>
        `).join('');
    }

    function countBy(items, keySelector, keys) {
        const result = {};
        keys.forEach(k => result[k] = 0);
        items.forEach(item => {
            const key = keySelector(item);
            if (result[key] !== undefined) {
                result[key] += 1;
            }
        });
        return result;
    }

    function normalizeStatus(value) {
        const v = String(value || '').toUpperCase();
        return ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].includes(v) ? v : 'PLANIFIEE';
    }

    function normalizeEquipStatus(value) {
        const v = String(value || '').toUpperCase();
        if (['ACTIF', 'ACTIVE'].includes(v)) return 'ACTIF';
        if (v === 'MAINTENANCE') return 'MAINTENANCE';
        if (v === 'HS') return 'HS';
        if (v === 'ARCHIVED') return 'ARCHIVED';
        return 'ACTIF';
    }

    function normalizeType(value) {
        const v = String(value || '').toUpperCase();
        return ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE'].includes(v) ? v : 'PREVENTIVE';
    }

    function prettyStatus(value) {
        const v = normalizeStatus(value);
        if (v === 'PLANIFIEE') return 'Planifiée';
        if (v === 'EN_COURS') return 'En cours';
        if (v === 'TERMINEE') return 'Terminée';
        return 'Annulée';
    }

    function statusBadgeClass(value) {
        const v = normalizeStatus(value);
        if (v === 'PLANIFIEE') return 'badge-planifiee';
        if (v === 'EN_COURS') return 'badge-encours';
        if (v === 'TERMINEE') return 'badge-terminee';
        return 'badge-annulee';
    }

    function destroyChart(name) {
        if (charts[name]) {
            charts[name].destroy();
            charts[name] = null;
        }
    }

    function formatDate(value) {
        if (!value) return 'N/A';
        return String(value).replace('T', ' ').slice(0, 16);
    }

    function startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function endOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('mainContent').classList.add('expanded');
    }