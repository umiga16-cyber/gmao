
    const API_URL = '/api/equipements';
    const COMPANY_API_URL = '/api/companies';

    const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
    const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
    const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

    let pendingDeleteId = null;
    let pendingStatusId = null;
    let cachedCompanies = [];
    let currentEquipements = [];

    function truncateText(text, maxLen) {
        if (!text) return '—';
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + '…';
    }

    function validateFieldLengths() {
        const fields = [
            { id: 'codeCanvas', max: 50, name: 'Code' },
            { id: 'descriptionCanvas', max: 200, name: 'Description' },
            { id: 'typeCanvas', max: 50, name: 'Type' },
            { id: 'marqueCanvas', max: 50, name: 'Marque' },
            { id: 'modeleCanvas', max: 50, name: 'Modèle' },
            { id: 'numeroSerieCanvas', max: 50, name: 'Numéro de série' },
            { id: 'localisationCanvas', max: 100, name: 'Localisation' },
            { id: 'commentaireCanvas', max: 500, name: 'Commentaire' }
        ];
        for (let field of fields) {
            const element = document.getElementById(field.id);
            if (element && element.value && element.value.length > field.max) {
                showWarning(`Le champ "${field.name}" dépasse la longueur maximale autorisée (${field.max} caractères).`);
                element.focus();
                return false;
            }
        }
        return true;
    }

    function setupRealtimeValidation() {
        const requiredFields = ['codeCanvas', 'descriptionCanvas', 'typeCanvas', 'statutCanvas'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const validateField = () => {
                    if (field.value.trim() !== '') {
                        field.classList.remove('required-error');
                    } else {
                        field.classList.add('required-error');
                    }
                };
                field.addEventListener('input', validateField);
                field.addEventListener('change', validateField);
                validateField();
            }
        });
    }

    function applyRequiredErrorOnEmpty() {
        const requiredFields = ['codeCanvas', 'descriptionCanvas', 'typeCanvas', 'statutCanvas'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.value.trim() === '') {
                    field.classList.add('required-error');
                } else {
                    field.classList.remove('required-error');
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await loadCompanyOptions();
        await refreshPage();
        document.getElementById('equipementFormCanvas').addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('codeCanvas').value.trim();
            const description = document.getElementById('descriptionCanvas').value.trim();
            const type = document.getElementById('typeCanvas').value.trim();
            const statut = document.getElementById('statutCanvas').value;
            if (!code || !description || !type || !statut) {
                showWarning('Veuillez remplir tous les champs obligatoires (Code, Description, Type, Statut).');
                applyRequiredErrorOnEmpty();
                return;
            }
            if (!validateFieldLengths()) return;
            await saveEquipementCanvas();
        });
        document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
            if (pendingDeleteId !== null) {
                await executeDelete(pendingDeleteId);
                deleteModal.hide();
                pendingDeleteId = null;
            }
        });
        document.querySelectorAll('.status-option-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const newStatus = btn.getAttribute('data-status');
                if (pendingStatusId && newStatus) {
                    await changeStatus(pendingStatusId, newStatus);
                    statusModal.hide();
                    pendingStatusId = null;
                }
            });
        });
        setupRealtimeValidation();
    });

    function showWarning(message) {
        document.getElementById('warningMessage').textContent = message;
        warningModal.show();
    }

    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('mainContent').classList.toggle('expanded');
        const logo = document.getElementById('logo-text');
        if (logo) logo.style.display = document.getElementById('sidebar').classList.contains('collapsed') ? 'none' : 'inline';
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const rawText = await response.text();
        if (!response.ok) {
            let message = rawText;
            try { const err = JSON.parse(rawText); message = err.message || err.error || rawText; } catch (_) {}
            throw new Error(message);
        }
        if (!rawText) return null;
        try { return JSON.parse(rawText); } catch (_) { return rawText; }
    }

    async function loadCompanyOptions(selectedId = null) {
        try {
            const companies = await fetchJson(COMPANY_API_URL);
            cachedCompanies = Array.isArray(companies) ? companies : [];

            const formSelect = document.getElementById('companyIdCanvas');
            const filterSelect = document.getElementById('companyFilter');

            formSelect.innerHTML = '<option value="">Sélectionner</option>' +
                cachedCompanies.map(c => `<option value="${c.id}" ${selectedId && Number(selectedId) === Number(c.id) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

            const currentFilter = filterSelect.value;
            filterSelect.innerHTML = '<option value="">Toutes</option>' +
                cachedCompanies.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

            if (currentFilter) filterSelect.value = currentFilter;
        } catch (err) {
            console.warn('Impossible de charger les sociétés:', err.message);
        }
    }

    async function refreshPage() {
        try {
            await loadStats();
            await loadEquipments();
        } catch (err) {
            showWarning('Erreur: ' + err.message);
        }
    }

    async function loadStats() {
        const data = await fetchJson(API_URL);
        const equipments = Array.isArray(data) ? data : [];
        const getStatus = (e) => (e.statut || '').toUpperCase();
        document.getElementById('totalEquipments').textContent = equipments.length;
        document.getElementById('equipmentsActifs').textContent = equipments.filter(e => getStatus(e) === 'ACTIF').length;
        document.getElementById('equipmentsMaintenance').textContent = equipments.filter(e => getStatus(e) === 'MAINTENANCE').length;
        document.getElementById('equipmentsWithCompany').textContent = equipments.filter(e => e.companyId != null).length;
    }

    async function loadEquipments() {
        const data = await fetchJson(API_URL);
        currentEquipements = Array.isArray(data) ? data : [];
        renderTable(currentEquipements);
    }

    async function loadRoots() {
        const data = await fetchJson(`${API_URL}/roots`);
        currentEquipements = Array.isArray(data) ? data : [];
        renderTable(currentEquipements);
    }

    async function applyFilters() {
        const kw = document.getElementById('searchKeyword').value.trim().toLowerCase();
        const st = document.getElementById('statusFilter').value.trim();
        const companyId = document.getElementById('companyFilter').value.trim();

        let data = await fetchJson(API_URL);
        let equipments = Array.isArray(data) ? data : [];

        if (st) {
            equipments = equipments.filter(e => (e.statut || '').toUpperCase() === st.toUpperCase());
        }
        if (companyId) {
            equipments = equipments.filter(e => String(e.companyId || '') === companyId);
        }
        if (kw) {
            equipments = equipments.filter(e =>
                (e.code || '').toLowerCase().includes(kw) ||
                (e.description || '').toLowerCase().includes(kw) ||
                (e.companyName || '').toLowerCase().includes(kw)
            );
        }

        currentEquipements = equipments;
        renderTable(currentEquipements);
    }

    function resetFilters() {
        document.getElementById('searchKeyword').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('companyFilter').value = '';
        loadEquipments();
    }

    function renderTable(data) {
        const tbody = document.getElementById('equipementsTableBody');
        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-tools fa-3x mb-3"></i><h5>Aucun équipement</h5></td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(e => {
            const codeFull = escapeHtml(e.code);
            const descFull = escapeHtml(e.description);
            const companyFull = escapeHtml(e.companyName || '—');
            const codeTrunc = truncateText(codeFull, 40);
            const descTrunc = truncateText(descFull, 80);
            return `
                <tr>
                    <td title="${codeFull}">${codeTrunc}</td>
                    <td title="${descFull}">${descTrunc}</td>
                    <td title="${companyFull}">${e.companyName ? `<span class="company-badge">${truncateText(companyFull, 30)}</span>` : '—'}</td>
                    <td>${renderStatusBadge(e.statut)}</td>
                    <td class="text-center action-buttons">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary btn-action" onclick="showDetailCanvas(${e.id})" title="Détail" style="padding: 4px 6px; font-size: 0.75rem;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning btn-action" onclick="openEditCanvas(${e.id})" title="Éditer" style="padding: 4px 6px; font-size: 0.75rem;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info btn-action" onclick="openStatusModalWrapper(${e.id}, '${e.statut}')" title="${e.statut === 'ARCHIVED' ? 'Désarchivez d\'abord' : 'Changer statut'}" style="padding: 4px 6px; font-size: 0.75rem;">
                                <i class="fas fa-repeat"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-action" onclick="toggleArchive(${e.id}, '${e.statut}')" title="${e.statut === 'ARCHIVED' ? 'Désarchiver' : 'Archiver'}" style="padding: 4px 6px; font-size: 0.75rem;">
                                <i class="fas ${e.statut === 'ARCHIVED' ? 'fa-box-open' : 'fa-box-archive'}"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-action" onclick="confirmDelete(${e.id})" title="Supprimer" style="padding: 4px 6px; font-size: 0.75rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderStatusBadge(status) {
        const val = (status || '').toUpperCase();
        let cls = 'status-actif';
        if (val === 'MAINTENANCE') cls = 'status-maintenance';
        if (val === 'HS' || val === 'ARCHIVED') cls = 'status-hs';
        return `<span class="status-badge ${cls}">${escapeHtml(status || '')}</span>`;
    }

    async function showDetailCanvas(id) {
        try {
            const e = await fetchJson(`${API_URL}/${id}/detail`);
            const html = `
                <div class="detail-header">
                    <div class="detail-icon">
                        <i class="fas fa-microchip fa-2x" style="color: var(--primary);"></i>
                    </div>
                    <h4 class="fw-bold mb-1" style="word-break: break-word;">${escapeHtml(e.code)}</h4>
                    <p class="text-muted mb-0" style="word-break: break-word;">${escapeHtml(e.description)}</p>
                </div>
                <div class="section-title"><i class="fas fa-info-circle me-2 text-primary"></i> Informations générales</div>
                <div class="row g-3 mb-4">
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Société</div><div class="detail-value">${escapeHtml(e.companyName) || '—'}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Type</div><div class="detail-value">${escapeHtml(e.type) || '—'}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Marque / Modèle</div><div class="detail-value">${escapeHtml(e.marque) || '—'} ${escapeHtml(e.modele) ? '('+escapeHtml(e.modele)+')' : ''}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">N° série</div><div class="detail-value">${escapeHtml(e.numeroSerie) || '—'}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Localisation</div><div class="detail-value"><i class="fas fa-map-marker-alt me-1 text-primary"></i> ${escapeHtml(e.localisation) || '—'}</div></div></div>
                </div>
                <div class="section-title"><i class="fas fa-chart-line me-2 text-primary"></i> Statut & Maintenance</div>
                <div class="row g-3 mb-4">
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Statut actuel</div><div class="detail-value">${renderStatusBadge(e.statut)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Criticité</div><div class="detail-value">${e.criticite ? (e.criticite === 'BAJA' ? 'Baja' : e.criticite === 'MEDIA' ? 'Media' : e.criticite === 'ALTA' ? 'Alta' : escapeHtml(e.criticite)) : '—'}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Parent ID</div><div class="detail-value">${e.parentId ? e.parentId : '—'}</div></div></div>
                </div>
                <div class="section-title"><i class="fas fa-calendar-alt me-2 text-primary"></i> Dates clés</div>
                <div class="row g-3 mb-4">
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Date d'installation</div><div class="detail-value">${formatDate(e.dateInstallation)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Mise en service</div><div class="detail-value">${formatDate(e.dateMiseEnService)}</div></div></div>
                </div>
                ${e.commentaire ? `<div class="section-title"><i class="fas fa-comment-dots me-2 text-primary"></i> Commentaire</div><div class="detail-card mb-3"><div class="detail-value">${escapeHtml(e.commentaire)}</div></div>` : ''}
                <hr class="my-3">
                <div class="text-end text-muted small">
                    <i class="fas fa-hashtag me-1"></i> ID interne : ${e.id}
                </div>
            `;
            document.getElementById('detailBodyCanvas').innerHTML = html;
            detailOffcanvas.show();
        } catch (err) {
            showWarning(err.message);
        }
    }

    async function openCreateOffcanvas() {
        document.getElementById('formOffcanvasLabel').innerText = 'Nouvel équipement';
        document.getElementById('equipementFormCanvas').reset();
        document.getElementById('equipementIdCanvas').value = '';
        document.getElementById('formErrorCanvas').classList.add('d-none');
        await loadCompanyOptions();
        applyRequiredErrorOnEmpty();
        formOffcanvas.show();
    }

    async function openEditCanvas(id) {
        try {
            const e = await fetchJson(`${API_URL}/${id}/detail`);
            document.getElementById('formOffcanvasLabel').innerText = 'Éditer équipement';
            document.getElementById('equipementIdCanvas').value = e.id ?? '';
            document.getElementById('codeCanvas').value = e.code ?? '';
            document.getElementById('descriptionCanvas').value = e.description ?? '';
            document.getElementById('typeCanvas').value = e.type ?? '';
            document.getElementById('marqueCanvas').value = e.marque ?? '';
            document.getElementById('modeleCanvas').value = e.modele ?? '';
            document.getElementById('numeroSerieCanvas').value = e.numeroSerie ?? '';
            document.getElementById('localisationCanvas').value = e.localisation ?? '';
            document.getElementById('statutCanvas').value = e.statut ?? '';
            document.getElementById('criticiteCanvas').value = e.criticite ?? '';
            document.getElementById('dateInstallationCanvas').value = e.dateInstallation ?? '';
            document.getElementById('dateMiseEnServiceCanvas').value = e.dateMiseEnService ?? '';
            document.getElementById('commentaireCanvas').value = e.commentaire ?? '';
            document.getElementById('parentIdCanvas').value = e.parentId ?? '';
            await loadCompanyOptions(e.companyId);
            document.getElementById('formErrorCanvas').classList.add('d-none');
            applyRequiredErrorOnEmpty();
            formOffcanvas.show();
        } catch (err) { showWarning(err.message); }
    }

    async function saveEquipementCanvas() {
        const id = document.getElementById('equipementIdCanvas').value;
        const isUpdate = !!id;
        const basePayload = {
            description: getVal('descriptionCanvas'),
            type: getVal('typeCanvas'),
            marque: getVal('marqueCanvas'),
            modele: getVal('modeleCanvas'),
            numeroSerie: getVal('numeroSerieCanvas'),
            localisation: getVal('localisationCanvas'),
            statut: getVal('statutCanvas'),
            dateInstallation: getVal('dateInstallationCanvas') || null,
            dateMiseEnService: getVal('dateMiseEnServiceCanvas') || null,
            criticite: getVal('criticiteCanvas'),
            commentaire: getVal('commentaireCanvas'),
            parentId: getNumberVal('parentIdCanvas'),
            companyId: getNumberVal('companyIdCanvas')
        };
        const payload = isUpdate ? basePayload : {
            code: getVal('codeCanvas'),
            ...basePayload
        };
        try {
            if (!isUpdate && payload.code) {
                const exists = await fetchJson(`${API_URL}/exists?code=${encodeURIComponent(payload.code)}`);
                if (exists) throw new Error('Code déjà existant');
            }
            await fetchJson(isUpdate ? `${API_URL}/${id}` : API_URL, { method: isUpdate ? 'PUT' : 'POST', body: JSON.stringify(payload) });
            formOffcanvas.hide();
            await refreshPage();
        } catch (err) {
            const errBox = document.getElementById('formErrorCanvas');
            errBox.textContent = err.message;
            errBox.classList.remove('d-none');
        }
    }

    function confirmDelete(id) { pendingDeleteId = id; deleteModal.show(); }

    async function executeDelete(id) {
        try {
            const can = await fetchJson(`${API_URL}/${id}/can-delete`);
            if (!can) {
                showWarning('Cet équipement ne peut pas être supprimé car il est lié à des éléments existants (sous-équipements, interventions ou plans préventifs).');
                return;
            }
            await fetchJson(`${API_URL}/${id}`, { method: 'DELETE' });
            await refreshPage();
        } catch (err) { showWarning(err.message); }
    }

    async function toggleArchive(id, statut) {
        try {
            if (statut === 'ARCHIVED') {
                await fetchJson(`${API_URL}/${id}/unarchive`, { method: 'PATCH' });
            } else {
                await fetchJson(`${API_URL}/${id}/archive`, { method: 'PATCH' });
            }
            await refreshPage();
        } catch (err) { showWarning(err.message); }
    }

    function openStatusModalWrapper(id, statut) {
        if (statut === 'ARCHIVED') {
            showWarning('Vous devez désarchiver l’équipement avant de changer son statut.');
            return;
        }
        pendingStatusId = id;
        statusModal.show();
    }

    async function changeStatus(id, newStatus) {
        try {
            await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(newStatus)}`, { method: 'PATCH' });
            await refreshPage();
        } catch (err) { showWarning(err.message); }
    }

    function getVal(id) { return document.getElementById(id).value.trim(); }
    function getNumberVal(id) { const v = document.getElementById(id).value.trim(); return v ? Number(v) : null; }
    function formatDate(v) { return v || 'N/A'; }
    function escapeHtml(v) { if (v == null) return ''; return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('mainContent').classList.add('expanded');
    }
