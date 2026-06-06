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

let equipmentsMap = new Map();      // id -> code
let equipmentsDescMap = new Map();  // id -> description

document.addEventListener('DOMContentLoaded', async () => {
    await loadEquipmentsMap();
    await loadDashboard();
});

// ======================== FONCTIONS UTILITAIRES ========================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const logoText = document.getElementById('logo-text');
    if (sidebar) sidebar.classList.toggle('collapsed');
    if (mainContent) mainContent.classList.toggle('expanded');
    if (logoText) logoText.style.display = sidebar?.classList.contains('collapsed') ? 'none' : 'inline';
}

async function fetchJson(url) {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    const rawText = await response.text();
    if (!response.ok) {
        let message = rawText;
        try { const err = JSON.parse(rawText); message = err.message || err.error || rawText; } catch (_) {}
        throw new Error(message || `Erreur HTTP ${response.status}`);
    }
    if (!rawText) return [];
    try { return JSON.parse(rawText); } catch (_) { return []; }
}

async function loadEquipmentsMap() {
    try {
        const data = await fetchJson(API.equipements);
        equipmentsMap.clear();
        equipmentsDescMap.clear();
        if (Array.isArray(data)) {
            data.forEach(equip => {
                equipmentsMap.set(Number(equip.id), equip.code || '');
                equipmentsDescMap.set(Number(equip.id), equip.description || '');
            });
        }
    } catch (err) {
        console.error("Erreur chargement équipements:", err);
    }
}

function getEquipmentCode(id) {
    return equipmentsMap.get(Number(id)) || `Équipement #${id}`;
}

function getEquipmentDesc(id) {
    return equipmentsDescMap.get(Number(id)) || '';
}

function truncateText(text, maxLen) {
    if (!text) return '—';
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '…';
}

function parseDashboardDate(value) {
    if (!value) return null;
    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = value;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(value) {
    if (!value) return 'N/A';
    return String(value).replace('T', ' ').slice(0, 16);
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// ======================== DASHBOARD PRINCIPAL ========================
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

        const filteredInterventions = filterByDashboardPeriod(safeInterventions, 'dateDebut');
        const filteredPreventifs = filterByDashboardPeriod(safePreventifs, 'prochaineDate');

        renderStats(safeEquipements, filteredInterventions, filteredPreventifs, safeUsers);
        renderCharts(safeEquipements, filteredInterventions);
        renderRecentActivity(filteredInterventions, safeUsers);
        renderUpcomingPreventifs(filteredPreventifs);

    } catch (err) {
        document.getElementById('recentActivity').innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
        document.getElementById('upcomingPreventifs').innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
    }
}

function filterByDashboardPeriod(items, dateField) {
    const period = document.getElementById('dashboardPeriodFilter')?.value || 'MONTH';
    const now = new Date();
    let start, end;
    if (period === 'MONTH') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'QUARTER') {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStartMonth, 1);
        end = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999);
    } else if (period === 'YEAR') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
        return items;
    }
    return items.filter(item => {
        const itemDate = parseDashboardDate(item[dateField]);
        return itemDate ? (itemDate >= start && itemDate <= end) : false;
    });
}

// ======================== STATS ========================
function renderStats(equipements, interventions, preventifs, users) {
    const equipActifs = equipements.filter(e => ['ACTIF', 'ACTIVE'].includes((e.statut || '').toUpperCase())).length;
    const interventionsEnCours = interventions.filter(i => (i.statut || '').toUpperCase() === 'EN_COURS').length;
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);
    const preventifsAVenir = preventifs.filter(p => {
        if (!p.prochaineDate) return false;
        const d = new Date(p.prochaineDate);
        return d >= startOfDay(today) && d <= new Date(next7Days.setHours(23,59,59,999));
    }).length;
    const usersActifs = users.filter(u => u.actif === true || (u.statut || '').toUpperCase() === 'ACTIVE').length;

    document.getElementById('statEquipements').textContent = equipements.length;
    document.getElementById('statEquipementsSub').textContent = `${equipActifs} actifs`;
    document.getElementById('statInterventions').textContent = interventions.length;
    document.getElementById('statInterventionsSub').textContent = `${interventionsEnCours} en cours`;
    document.getElementById('statPreventifs').textContent = preventifs.length;
    document.getElementById('statPreventifsSub').textContent = `${preventifsAVenir} dans 7j`;
    document.getElementById('statUsers').textContent = users.length;
    document.getElementById('statUsersSub').textContent = `${usersActifs} actifs`;
}

// ======================== GRAPHIQUES ========================
function renderCharts(equipements, interventions) {
    const interventionStatusKeys = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
    const equipementStatusKeys = ['ACTIF', 'MAINTENANCE', 'HS', 'ARCHIVED'];
    const interventionTypeKeys = ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE'];

    const interventionStatusCounts = countBy(interventions, i => normalizeStatus(i.statut), interventionStatusKeys);
    const equipementStatusCounts = countBy(equipements, e => normalizeEquipStatus(e.statut), equipementStatusKeys);
    const interventionTypeCounts = countBy(interventions, i => normalizeType(i.type), interventionTypeKeys);

    // Donut : statuts interventions
    destroyChart('interventionsStatus');
    charts.interventionsStatus = new Chart(document.getElementById('interventionsStatusChart'), {
        type: 'doughnut',
        data: {
            labels: interventionStatusKeys.map(k => `${labelStatus(k)} (${interventionStatusCounts[k]})`),
            datasets: [{ data: interventionStatusKeys.map(k => interventionStatusCounts[k]), backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'] }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } }, onClick: (e, els) => { if (els.length) goToInterventions(interventionStatusKeys[els[0].index], null); } }
    });

    // Barres : statuts equipements
    destroyChart('equipementsStatus');
    charts.equipementsStatus = new Chart(document.getElementById('equipementsStatusChart'), {
        type: 'bar',
        data: {
            labels: equipementStatusKeys.map(k => `${labelEquipStatus(k)} (${equipementStatusCounts[k]})`),
            datasets: [{ label: 'Équipements', data: equipementStatusKeys.map(k => equipementStatusCounts[k]), backgroundColor: '#667eea' }]
        },
        options: { responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } }, onClick: (e, els) => { if (els.length) goToEquipements(equipementStatusKeys[els[0].index]); } }
    });

    // Barres : types d'interventions
    destroyChart('interventionsType');
    charts.interventionsType = new Chart(document.getElementById('interventionsTypeChart'), {
        type: 'bar',
        data: {
            labels: interventionTypeKeys.map(k => `${labelType(k)} (${interventionTypeCounts[k]})`),
            datasets: [{ label: 'Interventions', data: interventionTypeKeys.map(k => interventionTypeCounts[k]), backgroundColor: '#10b981' }]
        },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } }, onClick: (e, els) => { if (els.length) goToInterventions(null, interventionTypeKeys[els[0].index]); } }
    });
}

function labelStatus(key) {
    const map = { PLANIFIEE: 'Planifiée', EN_COURS: 'En cours', TERMINEE: 'Terminée', ANNULEE: 'Annulée' };
    return map[key] || key;
}
function labelEquipStatus(key) {
    const map = { ACTIF: 'Actif', MAINTENANCE: 'Maintenance', HS: 'HS', ARCHIVED: 'Archivé' };
    return map[key] || key;
}
function labelType(key) {
    const map = { CORRECTIVE: 'Corrective', PREVENTIVE: 'Préventive', PREDICTIVE: 'Prédictive' };
    return map[key] || key;
}

function countBy(items, keySelector, keys) {
    const result = {};
    keys.forEach(k => result[k] = 0);
    items.forEach(item => {
        const key = keySelector(item);
        if (result[key] !== undefined) result[key]++;
    });
    return result;
}

function normalizeStatus(v) {
    const val = String(v || '').toUpperCase();
    return ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].includes(val) ? val : 'PLANIFIEE';
}
function normalizeEquipStatus(v) {
    const val = String(v || '').toUpperCase();
    if (['ACTIF', 'ACTIVE'].includes(val)) return 'ACTIF';
    if (val === 'MAINTENANCE') return 'MAINTENANCE';
    if (val === 'HS') return 'HS';
    if (val === 'ARCHIVED') return 'ARCHIVED';
    return 'ACTIF';
}
function normalizeType(v) {
    const val = String(v || '').toUpperCase();
    return ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE'].includes(val) ? val : 'PREVENTIVE';
}

function destroyChart(name) {
    if (charts[name]) { charts[name].destroy(); charts[name] = null; }
}

// ======================== ACTIVITÉ RÉCENTE ========================
function renderRecentActivity(interventions, users) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    if (!interventions.length) {
        container.innerHTML = '<div class="empty-state">Aucune intervention récente</div>';
        return;
    }
    const userMap = new Map((users || []).map(u => [Number(u.id), u.nom]));
    const sorted = [...interventions]
        .filter(i => !!i.dateDebut)
        .sort((a, b) => (parseDashboardDate(b.dateDebut)?.getTime() || 0) - (parseDashboardDate(a.dateDebut)?.getTime() || 0))
        .slice(0, 5);

    container.innerHTML = sorted.map(item => {
        const codeInterv = escapeHtml(item.codeIntervention || `INT-${item.id}`);
        const equipCode = truncateText(escapeHtml(getEquipmentCode(item.equipementId)), 20);
        const equipDesc = escapeHtml(getEquipmentDesc(item.equipementId));
        const creator = truncateText(escapeHtml(userMap.get(Number(item.createdById)) || `User #${item.createdById ?? ''}`), 25);
        const statusLabel = prettyStatus(item.statut);
        const badgeClass = statusBadgeClass(item.statut);
        return `
            <div class="list-item dashboard-clickable-item" onclick="goToInterventionDetail(${item.id})" title="Ouvrir l'intervention">
                <div class="fw-semibold">
                    <i class="fas fa-hashtag text-primary me-1"></i>${codeInterv}
                    <span class="mini-badge ${badgeClass}">${escapeHtml(statusLabel)}</span>
                </div>
                <div class="text-muted mt-1">
                    <i class="fas fa-tools me-1"></i>${equipCode}
                    ${equipDesc ? `<span class="ms-1" title="${equipDesc}">📄</span>` : ''}
                </div>
                <div class="text-muted"><i class="fas fa-user me-1"></i>${creator}</div>
                <small class="text-muted d-block mt-2"><i class="far fa-calendar-alt me-1"></i>${formatDate(item.dateDebut)}</small>
            </div>
        `;
    }).join('');
}

function prettyStatus(v) {
    const norm = normalizeStatus(v);
    if (norm === 'PLANIFIEE') return 'Planifiée';
    if (norm === 'EN_COURS') return 'En cours';
    if (norm === 'TERMINEE') return 'Terminée';
    return 'Annulée';
}
function statusBadgeClass(v) {
    const norm = normalizeStatus(v);
    if (norm === 'PLANIFIEE') return 'badge-planifiee';
    if (norm === 'EN_COURS') return 'badge-encours';
    if (norm === 'TERMINEE') return 'badge-terminee';
    return 'badge-annulee';
}

// ======================== PRÉVENTIFS À VENIR ========================
function renderUpcomingPreventifs(preventifs) {
    const container = document.getElementById('upcomingPreventifs');
    if (!container) return;
    if (!preventifs.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check fa-2x mb-2 d-block"></i>Aucun préventif programmé</div>';
        return;
    }
    const now = new Date();
    const sorted = [...preventifs]
        .filter(p => !!p.prochaineDate)
        .map(p => ({ ...p, dateObj: new Date(p.prochaineDate) }))
        .filter(p => p.dateObj >= startOfDay(now))
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, 5);

    if (!sorted.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle fa-2x mb-2 d-block"></i>Tout est à jour</div>';
        return;
    }
    container.innerHTML = sorted.map(p => {
        const equipCode = truncateText(escapeHtml(getEquipmentCode(p.equipementId)), 20);
        const equipDesc = escapeHtml(getEquipmentDesc(p.equipementId));
        const freq = truncateText(escapeHtml(p.typeFrequence || 'Fréquence non définie'), 25);
        return `
            <div class="list-item">
                <div class="fw-semibold"><i class="fas fa-tools text-primary me-1"></i>${equipCode}</div>
                <div class="text-muted mt-1"><i class="fas fa-sync-alt me-1"></i>${freq}</div>
                <small class="text-muted d-block mt-2"><i class="far fa-calendar-check me-1"></i>${formatDate(p.prochaineDate)}</small>
            </div>
        `;
    }).join('');
}

// ======================== NAVIGATION ========================
function goToEquipements(status = null) {
    window.location.href = status ? `/equipements-list?status=${encodeURIComponent(status)}` : '/equipements-list';
}
function goToInterventions(status = null, type = null) {
    const params = new URLSearchParams();
    const period = document.getElementById('dashboardPeriodFilter')?.value;
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (period) params.set('period', period);
    window.location.href = params.toString() ? `/interventions?${params}` : '/interventions';
}
function goToInterventionDetail(id) {
    window.location.href = `/interventions?interventionId=${encodeURIComponent(id)}`;
}
function goToPreventifs() { window.location.href = '/preventif'; }
function goToUsers() { window.location.href = '/users'; }

// Ajustement responsive initial
if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (sidebar) sidebar.classList.add('collapsed');
    if (mainContent) mainContent.classList.add('expanded');
}