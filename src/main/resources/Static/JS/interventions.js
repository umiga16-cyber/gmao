const API_URL = '/api/interventions';
    const EQUIP_API = '/api/equipements';
    const USER_API = '/api/users';

    const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
    const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
    const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

    let pendingDeleteId = null;
    let pendingStatusId = null;
    let allInterventions = [];
    let usersMap = new Map();

    function truncateText(text, maxLen) {
        if (!text) return '—';
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + '…';
    }

    async function loadEquipmentsSelect(selectedId = null) {
        try {
            const data = await fetchJson(EQUIP_API);
            const select = document.getElementById('equipementIdCanvas');
            select.innerHTML = '<option value="">Sélectionner un équipement</option>';
            if (Array.isArray(data)) {
                data.forEach(equip => {
                    const option = document.createElement('option');
                    option.value = equip.id;
                    option.textContent = `${equip.code} - ${equip.description}`;
                    if (selectedId && Number(selectedId) === Number(equip.id)) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Erreur chargement équipements:', err);
        }
    }

    async function loadUsersSelect(selectedId = null) {
        try {
            const data = await fetchJson(USER_API);
            const select = document.getElementById('createdByIdCanvas');
            select.innerHTML = '<option value="">Sélectionner un utilisateur</option>';
            usersMap.clear();

            if (Array.isArray(data)) {
                data.forEach(user => {
                    usersMap.set(Number(user.id), user.nom);
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.nom}${user.roleNom ? ' (' + user.roleNom + ')' : ''}`;
                    if (selectedId && Number(selectedId) === Number(user.id)) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
        }
    }

    function validateFieldLengths() {
        const fields = [
            { id: 'libelleCanvas', max: 200, name: 'Libellé' },
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
        const requiredFields = ['libelleCanvas', 'typeCanvas', 'statutCanvas', 'equipementIdCanvas', 'createdByIdCanvas', 'dateDebutCanvas'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const validate = () => {
                    if (field.value.trim() !== '') {
                        field.classList.remove('required-error');
                    } else {
                        field.classList.add('required-error');
                    }
                };
                field.addEventListener('input', validate);
                field.addEventListener('change', validate);
                validate();
            }
        });
    }

    function applyRequiredErrorOnEmpty() {
        const requiredFields = ['libelleCanvas', 'typeCanvas', 'statutCanvas', 'equipementIdCanvas', 'createdByIdCanvas', 'dateDebutCanvas'];
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
        await loadUsersSelect();
        await loadEquipmentsSelect();
        await refreshPage();

        document.getElementById('interventionFormCanvas').addEventListener('submit', async (e) => {
            e.preventDefault();

            const libelle = document.getElementById('libelleCanvas').value.trim();
            const type = document.getElementById('typeCanvas').value;
            const statut = document.getElementById('statutCanvas').value;
            const equipementId = document.getElementById('equipementIdCanvas').value;
            const createdById = document.getElementById('createdByIdCanvas').value;
            const dateDebut = document.getElementById('dateDebutCanvas').value;

            if (!libelle || !type || !statut || !equipementId || !createdById || !dateDebut) {
                showWarning("Veuillez remplir tous les champs obligatoires (Libellé, Type, Statut, Équipement, Créé par, Date début).");
                applyRequiredErrorOnEmpty();
                return;
            }

            if (!validateFieldLengths()) return;
            await saveInterventionCanvas();
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
            try {
                const err = JSON.parse(rawText);
                message = err.message || err.error || rawText;
            } catch (_) {}
            throw new Error(message);
        }

        if (!rawText) return null;

        try {
            return JSON.parse(rawText);
        } catch (_) {
            return rawText;
        }
    }

    async function refreshPage() {
        try {
            await loadStats();
            await loadInterventions();
        } catch (err) {
            showWarning("Erreur: " + err.message);
        }
    }

    async function loadStats() {
        const data = await fetchJson(API_URL);
        const interventions = Array.isArray(data) ? data : [];

        document.getElementById('totalInterventions').textContent = interventions.length;
        document.getElementById('interventionsTerminees').textContent = interventions.filter(i => i.statut === 'TERMINEE').length;
        document.getElementById('interventionsEnCours').textContent = interventions.filter(i => i.statut === 'EN_COURS').length;
        document.getElementById('interventionsPlanifiees').textContent = interventions.filter(i => i.statut === 'PLANIFIEE').length;
    }

    async function loadInterventions() {
        const data = await fetchJson(API_URL);
        allInterventions = Array.isArray(data) ? data : [];
        renderTable(allInterventions);
    }

    function applyFilters() {
        const status = document.getElementById('statusFilter').value.trim();
        const type = document.getElementById('typeFilter').value.trim();
        const equipementKeyword = document.getElementById('equipementFilter').value.trim().toLowerCase();

        const filtered = allInterventions.filter(i => {
            const statusOk = !status || (i.statut || '').toUpperCase() === status.toUpperCase();
            const typeOk = !type || (i.type || '').toUpperCase() === type.toUpperCase();
            const equipementText = (i.equipementDescription || '').toLowerCase();
            const equipOk = !equipementKeyword || equipementText.includes(equipementKeyword);

            return statusOk && typeOk && equipOk;
        });

        renderTable(filtered);
    }

    function resetFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('equipementFilter').value = '';
        renderTable(allInterventions);
    }

    function renderTable(data) {
        const tbody = document.getElementById('interventionsTableBody');

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state text-center">
                        <i class="fas fa-wrench fa-3x mb-3 d-block"></i>
                        <h5>Aucune intervention</h5>
                        <p class="text-muted mb-0">Commencez par créer une nouvelle intervention</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(i => {
            const libelleFull = escapeHtml(i.libele);
            const libelleTrunc = truncateText(libelleFull, 80);
            const equipFull = escapeHtml(i.equipementDescription || ('Équipement #' + i.equipementId));
            const equipTrunc = truncateText(equipFull, 30);
            const creatorName = usersMap.get(Number(i.createdById)) || ('User #' + i.createdById);

            return `
                <tr>
                    <td title="${libelleFull}">${libelleTrunc}</td>
                    <td>${renderTypeBadge(i.type)}</td>
                    <td title="${equipFull}">${equipTrunc}</td>
                    <td>${renderStatusBadge(i.statut)}</td>
                    <td style="white-space: nowrap;">${formatDate(i.dateDebut)}</td>
                    <td style="white-space: nowrap;">${i.dateFin ? formatDate(i.dateFin) : '—'}</td>
                    <td>${escapeHtml(creatorName)}</td>
                    <td class="text-center action-buttons">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary btn-action" onclick="showDetailCanvas(${i.id})" title="Détail">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning btn-action" onclick="openEditCanvas(${i.id})" title="Éditer">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info btn-action" onclick="openStatusModal(${i.id})" title="Changer statut">
                                <i class="fas fa-repeat"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-action" onclick="confirmDelete(${i.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderStatusBadge(status) {
        let cls = 'status-badge ';
        if (status === 'PLANIFIEE') cls += 'status-PLANIFIEE';
        else if (status === 'EN_COURS') cls += 'status-EN_COURS';
        else if (status === 'TERMINEE') cls += 'status-TERMINEE';
        else if (status === 'ANNULEE') cls += 'status-ANNULEE';
        else cls += 'status-PLANIFIEE';

        let label = status === 'PLANIFIEE' ? 'Planifiée'
            : status === 'EN_COURS' ? 'En cours'
            : status === 'TERMINEE' ? 'Terminée'
            : status === 'ANNULEE' ? 'Annulée'
            : escapeHtml(status);

        return `<span class="${cls}">${label}</span>`;
    }

    function renderTypeBadge(type) {
        let cls = 'type-badge ';
        if (type === 'CORRECTIVE') cls += 'type-CORRECTIVE';
        else if (type === 'PREVENTIVE') cls += 'type-PREVENTIVE';
        else if (type === 'PREDICTIVE') cls += 'type-PREDICTIVE';
        else cls += 'type-PREVENTIVE';

        let label = type === 'CORRECTIVE' ? 'Corrective'
            : type === 'PREVENTIVE' ? 'Préventive'
            : type === 'PREDICTIVE' ? 'Prédictive'
            : escapeHtml(type);

        return `<span class="${cls}">${label}</span>`;
    }

    async function showDetailCanvas(id) {
        try {
            const i = await fetchJson(`${API_URL}/${id}/detail`);
            const creatorName = usersMap.get(Number(i.createdById)) || ('User #' + i.createdById);

            const html = `
                <div class="detail-header">
                    <div class="detail-icon">
                        <i class="fas fa-clipboard-list fa-2x" style="color: var(--primary);"></i>
                    </div>
                    <h4 class="fw-bold mb-1" style="word-break: break-word;">${escapeHtml(i.libele)}</h4>
                </div>

                <div class="section-title"><i class="fas fa-info-circle me-2 text-primary"></i> Informations générales</div>
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Type</div>
                            <div class="detail-value">${renderTypeBadge(i.type)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Statut</div>
                            <div class="detail-value">${renderStatusBadge(i.statut)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Équipement</div>
                            <div class="detail-value">${escapeHtml(i.equipementDescription || ('Équipement #' + i.equipementId))}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Créé par</div>
                            <div class="detail-value">${escapeHtml(creatorName)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Préventif ID</div>
                            <div class="detail-value">${i.preventifId ?? '—'}</div>
                        </div>
                    </div>
                </div>

                <div class="section-title"><i class="fas fa-calendar-alt me-2 text-primary"></i> Dates</div>
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Date début</div>
                            <div class="detail-value">${formatDate(i.dateDebut)}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="detail-card">
                            <div class="detail-label">Date fin</div>
                            <div class="detail-value">${i.dateFin ? formatDate(i.dateFin) : '—'}</div>
                        </div>
                    </div>
                </div>

                ${i.commentaire ? `
                    <div class="section-title"><i class="fas fa-comment-dots me-2 text-primary"></i> Commentaire</div>
                    <div class="detail-card mb-3">
                        <div class="detail-value">${escapeHtml(i.commentaire)}</div>
                    </div>
                ` : ''}

                <hr class="my-3">
                <div class="text-end text-muted small">
                    <i class="fas fa-hashtag me-1"></i> ID interne : ${i.id}
                </div>
            `;

            document.getElementById('detailBodyCanvas').innerHTML = html;
            detailOffcanvas.show();
        } catch (err) {
            showWarning(err.message);
        }
    }

    async function openCreateOffcanvas() {
        document.getElementById('formOffcanvasLabel').innerText = 'Nouvelle intervention';
        document.getElementById('interventionFormCanvas').reset();
        document.getElementById('interventionIdCanvas').value = '';
        document.getElementById('formErrorCanvas').classList.add('d-none');
        await loadEquipmentsSelect();
        await loadUsersSelect();
        applyRequiredErrorOnEmpty();
        formOffcanvas.show();
    }

    async function openEditCanvas(id) {
        try {
            const i = await fetchJson(`${API_URL}/${id}/detail`);
            document.getElementById('formOffcanvasLabel').innerText = 'Éditer intervention';
            document.getElementById('interventionIdCanvas').value = i.id ?? '';
            document.getElementById('libelleCanvas').value = i.libele ?? '';
            document.getElementById('typeCanvas').value = i.type ?? '';
            document.getElementById('statutCanvas').value = i.statut ?? '';
            await loadEquipmentsSelect(i.equipementId);
            await loadUsersSelect(i.createdById);
            document.getElementById('dateDebutCanvas').value = toInputDateTime(i.dateDebut);
            document.getElementById('dateFinCanvas').value = toInputDateTime(i.dateFin);
            document.getElementById('preventifIdCanvas').value = i.preventifId ?? '';
            document.getElementById('commentaireCanvas').value = i.commentaire ?? '';
            document.getElementById('formErrorCanvas').classList.add('d-none');
            applyRequiredErrorOnEmpty();
            formOffcanvas.show();
        } catch (err) {
            showWarning(err.message);
        }
    }

    async function saveInterventionCanvas() {
        const id = document.getElementById('interventionIdCanvas').value;
        const isUpdate = !!id;

        const payload = {
            libele: getVal('libelleCanvas'),
            type: getVal('typeCanvas'),
            statut: getVal('statutCanvas'),
            equipementId: getNumberVal('equipementIdCanvas'),
            createdById: getNumberVal('createdByIdCanvas'),
            dateDebut: toIsoDateTime(getVal('dateDebutCanvas')),
            dateFin: toIsoDateTime(getVal('dateFinCanvas')),
            commentaire: getVal('commentaireCanvas'),
            preventifId: getNumberVal('preventifIdCanvas')
        };

        try {
            const url = isUpdate ? `${API_URL}/${id}` : API_URL;
            const method = isUpdate ? 'PUT' : 'POST';

            await fetchJson(url, {
                method,
                body: JSON.stringify(payload)
            });

            formOffcanvas.hide();
            await refreshPage();
        } catch (err) {
            const errBox = document.getElementById('formErrorCanvas');
            errBox.textContent = err.message;
            errBox.classList.remove('d-none');
        }
    }

    function confirmDelete(id) {
        pendingDeleteId = id;
        deleteModal.show();
    }

    async function executeDelete(id) {
        try {
            await fetchJson(`${API_URL}/${id}`, { method: 'DELETE' });
            await refreshPage();
        } catch (err) {
            showWarning(err.message);
        }
    }

    function openStatusModal(id) {
        pendingStatusId = id;
        statusModal.show();
    }

    async function changeStatus(id, newStatus) {
        try {
            await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(newStatus)}`, { method: 'PATCH' });
            await refreshPage();
        } catch (err) {
            showWarning(err.message);
        }
    }

    function getVal(id) {
        return document.getElementById(id).value.trim();
    }

    function getNumberVal(id) {
        const v = document.getElementById(id).value.trim();
        return v ? Number(v) : null;
    }

    function toIsoDateTime(value) {
        return value ? `${value}:00` : null;
    }

    function toInputDateTime(value) {
        return value ? String(value).slice(0, 16) : '';
    }

    function formatDate(dateStr) {
        return dateStr ? String(dateStr).replace('T', ' ').slice(0, 16) : 'N/A';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
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