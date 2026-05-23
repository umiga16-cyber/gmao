const API_URL = '/api/interventions';
const EQUIP_API = '/api/equipements';
const USER_API = '/api/users';
const PRS_API = '/api/stock';

const detailOffcanvasEl = document.getElementById('detailOffcanvas');
const formOffcanvasEl = document.getElementById('formOffcanvas');
const deleteModalEl = document.getElementById('deleteConfirmModal');
const statusModalEl = document.getElementById('statusModal');
const warningModalEl = document.getElementById('warningModal');

const detailOffcanvas = detailOffcanvasEl ? new bootstrap.Offcanvas(detailOffcanvasEl) : null;
const formOffcanvas = formOffcanvasEl ? new bootstrap.Offcanvas(formOffcanvasEl) : null;
const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
const statusModal = statusModalEl ? new bootstrap.Modal(statusModalEl) : null;
const warningModal = warningModalEl ? new bootstrap.Modal(warningModalEl) : null;

let pendingDeleteId = null;
let pendingStatusId = null;
let allInterventions = [];
let usersMap = new Map();
let prsCatalog = [];
let currentPrsLines = [];

function normalizeInterventionStatus(status) {
    const value = (status || '').trim().toUpperCase();

    if (value === 'OPEN') return 'PLANIFIEE';
    if (value === 'IN_PROGRESS') return 'EN_COURS';
    if (value === 'CLOSED' || value === 'DONE' || value === 'COMPLETED') return 'TERMINEE';
    if (value === 'CANCELED' || value === 'CANCELLED') return 'ANNULEE';

    return value;
}

function truncateText(text, maxLen) {
    if (!text) return '—';
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '…';
}

function showWarning(message) {
    const warningMessage = document.getElementById('warningMessage');

    if (warningMessage) {
        warningMessage.textContent = message;
    }

    if (warningModal) {
        warningModal.show();
    } else {
        alert(message);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const logo = document.getElementById('logo-text');

    if (sidebar) sidebar.classList.toggle('collapsed');
    if (mainContent) mainContent.classList.toggle('expanded');

    if (logo && sidebar) {
        logo.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'inline';
    }
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
        } catch (_) {
            // keep raw text
        }

        throw new Error(message || `Erreur HTTP ${response.status}`);
    }

    if (!rawText) return null;

    try {
        return JSON.parse(rawText);
    } catch (_) {
        return rawText;
    }
}

async function loadEquipmentsSelect(selectedId = null) {
    try {
        const data = await fetchJson(EQUIP_API);
        const select = document.getElementById('equipementIdCanvas');

        if (!select) {
            console.error('Champ introuvable: equipementIdCanvas');
            return;
        }

        select.innerHTML = '<option value="">Sélectionner un équipement</option>';

        if (Array.isArray(data)) {
            data.forEach(equip => {
                const option = document.createElement('option');
                option.value = equip.id;
                option.textContent = `${equip.code || ''} - ${equip.description || ''}`;

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

async function loadUsersSelect() {
    try {
        const data = await fetchJson(USER_API);
        usersMap.clear();

        if (Array.isArray(data)) {
            data.forEach(user => {
                usersMap.set(Number(user.id), user.nom || user.email || `User #${user.id}`);
            });
        }
    } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
    }
}

async function loadPrsSelect(selectedPrsId = null) {
    try {
        const data = await fetchJson(PRS_API);
        prsCatalog = Array.isArray(data) ? data : [];

        const select = document.getElementById('prsSelectCanvas');

        if (!select) {
            console.error('Champ introuvable: prsSelectCanvas');
            return;
        }

        select.innerHTML = '<option value="">Sélectionner une PR</option>';

        prsCatalog.forEach(prs => {
            const option = document.createElement('option');
            option.value = prs.id;
            option.textContent = `${prs.libelle || ''} (stock: ${prs.quantiteStock ?? 0})`;

            if (selectedPrsId && Number(selectedPrsId) === Number(prs.id)) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    } catch (err) {
        console.error('Erreur chargement PRs:', err);
    }
}

function validateFieldLengths() {
    const fields = [
        { id: 'codeInterventionCanvas', max: 50, name: 'Code intervention' },
        { id: 'codeMaterielCanvas', max: 50, name: 'Code matériel' },
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
    const requiredFields = [
        'codeInterventionCanvas',
        'codeMaterielCanvas',
        'libelleCanvas',
        'typeCanvas',
        'statutCanvas',
        'equipementIdCanvas',
        'dateDebutCanvas'
    ];

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
    const requiredFields = [
        'codeInterventionCanvas',
        'codeMaterielCanvas',
        'libelleCanvas',
        'typeCanvas',
        'statutCanvas',
        'equipementIdCanvas',
        'dateDebutCanvas'
    ];

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

async function refreshPage() {
    try {
        await loadStats();
        await loadInterventions();
    } catch (err) {
        console.error('Erreur refreshPage:', err);
        showWarning("Erreur: " + err.message);
    }
}

async function loadStats() {
    const data = await fetchJson(API_URL);
    const interventions = Array.isArray(data) ? data : [];

    const totalEl = document.getElementById('totalInterventions');
    const termineesEl = document.getElementById('interventionsTerminees');
    const enCoursEl = document.getElementById('interventionsEnCours');
    const planifieesEl = document.getElementById('interventionsPlanifiees');

    if (totalEl) totalEl.textContent = interventions.length;
    if (termineesEl) termineesEl.textContent =
        interventions.filter(i => normalizeInterventionStatus(i.statut) === 'TERMINEE').length;
    if (enCoursEl) enCoursEl.textContent =
        interventions.filter(i => normalizeInterventionStatus(i.statut) === 'EN_COURS').length;
    if (planifieesEl) planifieesEl.textContent =
        interventions.filter(i => normalizeInterventionStatus(i.statut) === 'PLANIFIEE').length;
}

async function loadInterventions() {
    const data = await fetchJson(API_URL);
    allInterventions = Array.isArray(data) ? data : [];
    renderTable(allInterventions);
}

function applyFilters() {
    const status = document.getElementById('statusFilter')?.value.trim() || '';
    const type = document.getElementById('typeFilter')?.value.trim() || '';
    const equipementKeyword = document.getElementById('equipementFilter')?.value.trim().toLowerCase() || '';

    const filtered = allInterventions.filter(i => {
        const statusOk = !status || normalizeInterventionStatus(i.statut) === status.toUpperCase();
        const typeOk = !type || (i.type || '').toUpperCase() === type.toUpperCase();
        const equipementText = (i.equipementDescription || '').toLowerCase();
        const equipOk = !equipementKeyword || equipementText.includes(equipementKeyword);

        return statusOk && typeOk && equipOk;
    });

    renderTable(filtered);
}

function resetFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const equipementFilter = document.getElementById('equipementFilter');

    if (statusFilter) statusFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (equipementFilter) equipementFilter.value = '';

    renderTable(allInterventions);
}

function renderTable(data) {
    const tbody = document.getElementById('interventionsTableBody');

    if (!tbody) {
        console.error('Table body introuvable: interventionsTableBody');
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state text-center">
                    <i class="fas fa-wrench fa-3x mb-3 d-block"></i>
                    <h5>Aucune intervention</h5>
                    <p class="text-muted mb-0">Commencez par créer une nouvelle intervention</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(i => {
        const codeIntervention = escapeHtml(i.codeIntervention || '—');
        const codeMateriel = escapeHtml(i.codeMateriel || '—');

        const libelleFull = escapeHtml(i.libele || '');
        const libelleTrunc = truncateText(libelleFull, 80);

        const equipFull = escapeHtml(i.equipementDescription || ('Équipement #' + i.equipementId));
        const equipTrunc = truncateText(equipFull, 30);

        const creatorName = usersMap.get(Number(i.createdById)) || ('User #' + i.createdById);

        return `
            <tr>
                <td title="${codeIntervention}">${codeIntervention}</td>
                <td title="${codeMateriel}">${codeMateriel}</td>
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
    const normalized = normalizeInterventionStatus(status);

    let cls = 'status-badge ';

    if (normalized === 'PLANIFIEE') cls += 'status-PLANIFIEE';
    else if (normalized === 'EN_COURS') cls += 'status-EN_COURS';
    else if (normalized === 'TERMINEE') cls += 'status-TERMINEE';
    else if (normalized === 'ANNULEE') cls += 'status-ANNULEE';
    else cls += 'status-PLANIFIEE';

    let label = normalized === 'PLANIFIEE' ? 'Planifiée'
        : normalized === 'EN_COURS' ? 'En cours'
        : normalized === 'TERMINEE' ? 'Terminée'
        : normalized === 'ANNULEE' ? 'Annulée'
        : escapeHtml(status);

    return `<span class="${cls}">${label}</span>`;
}

function renderTypeBadge(type) {
    let cls = 'type-badge ';
    const value = (type || '').toUpperCase();

    if (value === 'CORRECTIVE') cls += 'type-CORRECTIVE';
    else if (value === 'PREVENTIVE') cls += 'type-PREVENTIVE';
    else if (value === 'PREDICTIVE') cls += 'type-PREDICTIVE';
    else cls += 'type-PREVENTIVE';

    let label = value === 'CORRECTIVE' ? 'Corrective'
        : value === 'PREVENTIVE' ? 'Préventive'
        : value === 'PREDICTIVE' ? 'Prédictive'
        : escapeHtml(type || '—');

    return `<span class="${cls}">${label}</span>`;
}

function renderPrsLines() {
    const tbody = document.getElementById('prsLinesBody');

    if (!tbody) return;

    if (!currentPrsLines.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-muted text-center">Aucune PR sélectionnée</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentPrsLines.map(line => `
        <tr>
            <td>${escapeHtml(line.prsLibelle)}</td>
            <td>${line.quantite}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removePrsLine(${line.prsId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function addPrsLine() {
    const prsSelect = document.getElementById('prsSelectCanvas');
    const qtyInput = document.getElementById('prsQuantiteCanvas');

    if (!prsSelect || !qtyInput) {
        showWarning("Erreur technique : champs PR introuvables.");
        return;
    }

    const prsId = Number(prsSelect.value);
    const quantite = Number(qtyInput.value);

    if (!prsId) {
        showWarning("Sélectionnez une PR.");
        return;
    }

    if (!quantite || quantite <= 0) {
        showWarning("La quantité PR doit être supérieure à 0.");
        return;
    }

    const prs = prsCatalog.find(p => Number(p.id) === prsId);

    if (!prs) {
        showWarning("PR introuvable.");
        return;
    }

    const existing = currentPrsLines.find(line => Number(line.prsId) === prsId);

    if (existing) {
        existing.quantite = Number(existing.quantite) + quantite;
    } else {
        currentPrsLines.push({
            prsId: prs.id,
            prsLibelle: prs.libelle,
            quantite: quantite
        });
    }

    renderPrsLines();

    prsSelect.value = '';
    qtyInput.value = '1';
}

function removePrsLine(prsId) {
    currentPrsLines = currentPrsLines.filter(line => Number(line.prsId) !== Number(prsId));
    renderPrsLines();
}

async function showDetailCanvas(id) {
    try {
        const i = await fetchJson(`${API_URL}/${id}/detail`);
        const creatorName = usersMap.get(Number(i.createdById)) || ('User #' + i.createdById);

        const prsHtml = Array.isArray(i.prsItems) && i.prsItems.length
            ? `
                <div class="section-title"><i class="fas fa-boxes me-2 text-primary"></i> PRs consommées</div>
                <div class="detail-card">
                    <div class="table-responsive">
                        <table class="table table-sm mb-0">
                            <thead>
                                <tr>
                                    <th>PR</th>
                                    <th>Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${i.prsItems.map(p => `
                                    <tr>
                                        <td>${escapeHtml(p.prsLibelle)}</td>
                                        <td>${p.quantite}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `
            : '';

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
                        <div class="detail-label">Code intervention</div>
                        <div class="detail-value">${escapeHtml(i.codeIntervention || '—')}</div>
                    </div>
                </div>

                <div class="col-6">
                    <div class="detail-card">
                        <div class="detail-label">Code matériel</div>
                        <div class="detail-value">${escapeHtml(i.codeMateriel || '—')}</div>
                    </div>
                </div>

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

            ${prsHtml}

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

        const detailBody = document.getElementById('detailBodyCanvas');

        if (detailBody) {
            detailBody.innerHTML = html;
        }

        if (detailOffcanvas) {
            detailOffcanvas.show();
        }
    } catch (err) {
        console.error('Erreur détail intervention:', err);
        showWarning(err.message);
    }
}

async function openCreateOffcanvas(preselectedEquipementId = null) {
    const formLabel = document.getElementById('formOffcanvasLabel');
    const form = document.getElementById('interventionFormCanvas');
    const interventionId = document.getElementById('interventionIdCanvas');
    const formError = document.getElementById('formErrorCanvas');
    const prsQty = document.getElementById('prsQuantiteCanvas');

    if (formLabel) formLabel.innerText = 'Nouvelle intervention';
    if (form) form.reset();
    if (interventionId) interventionId.value = '';
    if (formError) formError.classList.add('d-none');

    currentPrsLines = [];

    await loadEquipmentsSelect(preselectedEquipementId);
    await loadPrsSelect();

    renderPrsLines();

    if (prsQty) {
        prsQty.value = '1';
    }

    if (preselectedEquipementId) {
        const equipementSelect = document.getElementById('equipementIdCanvas');

        if (equipementSelect) {
            equipementSelect.value = String(preselectedEquipementId);
        }
    }

    applyRequiredErrorOnEmpty();

    if (formOffcanvas) {
        formOffcanvas.show();
    }
}
async function openEditCanvas(id) {
    try {
        const i = await fetchJson(`${API_URL}/${id}/detail`);

        document.getElementById('formOffcanvasLabel').innerText = 'Éditer intervention';
        document.getElementById('interventionIdCanvas').value = i.id ?? '';
        document.getElementById('codeInterventionCanvas').value = i.codeIntervention ?? '';
        document.getElementById('codeMaterielCanvas').value = i.codeMateriel ?? '';
        document.getElementById('libelleCanvas').value = i.libele ?? '';
        document.getElementById('typeCanvas').value = i.type ?? '';
        document.getElementById('statutCanvas').value = normalizeInterventionStatus(i.statut);

        await loadEquipmentsSelect(i.equipementId);
        await loadPrsSelect();

        currentPrsLines = Array.isArray(i.prsItems)
            ? i.prsItems.map(p => ({
                prsId: p.prsId,
                prsLibelle: p.prsLibelle,
                quantite: Number(p.quantite)
            }))
            : [];

        renderPrsLines();

        document.getElementById('dateDebutCanvas').value = toInputDateTime(i.dateDebut);
        document.getElementById('dateFinCanvas').value = toInputDateTime(i.dateFin);
        document.getElementById('preventifIdCanvas').value = i.preventifId ?? '';
        document.getElementById('commentaireCanvas').value = i.commentaire ?? '';
        document.getElementById('prsQuantiteCanvas').value = '1';
        document.getElementById('formErrorCanvas').classList.add('d-none');

        applyRequiredErrorOnEmpty();

        if (formOffcanvas) {
            formOffcanvas.show();
        }
    } catch (err) {
        console.error('Erreur édition intervention:', err);
        showWarning(err.message);
    }
}

async function saveInterventionCanvas() {
    console.log("saveInterventionCanvas appelée");

    const id = document.getElementById('interventionIdCanvas')?.value || '';
    const isUpdate = !!id;

    const payload = {
        codeIntervention: getVal('codeInterventionCanvas'),
        codeMateriel: getVal('codeMaterielCanvas'),
        libele: getVal('libelleCanvas'),
        type: getVal('typeCanvas'),
        statut: normalizeInterventionStatus(getVal('statutCanvas')),
        equipementId: getNumberVal('equipementIdCanvas'),
        dateDebut: toIsoDateTime(getVal('dateDebutCanvas')),
        dateFin: toIsoDateTime(getVal('dateFinCanvas')),
        commentaire: getVal('commentaireCanvas'),
        preventifId: getNumberVal('preventifIdCanvas'),
        prsItems: currentPrsLines.map(line => ({
            prsId: Number(line.prsId),
            quantite: Number(line.quantite)
        }))
    };

    console.log("Payload intervention envoyé:", payload);

    try {
        const url = isUpdate ? `${API_URL}/${id}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST';

        await fetchJson(url, {
            method,
            body: JSON.stringify(payload)
        });

        if (formOffcanvas) {
            formOffcanvas.hide();
        }

        await refreshPage();
    } catch (err) {
        console.error("Erreur API intervention:", err);

        const errBox = document.getElementById('formErrorCanvas');

        if (errBox) {
            errBox.textContent = err.message;
            errBox.classList.remove('d-none');
        } else {
            showWarning(err.message);
        }
    }
}

function confirmDelete(id) {
    pendingDeleteId = id;

    if (deleteModal) {
        deleteModal.show();
    }
}

async function executeDelete(id) {
    try {
        await fetchJson(`${API_URL}/${id}`, { method: 'DELETE' });
        await refreshPage();
    } catch (err) {
        console.error('Erreur suppression intervention:', err);
        showWarning(err.message);
    }
}

function openStatusModal(id) {
    pendingStatusId = id;

    if (statusModal) {
        statusModal.show();
    }
}

async function changeStatus(id, newStatus) {
    try {
        const normalizedStatus = normalizeInterventionStatus(newStatus);

        await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(normalizedStatus)}`, {
            method: 'PATCH'
        });

        await refreshPage();
    } catch (err) {
        console.error('Erreur changement statut:', err);
        showWarning(err.message);
    }
}

function getVal(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function getNumberVal(id) {
    const v = getVal(id);
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
    if (str === null || str === undefined) return '';

    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("interventions.js chargé");

    await loadUsersSelect();
    await loadEquipmentsSelect();
    await loadPrsSelect();

    renderPrsLines();

    await refreshPage();

    const interventionForm = document.getElementById('interventionFormCanvas');

    if (!interventionForm) {
        console.error("Formulaire intervention introuvable: interventionFormCanvas");
        showWarning("Erreur technique : formulaire intervention introuvable.");
        return;
    }

    interventionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log("Click Enregistrer détecté");

        try {
            const codeInterventionField = document.getElementById('codeInterventionCanvas');
            const codeMaterielField = document.getElementById('codeMaterielCanvas');
            const libelleField = document.getElementById('libelleCanvas');
            const typeField = document.getElementById('typeCanvas');
            const statutField = document.getElementById('statutCanvas');
            const equipementField = document.getElementById('equipementIdCanvas');
            const dateDebutField = document.getElementById('dateDebutCanvas');

            if (!codeInterventionField || !codeMaterielField || !libelleField || !typeField || !statutField || !equipementField || !dateDebutField) {
                console.error("Champ manquant dans le formulaire", {
                    codeInterventionField,
                    codeMaterielField,
                    libelleField,
                    typeField,
                    statutField,
                    equipementField,
                    dateDebutField
                });

                showWarning("Erreur technique : un champ obligatoire est manquant dans le formulaire.");
                return;
            }

            const codeIntervention = codeInterventionField.value.trim();
            const codeMateriel = codeMaterielField.value.trim();
            const libelle = libelleField.value.trim();
            const type = typeField.value;
            const statut = statutField.value;
            const equipementId = equipementField.value;
            const dateDebut = dateDebutField.value;

            if (!codeIntervention || !codeMateriel || !libelle || !type || !statut || !equipementId || !dateDebut) {
                showWarning("Veuillez remplir tous les champs obligatoires : Code intervention, Code matériel, Libellé, Type, Statut, Équipement, Date début.");
                applyRequiredErrorOnEmpty();
                return;
            }

            if (!validateFieldLengths()) {
                return;
            }

            await saveInterventionCanvas();
        } catch (err) {
            console.error("Erreur submit intervention:", err);
            showWarning("Erreur lors de l'enregistrement : " + err.message);
        }
    });

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (pendingDeleteId !== null) {
                await executeDelete(pendingDeleteId);

                if (deleteModal) {
                    deleteModal.hide();
                }

                pendingDeleteId = null;
            }
        });
    }

    document.querySelectorAll('.status-option-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newStatus = btn.getAttribute('data-status');

            if (pendingStatusId && newStatus) {
                await changeStatus(pendingStatusId, newStatus);

                if (statusModal) {
                    statusModal.hide();
                }

                pendingStatusId = null;
            }
        });
    });

    setupRealtimeValidation();

    const urlParams = new URLSearchParams(window.location.search);
    const equipementIdFromUrl = urlParams.get('equipementId');

    if (equipementIdFromUrl) {
        await openCreateOffcanvas(equipementIdFromUrl);
        window.history.replaceState({}, document.title, '/interventions');
    }
});

if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebar) sidebar.classList.add('collapsed');
    if (mainContent) mainContent.classList.add('expanded');
}