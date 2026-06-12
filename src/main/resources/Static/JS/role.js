    // ======================== CONFIGURATION ========================
    const API_ROLES_URL = '/api/roles';
    const API_ROLES_STATS_URL = '/api/roles/stats';

    const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));
    const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

    let rolesData = [];
    let pendingDeleteId = null;
    let selectedRoleId = null;
    let currentQuickFilter = 'TOTAL';

    // ======================== UTILITAIRES ========================
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    }

    function showWarning(message) {
        document.getElementById('warningMessage').textContent = message;
        warningModal.show();
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const rawText = await response.text();
        if (!response.ok) {
            let message = rawText;
            try { const err = JSON.parse(rawText); message = err.message || err.error || rawText; } catch(_) {}
            throw new Error(message);
        }
        if (!rawText) return null;
        try { return JSON.parse(rawText); } catch(_) { return rawText; }
    }

    // ======================== STATISTIQUES ========================
    async function loadStats() {
        try {
            const stats = await fetchJson(API_ROLES_STATS_URL);
            if (stats) {
                document.getElementById('totalRoles').textContent = stats.totalRoles || 0;
                document.getElementById('utilisateursAvecRole').textContent = stats.utilisateursAvecRole || 0;
                document.getElementById('rolesSansUtilisateur').textContent = stats.rolesSansUtilisateur || 0;
                document.getElementById('rolesActifsCount').textContent = stats.rolesActifsCount || 0;
            }
        } catch(e) { console.error('Stats error', e); }
    }

    // ======================== CHARGEMENT ========================
    async function loadRoles() {
        try {
            const data = await fetchJson(API_ROLES_URL);
            rolesData = Array.isArray(data) ? data : [];
            await loadStats();
            applyQuickFilter(currentQuickFilter);
        } catch (err) {
            showWarning("Erreur chargement : " + err.message);
        }
    }

    // ======================== RENDU TABLEAU ========================
    function renderTable(roles) {
        const tbody = document.getElementById('rolesTableBody');
        if (!roles.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><i class="fas fa-shield-alt fa-3x mb-3 d-block"></i><h5>Aucun rôle</h5><p class="text-muted">Créez votre premier rôle.</p></td></tr>`;
            return;
        }
        tbody.innerHTML = roles.map(role => {
            const isSelected = (selectedRoleId === role.id);
            return `
                <tr data-id="${role.id}" class="${isSelected ? 'selected-row' : ''}">
                    <td class="text-center"><input type="radio" name="roleSelect" value="${role.id}" class="radio-select" ${isSelected ? 'checked' : ''}></td>
                    <td>${role.id}</td>
                    <td><strong>${escapeHtml(role.nom)}</strong></td>
                    <td>${role.nbUtilisateurs || 0}</td>
                </tr>
            `;
        }).join('');
        bindSelectionEvents();
        updateToolbarState();
    }

    // ======================== SÉLECTION UNIQUE ========================
    function bindSelectionEvents() {
        document.querySelectorAll('input[name="roleSelect"]').forEach(radio => {
            radio.removeEventListener('change', handleRadioChange);
            radio.addEventListener('change', handleRadioChange);
        });
        document.querySelectorAll('#rolesTableBody tr').forEach(row => {
            row.removeEventListener('click', handleRowClick);
            row.addEventListener('click', handleRowClick);
        });
    }

    function handleRadioChange(event) {
        if (event.target.checked) {
            selectedRoleId = parseInt(event.target.value);
            highlightSelectedRow();
            updateToolbarState();
        }
    }

    function handleRowClick(e) {
        if (e.target.type === 'radio') return;
        const row = e.currentTarget;
        const radio = row.querySelector('input[type="radio"]');
        if (radio && !radio.checked) {
            radio.checked = true;
            selectedRoleId = parseInt(row.dataset.id);
            highlightSelectedRow();
            updateToolbarState();
        }
    }

    function highlightSelectedRow() {
        document.querySelectorAll('#rolesTableBody tr').forEach(tr => {
            const id = parseInt(tr.dataset.id);
            if (selectedRoleId === id) tr.classList.add('selected-row');
            else tr.classList.remove('selected-row');
        });
    }

    function updateToolbarState() {
        const hasSelection = selectedRoleId !== null;
        const btns = ['btnDetail', 'btnEdit', 'btnDelete'];
        btns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = !hasSelection;
        });
    }

    // Actions
    function actionDetail() {
        if (selectedRoleId) showDetail(selectedRoleId);
        else showWarning("Veuillez sélectionner un rôle.");
    }
    function actionEdit() {
        if (selectedRoleId) openEditCanvas(selectedRoleId);
        else showWarning("Veuillez sélectionner un rôle.");
    }
    function actionDelete() {
        if (selectedRoleId) confirmDelete(selectedRoleId);
        else showWarning("Veuillez sélectionner un rôle.");
    }

    // ======================== DÉTAIL ========================
    async function showDetail(id) {
        const role = rolesData.find(r => r.id === id);
        if (!role) return showWarning("Rôle introuvable.");
        const html = `
            <div class="detail-card"><div class="detail-label">ID</div><div class="detail-value">${role.id}</div></div>
            <div class="detail-card"><div class="detail-label">Nom</div><div class="detail-value">${escapeHtml(role.nom)}</div></div>
            <div class="detail-card"><div class="detail-label">Nombre d'utilisateurs</div><div class="detail-value">${role.nbUtilisateurs || 0}</div></div>
            <hr><div class="text-muted small">Ce rôle est ${role.nbUtilisateurs > 0 ? 'utilisé par ' + role.nbUtilisateurs + ' utilisateur(s)' : 'inutilisé'}</div>
        `;
        document.getElementById('detailBodyCanvas').innerHTML = html;
        detailOffcanvas.show();
    }

    // ======================== FILTRES (cartes + recherche) ========================
    function applyQuickFilter(filterType) {
        currentQuickFilter = filterType;
        updateQuickCardsStyle();
        document.getElementById('roleSearch').value = '';
        let filtered = [...rolesData];
        if (filterType === 'USED') filtered = filtered.filter(r => (r.nbUtilisateurs || 0) > 0);
        if (filterType === 'UNUSED') filtered = filtered.filter(r => (r.nbUtilisateurs || 0) === 0);
        if (filterType === 'ACTIVE') filtered = filtered.filter(r => r.actif === true);
        renderTable(filtered);
    }

    function updateQuickCardsStyle() {
        const cards = {
            TOTAL: document.getElementById('quickCardTotal'),
            USED: document.getElementById('quickCardUsed'),
            UNUSED: document.getElementById('quickCardUnused'),
            ACTIVE: document.getElementById('quickCardActive')
        };
        Object.values(cards).forEach(c => c?.classList.remove('active-quick-filter'));
        const active = cards[currentQuickFilter];
        if (active) active.classList.add('active-quick-filter');
    }

    function filterRoles() {
        currentQuickFilter = null;
        updateQuickCardsStyle();
        const search = document.getElementById('roleSearch').value.trim().toLowerCase();
        let filtered = [...rolesData];
        if (search) filtered = filtered.filter(role => role.nom.toLowerCase().includes(search));
        renderTable(filtered);
    }

    function resetSearch() {
        document.getElementById('roleSearch').value = '';
        currentQuickFilter = 'TOTAL';
        updateQuickCardsStyle();
        renderTable(rolesData);
    }

    // ======================== CRÉATION / ÉDITION (inchangées) ========================
    function openCreateOffcanvas() {
        document.getElementById('formOffcanvasLabel').innerText = 'Nouveau rôle';
        document.getElementById('roleFormCanvas').reset();
        document.getElementById('roleIdCanvas').value = '';
        document.getElementById('formErrorCanvas').classList.add('d-none');
        formOffcanvas.show();
    }

    async function openEditCanvas(id) {
        try {
            const role = rolesData.find(r => r.id == id);
            if (!role) throw new Error('Rôle non trouvé');
            document.getElementById('formOffcanvasLabel').innerText = 'Modifier le rôle';
            document.getElementById('roleIdCanvas').value = role.id;
            document.getElementById('roleNameCanvas').value = role.nom;
            document.getElementById('formErrorCanvas').classList.add('d-none');
            formOffcanvas.show();
        } catch (err) {
            showWarning(err.message);
        }
    }

    async function saveRoleCanvas() {
        const id = document.getElementById('roleIdCanvas').value;
        const nom = document.getElementById('roleNameCanvas').value.trim();
        if (!nom) {
            showWarning("Le nom du rôle est obligatoire.");
            return;
        }
        const isUpdate = !!id;
        const payload = { nom };
        try {
            if (isUpdate) {
                await fetchJson(`${API_ROLES_URL}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await fetchJson(API_ROLES_URL, { method: 'POST', body: JSON.stringify(payload) });
            }
            formOffcanvas.hide();
            await loadRoles();
        } catch (err) {
            const errBox = document.getElementById('formErrorCanvas');
            errBox.textContent = err.message;
            errBox.classList.remove('d-none');
        }
    }

    // ======================== SUPPRESSION ========================
    function confirmDelete(id) {
        pendingDeleteId = id;
        deleteModal.show();
    }

    async function executeDelete(id) {
        try {
            const can = await fetchJson(`${API_ROLES_URL}/${id}/can-delete`);
            if (!can) throw new Error("Ce rôle est utilisé par des utilisateurs.");
            await fetchJson(`${API_ROLES_URL}/${id}`, { method: 'DELETE' });
            if (selectedRoleId === id) selectedRoleId = null;
            await loadRoles();
        } catch (err) {
            showWarning(err.message);
        }
    }

    // ======================== INITIALISATION ========================
    document.addEventListener('DOMContentLoaded', async () => {
        await loadRoles();
        document.getElementById('roleFormCanvas').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveRoleCanvas();
        });
        document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
            if (pendingDeleteId !== null) {
                await executeDelete(pendingDeleteId);
                deleteModal.hide();
                pendingDeleteId = null;
            }
        });
    });

    // ======================== SIDEBAR ========================
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('mainContent');
        const logo = document.getElementById('logo-text');
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
        if (logo) logo.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'inline';
    }
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar')?.classList.add('collapsed');
        document.getElementById('mainContent')?.classList.add('expanded');
        const logo = document.getElementById('logo-text');
        if (logo) logo.style.display = 'none';
    }