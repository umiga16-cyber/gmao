const API_URL = '/api/interventions';
const EQUIP_API = '/api/equipements';
const USER_API = '/api/users';
const PRS_API = '/api/stock';

const detailOffcanvasEl = document.getElementById('detailOffcanvas');
const formOffcanvasEl = document.getElementById('formOffcanvas');
const deleteModalEl = document.getElementById('deleteConfirmModal');
const statusModalEl = document.getElementById('statusModal');
const warningModalEl = document.getElementById('warningModal');
const annulationMotifModalEl = document.getElementById('annulationMotifModal');

const detailOffcanvas = detailOffcanvasEl ? new bootstrap.Offcanvas(detailOffcanvasEl) : null;
const formOffcanvas = formOffcanvasEl ? new bootstrap.Offcanvas(formOffcanvasEl) : null;
const deleteModal = deleteModalEl ? new bootstrap.Modal(deleteModalEl) : null;
const statusModal = statusModalEl ? new bootstrap.Modal(statusModalEl) : null;
const warningModal = warningModalEl ? new bootstrap.Modal(warningModalEl) : null;
let annulationMotifModal = null;
if (annulationMotifModalEl) annulationMotifModal = new bootstrap.Modal(annulationMotifModalEl);

let pendingDeleteId = null;
let pendingStatusId = null;
let pendingNewStatus = null;
let allInterventions = [];
let usersMap = new Map();
let equipmentsMap = new Map();
let prsCatalog = [];
let currentPrsLines = [];

// --- Rôle utilisateur (ADMIN ou non) ---
let isAdmin = false;
const BACKEND_SUPPORTS_ARCHIVE = false;

// --- Sélection unique ---
let selectedInterventionId = null;

// ======================== OBTENIR LE RÔLE UTILISATEUR ========================
async function loadCurrentUserRole() {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            const user = await response.json();
            isAdmin = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
        } else {
            console.warn("Impossible d'obtenir le rôle, utilisateur standard supposé");
        }
    } catch (err) {
        console.warn("Erreur récupération rôle:", err);
    }
}

// ======================== RÈGLES DE TRANSITION ========================
function getAllowedNextStatuses(currentStatus, isAdmin) {
    const norm = normalizeInterventionStatus(currentStatus);
    if (norm === 'ANNULEE') return [];
    if (norm === 'PLANIFIEE') return ['EN_COURS'];
    if (norm === 'EN_COURS') return ['TERMINEE', 'ANNULEE'];
    if (norm === 'TERMINEE') {
        let allowed = [];
        if (BACKEND_SUPPORTS_ARCHIVE) allowed.push('ARCHIVEE');
        if (isAdmin) allowed.push('EN_COURS');
        return allowed;
    }
    if (norm === 'ARCHIVEE') return [];
    return [];
}

function normalizeInterventionStatus(status) {
    const value = (status || '').trim().toUpperCase();
    if (value === 'OPEN') return 'PLANIFIEE';
    if (value === 'IN_PROGRESS') return 'EN_COURS';
    if (value === 'CLOSED' || value === 'DONE' || value === 'COMPLETED') return 'TERMINEE';
    if (value === 'CANCELED' || value === 'CANCELLED') return 'ANNULEE';
    if (value === 'ARCHIVED' || value === 'ARCHIVEE') return 'ARCHIVEE';
    return value;
}

// ======================== GÉNÉRATION CODE INTERVENTION ========================
function generateNextInterventionCode() {
    if (!allInterventions.length) return 'INT-000000001';
    const numbers = allInterventions
        .map(interv => {
            const code = interv.codeIntervention || '';
            const match = code.match(/^INT-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
    if (numbers.length === 0) return 'INT-000000001';
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    const padded = String(nextNumber).padStart(9, '0');
    return `INT-${padded}`;
}

// ======================== UTILITAIRES ========================
function truncateText(text, maxLen) {
    if (!text) return '—';
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '…';
}

function showWarning(message) {
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) warningMessage.textContent = message;
    openModalSafely('warningModal');
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
        } catch (_) {}
        throw new Error(message || `Erreur HTTP ${response.status}`);
    }
    if (!rawText) return null;
    try {
        return JSON.parse(rawText);
    } catch (_) {
        return rawText;
    }
}

// ======================== CHARGEMENT DES DONNÉES ========================
async function loadEquipmentsMap() {
    try {
        const data = await fetchJson(EQUIP_API);
        equipmentsMap.clear();
        if (Array.isArray(data)) {
            data.forEach(equip => {
                equipmentsMap.set(Number(equip.id), equip.code || '');
            });
        }
    } catch (err) {
        console.error('Erreur chargement carte équipements:', err);
    }
}

async function loadEquipmentsSelect(selectedId = null) {
    try {
        const data = await fetchJson(EQUIP_API);
        const select = document.getElementById('equipementIdCanvas');
        if (!select) return;
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
        if (!select) return;
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
        'codeInterventionCanvas', 'libelleCanvas', 'typeCanvas',
        'equipementIdCanvas', 'dateDebutCanvas'
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
        'codeInterventionCanvas', 'libelleCanvas', 'typeCanvas',
        'equipementIdCanvas', 'dateDebutCanvas'
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

// ======================== STATISTIQUES ET TABLEAU ========================
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
    if (termineesEl) termineesEl.textContent = interventions.filter(i => normalizeInterventionStatus(i.statut) === 'TERMINEE').length;
    if (enCoursEl) enCoursEl.textContent = interventions.filter(i => normalizeInterventionStatus(i.statut) === 'EN_COURS').length;
    if (planifieesEl) planifieesEl.textContent = interventions.filter(i => normalizeInterventionStatus(i.statut) === 'PLANIFIEE').length;
}

async function loadInterventions() {
    const data = await fetchJson(API_URL);
    allInterventions = Array.isArray(data) ? data : [];
    renderTable(allInterventions);
}

function parseInterventionDate(value) {
    if (!value) return null;
    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = value;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
    return null;
}

function isInsidePeriod(dateValue, period) {
    if (!period || !dateValue) return true;
    const date = parseInterventionDate(dateValue);
    if (!date) return false;
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
        return true;
    }
    return date >= start && date <= end;
}

function applyFilters() {
    const status = document.getElementById('statusFilter')?.value.trim() || '';
    const type = document.getElementById('typeFilter')?.value.trim() || '';
    const equipementKeyword = document.getElementById('equipementFilter')?.value.trim().toLowerCase() || '';
    const urlParams = new URLSearchParams(window.location.search);
    const period = urlParams.get('period');
    const filtered = allInterventions.filter(i => {
        const statusOk = !status || normalizeInterventionStatus(i.statut) === status.toUpperCase();
        const typeOk = !type || (i.type || '').toUpperCase() === type.toUpperCase();
        const equipementText = (equipmentsMap.get(i.equipementId) || i.equipementDescription || '').toLowerCase();
        const equipOk = !equipementKeyword || equipementText.includes(equipementKeyword);
        const periodOk = isInsidePeriod(i.dateDebut, period);
        return statusOk && typeOk && equipOk && periodOk;
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

// ======================== RENDU TABLEAU AVEC SÉLECTION UNIQUE ========================
function renderStatusBadge(status) {
    const normalized = normalizeInterventionStatus(status);
    let cls = 'status-badge ';
    let label = '';
    switch (normalized) {
        case 'PLANIFIEE': cls += 'status-PLANIFIEE'; label = 'En préparation'; break;
        case 'EN_COURS': cls += 'status-EN_COURS'; label = 'En cours'; break;
        case 'TERMINEE': cls += 'status-TERMINEE'; label = 'Terminée'; break;
        case 'ANNULEE': cls += 'status-ANNULEE'; label = 'Annulée'; break;
        case 'ARCHIVEE': cls += 'status-ARCHIVEE'; label = 'Archivée'; break;
        default: cls += 'status-PLANIFIEE'; label = escapeHtml(status);
    }
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

function renderTable(data) {
    const tbody = document.getElementById('interventionsTableBody');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state text-center"><i class="fas fa-wrench fa-3x mb-3 d-block"></i><h5>Aucune intervention</h5><p class="text-muted mb-0">Commencez par créer une nouvelle intervention</p></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(i => {
        const codeIntervention = escapeHtml(i.codeIntervention || '—');
        const libelleFull = escapeHtml(i.libele || '');
        const libelleTrunc = truncateText(libelleFull, 80);
        const equipCode = equipmentsMap.get(Number(i.equipementId));
        const equipDisplay = equipCode ? equipCode : (i.equipementDescription || `Équipement #${i.equipementId}`);
        const equipFull = escapeHtml(equipDisplay);
        const equipTrunc = truncateText(equipFull, 30);
        const creatorName = usersMap.get(Number(i.createdById)) || ('User #' + i.createdById);
        const isSelected = (selectedInterventionId === i.id);
        return `
            <tr data-id="${i.id}" class="${isSelected ? 'selected-row' : ''}">
                <td class="text-center"><input type="radio" name="intervSelect" value="${i.id}" class="radio-select" ${isSelected ? 'checked' : ''}></td>
                <td title="${codeIntervention}">${codeIntervention}</td>
                <td title="${libelleFull}">${libelleTrunc}</td>
                <td>${renderTypeBadge(i.type)}</td>
                <td title="${equipFull}">${equipTrunc}</td>
                <td>${renderStatusBadge(i.statut)}</td>
                <td style="white-space: nowrap;">${formatDate(i.dateDebut)}</td>
                <td style="white-space: nowrap;">${i.dateFin ? formatDate(i.dateFin) : '—'}</td>
                <td>${escapeHtml(creatorName)}</td>
            </tr>
        `;
    }).join('');
    bindSelectionEvents();
}

function bindSelectionEvents() {
    document.querySelectorAll('input[name="intervSelect"]').forEach(radio => {
        radio.removeEventListener('change', handleRadioChange);
        radio.addEventListener('change', handleRadioChange);
    });
    document.querySelectorAll('#interventionsTableBody tr').forEach(row => {
        row.removeEventListener('click', handleRowClick);
        row.addEventListener('click', handleRowClick);
    });
}

function handleRadioChange(event) {
    if (event.target.checked) {
        selectedInterventionId = parseInt(event.target.value);
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
        selectedInterventionId = parseInt(row.dataset.id);
        highlightSelectedRow();
        updateToolbarState();
    }
}

function highlightSelectedRow() {
    document.querySelectorAll('#interventionsTableBody tr').forEach(tr => {
        const id = parseInt(tr.dataset.id);
        if (selectedInterventionId === id) tr.classList.add('selected-row');
        else tr.classList.remove('selected-row');
    });
}

// ======================== BARRE D'ACTIONS CENTRALISÉE ========================
function updateToolbarState() {
    const hasSelection = selectedInterventionId !== null;
    const btns = ['btnDetail', 'btnEdit', 'btnStatus', 'btnDelete'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !hasSelection;
    });
}

function actionDetail() {
    if (selectedInterventionId) showDetailCanvas(selectedInterventionId);
    else showWarning("Veuillez sélectionner une intervention.");
}

function actionEdit() {
    if (selectedInterventionId) openEditCanvas(selectedInterventionId);
    else showWarning("Veuillez sélectionner une intervention.");
}

function actionChangeStatus() {
    if (selectedInterventionId) openStatusModal(selectedInterventionId);
    else showWarning("Veuillez sélectionner une intervention.");
}

function actionDelete() {
    if (selectedInterventionId) confirmDelete(selectedInterventionId);
    else showWarning("Veuillez sélectionner une intervention.");
}

// ======================== GESTION DES LIGNES DE PR ========================
function renderPrsLines() {
    const tbody = document.getElementById('prsLinesBody');
    if (!tbody) return;
    if (!currentPrsLines.length) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-muted text-center">Aucune PR sélectionnée</td></tr>`;
        return;
    }
    tbody.innerHTML = currentPrsLines.map(line => `
        <tr>
            <td>${escapeHtml(line.prsLibelle)}</td>
            <td>${line.quantite}</td>
            <td><button type="button" class="btn btn-sm btn-outline-danger" onclick="removePrsLine(${line.prsId})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function addPrsLine() {
    const prsSelect = document.getElementById('prsSelectCanvas');
    const qtyInput = document.getElementById('prsQuantiteCanvas');
    if (!prsSelect || !qtyInput) return;
    const prsId = Number(prsSelect.value);
    const quantite = Number(qtyInput.value);
    if (!prsId) { showWarning("Sélectionnez une PR."); return; }
    if (!quantite || quantite <= 0) { showWarning("La quantité PR doit être supérieure à 0."); return; }
    const prs = prsCatalog.find(p => Number(p.id) === prsId);
    if (!prs) { showWarning("PR introuvable."); return; }
    const existing = currentPrsLines.find(line => Number(line.prsId) === prsId);
    if (existing) {
        existing.quantite += quantite;
    } else {
        currentPrsLines.push({ prsId: prs.id, prsLibelle: prs.libelle, quantite: quantite });
    }
    renderPrsLines();
    prsSelect.value = '';
    qtyInput.value = '1';
}

function removePrsLine(prsId) {
    currentPrsLines = currentPrsLines.filter(line => Number(line.prsId) !== Number(prsId));
    renderPrsLines();
}

// ======================== DÉTAIL D'UNE INTERVENTION ========================
async function showDetailCanvas(id) {
    try {
        const i = await fetchJson(`${API_URL}/${id}/detail`);
        const creatorName = usersMap.get(Number(i.createdById)) || ('User #' + i.createdById);
        const equipCode = equipmentsMap.get(Number(i.equipementId)) || i.equipementDescription || (`Équipement #${i.equipementId}`);

        const prsHtml = Array.isArray(i.prsItems) && i.prsItems.length
            ? `<div class="section-title"><i class="fas fa-boxes me-2 text-primary"></i> PRs consommées</div>
               <div class="detail-card"><div class="table-responsive"><table class="table table-sm mb-0"><thead><tr><th>PR</th><th>Quantité</th></tr></thead><tbody>${i.prsItems.map(p => `<tr><td>${escapeHtml(p.prsLibelle)}</td><td>${p.quantite}</td></tr>`).join('')}</tbody></table></div></div>`
            : '';

        let motifAnnulation = null;
        if (i.commentaire) {
            const match = i.commentaire.match(/\[ANNULATION\]\s*(.*?)(\n|$)/);
            if (match) motifAnnulation = match[1];
        }

        let annulationHtml = '';
        if (normalizeInterventionStatus(i.statut) === 'ANNULEE') {
            if (motifAnnulation) {
                annulationHtml = `<div class="section-title mt-3"><i class="fas fa-ban me-2 text-danger"></i> Motif d'annulation</div><div class="detail-card bg-light border-start border-4 border-danger"><div class="detail-value">${escapeHtml(motifAnnulation)}</div></div>`;
            } else if (i.commentaire) {
                annulationHtml = `<div class="section-title mt-3"><i class="fas fa-ban me-2 text-danger"></i> Motif d'annulation (dans commentaire)</div><div class="detail-card bg-light border-start border-4 border-danger"><div class="detail-value">${escapeHtml(i.commentaire)}</div></div>`;
            } else {
                annulationHtml = `<div class="section-title mt-3"><i class="fas fa-ban me-2 text-danger"></i> Motif d'annulation</div><div class="detail-card bg-light border-start border-4 border-danger"><div class="detail-value text-muted">Aucun motif fourni</div></div>`;
            }
        }

        let commentaireNormal = i.commentaire || '';
        if (commentaireNormal && commentaireNormal.includes('[ANNULATION]')) {
            commentaireNormal = commentaireNormal.replace(/\[ANNULATION\][^\n]*\n?/, '').trim();
        }

        const html = `
            <div class="detail-header"><div class="detail-icon"><i class="fas fa-clipboard-list fa-2x" style="color: var(--primary);"></i></div><h4 class="fw-bold mb-1">${escapeHtml(i.libele)}</h4></div>
            <div class="section-title"><i class="fas fa-info-circle me-2 text-primary"></i> Informations générales</div>
            <div class="row g-3 mb-4">
                <div class="col-6"><div class="detail-card"><div class="detail-label">Code intervention</div><div class="detail-value">${escapeHtml(i.codeIntervention || '—')}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Type</div><div class="detail-value">${renderTypeBadge(i.type)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Statut</div><div class="detail-value">${renderStatusBadge(i.statut)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Équipement</div><div class="detail-value">${escapeHtml(equipCode)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Créé par</div><div class="detail-value">${escapeHtml(creatorName)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Préventif ID</div><div class="detail-value">${i.preventifId ?? '—'}</div></div></div>
            </div>
            <div class="section-title"><i class="fas fa-calendar-alt me-2 text-primary"></i> Dates</div>
            <div class="row g-3 mb-4">
                <div class="col-6"><div class="detail-card"><div class="detail-label">Date début</div><div class="detail-value">${formatDate(i.dateDebut)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Date fin</div><div class="detail-value">${i.dateFin ? formatDate(i.dateFin) : '—'}</div></div></div>
            </div>
            ${prsHtml}
            ${annulationHtml}
            ${commentaireNormal ? `<div class="section-title"><i class="fas fa-comment-dots me-2 text-primary"></i> Commentaire</div><div class="detail-card mb-3"><div class="detail-value">${escapeHtml(commentaireNormal)}</div></div>` : ''}
            <hr class="my-3"><div class="text-end text-muted small"><i class="fas fa-hashtag me-1"></i> ID interne : ${i.id}</div>
        `;
        document.getElementById('detailBodyCanvas').innerHTML = html;
        if (detailOffcanvas) detailOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

// ======================== CRÉATION D'UNE INTERVENTION ========================
async function openCreateOffcanvas(preselectedEquipementId = null) {
    const formLabel = document.getElementById('formOffcanvasLabel');
    const form = document.getElementById('interventionFormCanvas');
    const interventionId = document.getElementById('interventionIdCanvas');
    const formError = document.getElementById('formErrorCanvas');
    const prsQty = document.getElementById('prsQuantiteCanvas');
    const statutContainer = document.getElementById('statutFieldContainer');
    const statutSelect = document.getElementById('statutCanvas');
    
    if (formLabel) formLabel.innerText = 'Nouvelle intervention';
    if (form) form.reset();
    if (interventionId) interventionId.value = '';
    if (formError) formError.classList.add('d-none');
    currentPrsLines = [];
    await loadEquipmentsSelect(preselectedEquipementId);
    await loadPrsSelect();
    renderPrsLines();
    if (prsQty) prsQty.value = '1';
    if (preselectedEquipementId) {
        const equipementSelect = document.getElementById('equipementIdCanvas');
        if (equipementSelect) equipementSelect.value = String(preselectedEquipementId);
    }
    const codeInput = document.getElementById('codeInterventionCanvas');
    if (codeInput) {
        codeInput.value = generateNextInterventionCode();
        codeInput.readOnly = true;
        codeInput.style.backgroundColor = '#e9ecef';
    }
    
    if (statutSelect) {
        statutSelect.value = 'PLANIFIEE';
        statutSelect.disabled = true;
    }
    if (statutContainer) statutContainer.style.display = 'block';
    
    applyRequiredErrorOnEmpty();
    if (formOffcanvas) formOffcanvas.show();
}

// ======================== ÉDITION D'UNE INTERVENTION ========================
let originalStatusForEdit = null;

async function openEditCanvas(id) {
    try {
        const i = await fetchJson(`${API_URL}/${id}/detail`);
        originalStatusForEdit = normalizeInterventionStatus(i.statut);
        
        document.getElementById('formOffcanvasLabel').innerText = 'Éditer intervention';
        document.getElementById('interventionIdCanvas').value = i.id ?? '';
        const codeInput = document.getElementById('codeInterventionCanvas');
        if (codeInput) {
            codeInput.value = i.codeIntervention ?? '';
            codeInput.readOnly = true;
            codeInput.style.backgroundColor = '#e9ecef';
        }
        document.getElementById('libelleCanvas').value = i.libele ?? '';
        document.getElementById('typeCanvas').value = i.type ?? '';
        await loadEquipmentsSelect(i.equipementId);
        await loadPrsSelect();
        currentPrsLines = Array.isArray(i.prsItems) ? i.prsItems.map(p => ({ prsId: p.prsId, prsLibelle: p.prsLibelle, quantite: Number(p.quantite) })) : [];
        renderPrsLines();
        document.getElementById('dateDebutCanvas').value = toInputDateTime(i.dateDebut);
        document.getElementById('dateFinCanvas').value = toInputDateTime(i.dateFin);
        document.getElementById('preventifIdCanvas').value = i.preventifId ?? '';
        document.getElementById('commentaireCanvas').value = i.commentaire ?? '';
        document.getElementById('prsQuantiteCanvas').value = '1';
        document.getElementById('formErrorCanvas').classList.add('d-none');
        
        const statutContainer = document.getElementById('statutFieldContainer');
        if (statutContainer) statutContainer.style.display = 'none';
        
        applyRequiredErrorOnEmpty();
        if (formOffcanvas) formOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

async function saveInterventionCanvas() {
    const id = document.getElementById('interventionIdCanvas')?.value || '';
    const isUpdate = !!id;
    if (!addPendingPrsLineBeforeSave()) return;
    
    let payload = {
        codeIntervention: getVal('codeInterventionCanvas'),
        libele: getVal('libelleCanvas'),
        type: getVal('typeCanvas'),
        equipementId: getNumberVal('equipementIdCanvas'),
        dateDebut: toIsoDateTime(getVal('dateDebutCanvas')),
        dateFin: toIsoDateTime(getVal('dateFinCanvas')),
        commentaire: getVal('commentaireCanvas'),
        preventifId: getNumberVal('preventifIdCanvas'),
        prsItems: currentPrsLines.map(line => ({ prsId: Number(line.prsId), quantite: Number(line.quantite) }))
    };
    
    if (!isUpdate) {
        payload.statut = 'PLANIFIEE';
    } else {
        payload.statut = originalStatusForEdit;
    }
    
    try {
        const url = isUpdate ? `${API_URL}/${id}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST';
        await fetchJson(url, { method, body: JSON.stringify(payload) });
        if (formOffcanvas) formOffcanvas.hide();
        await refreshPage();
        await loadEquipmentsMap();
        renderTable(allInterventions);
    } catch (err) {
        const errBox = document.getElementById('formErrorCanvas');
        if (errBox) {
            errBox.textContent = err.message;
            errBox.classList.remove('d-none');
        } else {
            showWarning(err.message);
        }
    }
}

function addPendingPrsLineBeforeSave() {
    const prsSelect = document.getElementById('prsSelectCanvas');
    const qtyInput = document.getElementById('prsQuantiteCanvas');
    if (!prsSelect || !qtyInput) return true;
    const prsId = Number(prsSelect.value);
    const quantite = Number(qtyInput.value);
    if (!prsId) return true;
    if (!quantite || quantite <= 0) {
        showWarning("La quantité PR doit être supérieure à 0.");
        return false;
    }
    const prs = prsCatalog.find(p => Number(p.id) === prsId);
    if (!prs) {
        showWarning("PR introuvable.");
        return false;
    }
    const existing = currentPrsLines.find(line => Number(line.prsId) === prsId);
    if (existing) {
        existing.quantite += quantite;
    } else {
        currentPrsLines.push({ prsId: prs.id, prsLibelle: prs.libelle, quantite: quantite });
    }
    renderPrsLines();
    prsSelect.value = '';
    qtyInput.value = '1';
    return true;
}

// ======================== SUPPRESSION ========================
async function confirmDelete(id) {
    try {
        const intervention = await fetchJson(`${API_URL}/${id}/detail`);
        const currentStatus = normalizeInterventionStatus(intervention.statut);
        if (currentStatus !== 'PLANIFIEE') {
            showWarning("La suppression d’une intervention n’est possible qu’à l’état « EN PRÉPARATION ».");
            return;
        }
        const check = await fetchJson(`${API_URL}/${id}/delete-check`);
        if (!check.canDelete) {
            showWarning(check.message || "Impossible de supprimer cette intervention.");
            return;
        }
        pendingDeleteId = id;
        openModalSafely('deleteConfirmModal');
    } catch (err) {
        showWarning(err.message || "Erreur lors de la vérification avant suppression.");
    }
}

async function executeDelete(id) {
    try {
        await fetchJson(`${API_URL}/${id}`, { method: 'DELETE' });
        const modalElement = document.getElementById('deleteConfirmModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        cleanupModalState();
        if (selectedInterventionId === id) selectedInterventionId = null;
        pendingDeleteId = null;
        await refreshPage();
    } catch (err) {
        cleanupModalState();
        showWarning(err.message || "Suppression impossible.");
    }
}

// ======================== CHANGEMENT DE STATUT ========================
async function openStatusModal(id) {
    try {
        const intervention = await fetchJson(`${API_URL}/${id}/detail`);
        const currentStatus = normalizeInterventionStatus(intervention.statut);
        const allowedStatuses = getAllowedNextStatuses(currentStatus, isAdmin);
        
        if (allowedStatuses.length === 0) {
            showWarning("Aucun changement de statut possible pour cette intervention.");
            return;
        }
        
        const allBtns = document.querySelectorAll('.status-option-btn');
        allBtns.forEach(btn => btn.style.display = 'none');
        
        allowedStatuses.forEach(status => {
            const btn = document.querySelector(`.status-option-btn[data-status="${status}"]`);
            if (btn) btn.style.display = 'block';
        });
        
        if (allowedStatuses.includes('ARCHIVEE') && !document.querySelector('.status-option-btn[data-status="ARCHIVEE"]')) {
            const container = document.querySelector('#statusModal .d-grid');
            if (container) {
                const newBtn = document.createElement('button');
                newBtn.className = 'btn btn-outline-secondary status-option-btn';
                newBtn.setAttribute('data-status', 'ARCHIVEE');
                newBtn.innerHTML = '<i class="fas fa-archive me-2"></i> Archivée';
                container.appendChild(newBtn);
                newBtn.addEventListener('click', async () => {
                    if (pendingStatusId) await changeStatus(pendingStatusId, 'ARCHIVEE', null);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
                    if (modal) modal.hide();
                    cleanupModalState();
                    pendingStatusId = null;
                });
            }
        }
        
        pendingStatusId = id;
        openModalSafely('statusModal');
    } catch (err) {
        showWarning(err.message);
    }
}

async function onStatusSelected(id, newStatus) {
    if (newStatus === 'ANNULEE') {
        pendingStatusId = id;
        pendingNewStatus = newStatus;
        const motifTextarea = document.getElementById('motifAnnulation');
        if (motifTextarea) {
            motifTextarea.value = '';
            motifTextarea.classList.remove('is-invalid');
        }
        const errorDiv = document.getElementById('motifAnnulationError');
        if (errorDiv) errorDiv.style.display = 'none';
        
        const statusModalElLocal = document.getElementById('statusModal');
        const statusModalInstance = bootstrap.Modal.getInstance(statusModalElLocal);
        if (statusModalInstance) statusModalInstance.hide();
        cleanupModalState();
        
        if (annulationMotifModal) annulationMotifModal.show();
    } else {
        await changeStatus(id, newStatus, null);
        const modalElement = document.getElementById('statusModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        cleanupModalState();
        pendingStatusId = null;
    }
}

async function changeStatus(id, newStatus, motif) {
    try {
        const intervention = await fetchJson(`${API_URL}/${id}/detail`);
        const currentStatus = normalizeInterventionStatus(intervention.statut);
        const allowed = getAllowedNextStatuses(currentStatus, isAdmin);
        if (!allowed.includes(newStatus)) {
            showWarning("Changement de statut non autorisé selon les règles.");
            return;
        }
        
        const normalizedStatus = normalizeInterventionStatus(newStatus);
        await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(normalizedStatus)}`, { method: 'PATCH' });
        
        if (motif) {
            const updated = await fetchJson(`${API_URL}/${id}/detail`);
            const motifLine = `[ANNULATION] ${motif}`;
            let newCommentaire = updated.commentaire || '';
            if (!newCommentaire.includes(motifLine)) {
                newCommentaire = motifLine + '\n' + newCommentaire;
            }
            const payload = {
                codeIntervention: updated.codeIntervention,
                libele: updated.libele,
                type: updated.type,
                statut: normalizedStatus,
                equipementId: updated.equipementId,
                dateDebut: updated.dateDebut,
                dateFin: updated.dateFin,
                commentaire: newCommentaire,
                preventifId: updated.preventifId,
                prsItems: updated.prsItems || []
            };
            await fetchJson(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        }
        
        await refreshPage();
        if (selectedInterventionId === id) {
            // rien à faire, on garde la sélection
        }
    } catch (err) {
        showWarning(err.message);
    }
}

// ======================== FILTRES PAR CARTES STATISTIQUES ========================
function filterByStatus(status) {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.value = status;
        applyFilters();
    }
}

// ======================== FONCTIONS UTILITAIRES ========================
function cleanupModalState() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
}

function openModalSafely(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;
    document.body.appendChild(modalElement);
    cleanupModalState();
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement, { backdrop: true, keyboard: true, focus: true });
    modal.show();
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

// ======================== INITIALISATION ========================
document.addEventListener('DOMContentLoaded', async () => {
    console.log("interventions.js chargé");
    await loadCurrentUserRole();
    await loadUsersSelect();
    await loadEquipmentsMap();
    await loadEquipmentsSelect();
    await loadPrsSelect();
    renderPrsLines();
    await refreshPage();

    // Attacher les événements de clic sur les cartes statistiques (déjà fait via onclick inline)
    // Pas besoin de attachCardFilters ici car les cartes ont des onclick dans le HTML

    const urlParams = new URLSearchParams(window.location.search);
    const statusFromUrl = urlParams.get('status');
    const typeFromUrl = urlParams.get('type');
    const equipementIdFromUrl = urlParams.get('equipementId');
    const periodFromUrl = urlParams.get('period');
    if (statusFromUrl) {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) statusFilter.value = statusFromUrl;
    }
    if (typeFromUrl) {
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) typeFilter.value = typeFromUrl;
    }
    if (statusFromUrl || typeFromUrl || periodFromUrl) applyFilters();
    if (equipementIdFromUrl) await openCreateOffcanvas(equipementIdFromUrl);
    if (statusFromUrl || typeFromUrl || periodFromUrl || equipementIdFromUrl) {
        window.history.replaceState({}, document.title, '/interventions');
    }

    const interventionForm = document.getElementById('interventionFormCanvas');
    if (interventionForm) {
        interventionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const codeInterventionField = document.getElementById('codeInterventionCanvas');
            const libelleField = document.getElementById('libelleCanvas');
            const typeField = document.getElementById('typeCanvas');
            const equipementField = document.getElementById('equipementIdCanvas');
            const dateDebutField = document.getElementById('dateDebutCanvas');
            if (!codeInterventionField || !libelleField || !typeField || !equipementField || !dateDebutField) {
                showWarning("Erreur technique : un champ obligatoire est manquant dans le formulaire.");
                return;
            }
            const codeIntervention = codeInterventionField.value.trim();
            const libelle = libelleField.value.trim();
            const type = typeField.value;
            const equipementId = equipementField.value;
            const dateDebut = dateDebutField.value;
            if (!codeIntervention || !libelle || !type || !equipementId || !dateDebut) {
                showWarning("Veuillez remplir tous les champs obligatoires : Code intervention, Libellé, Type, Équipement, Date début.");
                applyRequiredErrorOnEmpty();
                return;
            }
            if (!validateFieldLengths()) return;
            await saveInterventionCanvas();
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (pendingDeleteId !== null) {
                await executeDelete(pendingDeleteId);
                if (deleteModal) deleteModal.hide();
                pendingDeleteId = null;
            }
        });
    }

    document.querySelectorAll('.status-option-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newStatus = btn.getAttribute('data-status');
            if (pendingStatusId && newStatus) {
                if (newStatus === 'ANNULEE') {
                    await onStatusSelected(pendingStatusId, newStatus);
                } else {
                    await changeStatus(pendingStatusId, newStatus, null);
                    const modalElement = document.getElementById('statusModal');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) modal.hide();
                    cleanupModalState();
                    pendingStatusId = null;
                }
            }
        });
    });

    const confirmAnnulationBtn = document.getElementById('confirmAnnulationBtn');
    if (confirmAnnulationBtn) {
        confirmAnnulationBtn.addEventListener('click', async () => {
            const motifTextarea = document.getElementById('motifAnnulation');
            const motif = motifTextarea ? motifTextarea.value.trim() : '';
            if (!motif) {
                if (motifTextarea) motifTextarea.classList.add('is-invalid');
                const errorDiv = document.getElementById('motifAnnulationError');
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }
            if (pendingStatusId && pendingNewStatus === 'ANNULEE') {
                await changeStatus(pendingStatusId, 'ANNULEE', motif);
                if (annulationMotifModal) annulationMotifModal.hide();
                cleanupModalState();
                pendingStatusId = null;
                pendingNewStatus = null;
            }
        });
    }

    const interventionIdFromUrl = urlParams.get('interventionId');
    if (interventionIdFromUrl) {
        showDetailCanvas(interventionIdFromUrl);
    }

    setupRealtimeValidation();
});

// Ajustement responsive du sidebar
if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (sidebar) sidebar.classList.add('collapsed');
    if (mainContent) mainContent.classList.add('expanded');
}