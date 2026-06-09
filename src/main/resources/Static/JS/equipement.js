const API_URL = '/api/equipements';

const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

let pendingDeleteId = null;
let pendingStatusId = null;
let currentEquipements = [];
let allEquipements = [];
let currentQuickFilter = 'TOTAL';

// Variables para el modal de confirmación de eliminación de documentos
let pendingDocumentId = null;
let pendingEquipementIdForDoc = null;
const deleteDocModal = new bootstrap.Modal(document.getElementById('deleteDocConfirmModal'));

// Variable global para evitar importaciones simultáneas
let isImporting = false;

// Archivos pendientes durante la creación de un nuevo equipo
let pendingFilesForNewEquipment = [];

// ======================== Funciones auxiliares ========================
function truncateText(text, maxLen) {
    if (!text) return '—';
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '…';
}

function generateNextEquipmentCode() {
    if (!allEquipements.length) return 'EQ-000000001';
    const numbers = allEquipements
        .map(eq => {
            const code = eq.code || '';
            const match = code.match(/^EQ-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
    if (numbers.length === 0) return 'EQ-000000001';
    const maxNum = Math.max(...numbers);
    const next = maxNum + 1;
    const padded = String(next).padStart(9, '0');
    return `EQ-${padded}`;
}

function generateNextImportCode(generatedCodes) {
    let maxNum = 0;
    if (allEquipements.length) {
        const numbers = allEquipements
            .map(eq => {
                const code = eq.code || '';
                const match = code.match(/^EQ-(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => num > 0);
        if (numbers.length) maxNum = Math.max(...numbers);
    }
    for (const code of generatedCodes) {
        const match = code.match(/^EQ-(\d+)$/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    }
    const next = maxNum + 1;
    const padded = String(next).padStart(9, '0');
    return `EQ-${padded}`;
}

function excelSerialToDate(serial) {
    const excelEpoch = new Date(1899, 11, 30);
    const milliseconds = serial * 86400000;
    return new Date(excelEpoch.getTime() + milliseconds);
}

function parseDateToMySQL(dateStr) {
    if (dateStr === null || dateStr === undefined || dateStr === '') return null;
    
    if (typeof dateStr === 'number') {
        const dateObj = excelSerialToDate(dateStr);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    let str = String(dateStr).trim();
    if (/^\d+(\.\d+)?$/.test(str)) {
        const num = parseFloat(str);
        if (!isNaN(num)) {
            const dateObj = excelSerialToDate(num);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    
    let matchIso = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matchIso) return matchIso[1];
    
    let day, month, year;
    let match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (match) {
        day = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
        year = parseInt(match[3], 10);
        if (year < 100) year += 2000;
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }
    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        month = parseInt(match[1], 10);
        day = parseInt(match[2], 10);
        year = parseInt(match[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }
    console.warn("Formato de fecha no reconocido:", dateStr);
    return null;
}

function validateInstallationDatesCanvas() {
    const dateInstallation = getVal('dateInstallationCanvas');
    const dateMiseEnService = getVal('dateMiseEnServiceCanvas');
    if (dateInstallation && dateMiseEnService && dateInstallation >= dateMiseEnService) {
        showWarning("La date d’installation doit être strictement antérieure à la date de mise en service.");
        return false;
    }
    return true;
}

function validateFieldLengths() {
    const fields = [
        { id: 'codeCanvas', max: 50, name: 'Code' },
        { id: 'descriptionCanvas', max: 200, name: 'Description' },
        { id: 'typeCanvas', max: 50, name: 'Type' },
        { id: 'marqueCanvas', max: 50, name: 'Marque' },
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
    const requiredFields = ['codeCanvas', 'descriptionCanvas', 'typeCanvas'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            const validateField = () => {
                if (field.value.trim() !== '') field.classList.remove('required-error');
                else field.classList.add('required-error');
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
            if (field.value.trim() === '') field.classList.add('required-error');
            else field.classList.remove('required-error');
        }
    });
}

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

async function refreshPage() {
    try {
        const data = await fetchJson(API_URL);
        allEquipements = Array.isArray(data) ? data : [];
        applyCurrentFiltersAndQuickAccess();
    } catch (err) {
        showWarning('Erreur: ' + err.message);
    }
}

async function loadEquipments() {
    const data = await fetchJson(API_URL);
    allEquipements = Array.isArray(data) ? data : [];
    applyCurrentFiltersAndQuickAccess();
}

function getBaseFilteredEquipments() {
    const kw = document.getElementById('searchKeyword')?.value.trim().toLowerCase() || '';
    const st = document.getElementById('statusFilter')?.value.trim() || '';
    const localisation = document.getElementById('localisationFilter')?.value.trim().toLowerCase() || '';
    const parentId = document.getElementById('parentIdFilter')?.value.trim() || '';

    let equipments = Array.isArray(allEquipements) ? [...allEquipements] : [];

    if (st) equipments = equipments.filter(e => (e.statut || '').toUpperCase() === st.toUpperCase());
    if (kw) equipments = equipments.filter(e => (e.code || '').toLowerCase().includes(kw) || (e.description || '').toLowerCase().includes(kw));
    if (localisation) equipments = equipments.filter(e => (e.localisation || '').toLowerCase().includes(localisation));
    if (parentId) equipments = equipments.filter(e => String(e.parentId || '') === parentId);
    return equipments;
}

function applyCurrentFiltersAndQuickAccess() {
    const baseFiltered = getBaseFilteredEquipments();
    updateStatsFromData(baseFiltered);
    let result = [...baseFiltered];
    if (currentQuickFilter === 'ACTIF') result = result.filter(e => (e.statut || '').toUpperCase() === 'ACTIF');
    if (currentQuickFilter === 'MAINTENANCE') result = result.filter(e => (e.statut || '').toUpperCase() === 'MAINTENANCE');
    if (currentQuickFilter === 'HS') result = result.filter(e => (e.statut || '').toUpperCase() === 'HS');
    currentEquipements = result;
    renderTable(currentEquipements);
    updateQuickCardsStyle();
}

function updateStatsFromData(equipments) {
    const data = Array.isArray(equipments) ? equipments : [];
    const getStatus = (e) => (e.statut || '').toUpperCase();
    document.getElementById('totalEquipments').textContent = data.length;
    document.getElementById('equipmentsActifs').textContent = data.filter(e => getStatus(e) === 'ACTIF').length;
    document.getElementById('equipmentsMaintenance').textContent = data.filter(e => getStatus(e) === 'MAINTENANCE').length;
    document.getElementById('equipmentsHs').textContent = data.filter(e => getStatus(e) === 'HS').length;
}

function applyQuickAccessFilter(filter) {
    currentQuickFilter = filter || 'TOTAL';
    applyCurrentFiltersAndQuickAccess();
}

function updateQuickCardsStyle() {
    const cards = {
        TOTAL: document.getElementById('quickCardTotal'),
        ACTIF: document.getElementById('quickCardActif'),
        MAINTENANCE: document.getElementById('quickCardMaintenance'),
        HS: document.getElementById('quickCardHs')
    };
    Object.values(cards).forEach(card => card?.classList.remove('active-quick-filter'));
    const activeCard = cards[currentQuickFilter];
    if (activeCard) activeCard.classList.add('active-quick-filter');
}

const rootsModal = new bootstrap.Modal(document.getElementById('rootsModal'));

async function loadRoots() {
    try {
        const tree = await fetchJson(`${API_URL}/tree`);
        const container = document.getElementById('rootsTreeContainer');
        if (!Array.isArray(tree) || tree.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-sitemap fa-3x mb-3 d-block"></i><h5>Aucune racine trouvée</h5></div>`;
        } else {
            container.innerHTML = renderEquipmentTree(tree);
        }
        rootsModal.show();
    } catch (err) {
        showWarning(err.message);
    }
}

function renderEquipmentTree(nodes) {
    return `<div class="equipment-tree">${nodes.map(node => renderEquipmentNode(node)).join('')}</div>`;
}

function renderEquipmentNode(node) {
    const children = Array.isArray(node.children) ? node.children : [];
    return `
        <div class="tree-node mb-3">
            <div class="card rounded-4 shadow-sm border-0">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <div class="fw-bold"><i class="fas fa-tools text-primary me-2"></i>${escapeHtml(node.code || '')}</div>
                            <div class="text-muted small">${escapeHtml(node.description || '')}</div>
                        </div>
                        <div class="text-end small">
                            <div><strong>Parent ID :</strong> ${node.parentId ?? 'Racine'}</div>
                            <div><strong>Localisation :</strong> ${escapeHtml(node.localisation || '—')}</div>
                            <div><strong>Statut :</strong> ${escapeHtml(node.statut || '—')}</div>
                        </div>
                    </div>
                </div>
            </div>
            ${children.length > 0 ? `<div class="ms-4 mt-2 ps-3 border-start">${children.map(child => renderEquipmentNode(child)).join('')}</div>` : ''}
        </div>
    `;
}

async function applyFilters() {
    if (!Array.isArray(allEquipements) || allEquipements.length === 0) {
        const data = await fetchJson(API_URL);
        allEquipements = Array.isArray(data) ? data : [];
    }
    applyCurrentFiltersAndQuickAccess();
}

function resetFilters() {
    document.getElementById('searchKeyword').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('localisationFilter').value = '';
    document.getElementById('parentIdFilter').value = '';
    currentQuickFilter = 'TOTAL';
    applyCurrentFiltersAndQuickAccess();
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
        const localisationFull = escapeHtml(e.localisation || '—');
        const codeTrunc = truncateText(codeFull, 40);
        const descTrunc = truncateText(descFull, 80);
        const localisationTrunc = truncateText(localisationFull, 40);
        const statut = escapeHtml(e.statut || '');
        return `
            <tr>
                <td title="${codeFull}">${codeTrunc}</td>
                <td title="${descFull}">${descTrunc}</td>
                <td title="${localisationFull}"><i class="fas fa-map-marker-alt me-1 text-primary"></i>${localisationTrunc}</td>
                <td>${renderStatusBadge(e.statut)}</td>
                <td class="text-center action-buttons">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary btn-action" onclick="showDetailCanvas(${e.id})" title="Détail"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-outline-success btn-action" onclick="createInterventionFromEquipment(${e.id})" title="Créer une intervention"><i class="fas fa-wrench"></i></button>
                        <button class="btn btn-outline-warning btn-action" onclick="openEditCanvas(${e.id})" title="Éditer"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-outline-info btn-action" onclick="openStatusModalWrapper(${e.id}, '${statut}')" title="Changer statut"><i class="fas fa-repeat"></i></button>
                        <button class="btn btn-outline-secondary btn-action" onclick="toggleArchive(${e.id}, '${statut}')" title="${e.statut === 'ARCHIVED' ? 'Désarchiver' : 'Archiver'}"><i class="fas ${e.statut === 'ARCHIVED' ? 'fa-box-open' : 'fa-box-archive'}"></i></button>
                        <button class="btn btn-outline-info btn-action" onclick="openEditCanvas(${e.id}, true)" title="Pièces jointes"><i class="fas fa-paperclip"></i></button>
                        <button class="btn btn-outline-danger btn-action" onclick="confirmDelete(${e.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function createInterventionFromEquipment(equipementId) {
    if (!equipementId) {
        showWarning("Équipement introuvable pour créer une intervention.");
        return;
    }
    window.location.href = `/interventions?equipementId=${encodeURIComponent(equipementId)}`;
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
                <div class="detail-icon"><i class="fas fa-microchip fa-2x" style="color: var(--primary);"></i></div>
                <h4 class="fw-bold mb-1">${escapeHtml(e.code)}</h4>
                <p class="text-muted mb-0">${escapeHtml(e.description)}</p>
            </div>
            <div class="section-title"><i class="fas fa-info-circle me-2 text-primary"></i> Informations générales</div>
            <div class="row g-3 mb-4">
                <div class="col-6"><div class="detail-card"><div class="detail-label">Type</div><div class="detail-value">${escapeHtml(e.type) || '—'}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Marque / Modèle</div><div class="detail-value">${escapeHtml(e.marque) || '—'} ${e.modele ? '('+escapeHtml(e.modele)+')' : ''}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">N° série</div><div class="detail-value">${escapeHtml(e.numeroSerie) || '—'}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Localisation</div><div class="detail-value"><i class="fas fa-map-marker-alt me-1 text-primary"></i> ${escapeHtml(e.localisation) || '—'}</div></div></div>
            </div>
            <div class="section-title"><i class="fas fa-chart-line me-2 text-primary"></i> Statut & Maintenance</div>
            <div class="row g-3 mb-4">
                <div class="col-6"><div class="detail-card"><div class="detail-label">Statut actuel</div><div class="detail-value">${renderStatusBadge(e.statut)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Criticité</div><div class="detail-value">${e.criticite ? (e.criticite === 'FAIBLE' ? 'Faible' : e.criticite === 'MOYEN' ? 'Moyen' : e.criticite === 'ELEVE' ? 'Élevé' : escapeHtml(e.criticite)) : '—'}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Parent ID</div><div class="detail-value">${e.parentId ? e.parentId : '—'}</div></div></div>
            </div>
            <div class="section-title"><i class="fas fa-calendar-alt me-2 text-primary"></i> Dates clés</div>
            <div class="row g-3 mb-4">
                <div class="col-6"><div class="detail-card"><div class="detail-label">Date d'installation</div><div class="detail-value">${formatDate(e.dateInstallation)}</div></div></div>
                <div class="col-6"><div class="detail-card"><div class="detail-label">Mise en service</div><div class="detail-value">${formatDate(e.dateMiseEnService)}</div></div></div>
            </div>
            ${e.commentaire ? `<div class="section-title"><i class="fas fa-comment-dots me-2 text-primary"></i> Commentaire</div><div class="detail-card mb-3"><div class="detail-value">${escapeHtml(e.commentaire)}</div></div>` : ''}
            <hr class="my-3">
            <div class="text-end text-muted small"><i class="fas fa-hashtag me-1"></i> ID interne : ${e.id}</div>
        `;
        document.getElementById('detailBodyCanvas').innerHTML = html;
        cargarAdjuntosEnDetalle(e.id);
        detailOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

async function cargarAdjuntosEnDetalle(equipementId) {
    try {
        const docs = await fetchJson(`${API_URL}/${equipementId}/documents`);
        const container = document.getElementById('detailBodyCanvas');
        if (!docs || docs.length === 0) {
            container.innerHTML += `<div class="section-title mt-3"><i class="fas fa-paperclip me-2 text-primary"></i> Documents techniques</div><p class="text-muted">Aucun document attaché.</p>`;
            return;
        }
        let html = `<div class="section-title mt-3"><i class="fas fa-paperclip me-2 text-primary"></i> Documents techniques (${docs.length})</div><div class="list-group">`;
        docs.forEach(doc => {
            const icono = getIconoPorTipo(doc.tipoContenido);
            html += `<a href="/api/documents/${doc.id}" target="_blank" class="list-group-item list-group-item-action d-flex align-items-center">
                        <i class="${icono} me-3 fa-fw"></i>
                        <span>${escapeHtml(doc.nombreOriginal)}</span>
                        <small class="text-muted ms-auto">${formatFileSize(doc.tamaño)}</small>
                     </a>`;
        });
        html += `</div>`;
        container.innerHTML += html;
    } catch (err) {
        console.warn("Error cargando adjuntos:", err);
    }
}

function getIconoPorTipo(mimeType) {
    if (mimeType.includes("pdf")) return "fas fa-file-pdf text-danger";
    if (mimeType.includes("image")) return "fas fa-file-image text-primary";
    if (mimeType.includes("word") || mimeType.includes("document")) return "fas fa-file-word text-info";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "fas fa-file-excel text-success";
    return "fas fa-file-alt text-secondary";
}

function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// ======================== CREACIÓN Y EDICIÓN ========================
async function openCreateOffcanvas() {
    document.getElementById('formOffcanvasLabel').innerText = 'Nouvel équipement';
    document.getElementById('equipementFormCanvas').reset();
    document.getElementById('equipementIdCanvas').value = '';
    document.getElementById('formErrorCanvas').classList.add('d-none');
    document.getElementById('statutCanvas').value = 'ACTIF';
    const codeInput = document.getElementById('codeCanvas');
    if (codeInput) {
    //    const newCode = generateNextEquipmentCode();
    //    codeInput.value = newCode;
        codeInput.value = '';
        codeInput.readOnly = false;
        codeInput.style.backgroundColor = '';
    //    codeInput.focus();
    }
    applyRequiredErrorOnEmpty();
    
    // Limpiar archivos pendientes
    pendingFilesForNewEquipment = [];
    
    // Añadir sección de adjuntos (con input file para subir antes de guardar)
    const container = document.getElementById('adjuntosEditContainer');
    if (container) {
        container.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Téléverser des documents</label>
                <div class="input-group">
                    <input type="file" id="fileSubirNuevo" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt" multiple>
                    <button class="btn btn-primary" type="button" onclick="agregarArchivosPendientes()"><i class="fas fa-plus"></i> Ajouter</button>
                </div>
                <div id="listaArchivosPendientes" class="mt-2 list-group"></div>
            </div>
        `;
    }
    
    formOffcanvas.show();
}

function agregarArchivosPendientes() {
    const fileInput = document.getElementById('fileSubirNuevo');
    if (!fileInput.files.length) {
        showWarning("Veuillez sélectionner au moins un fichier.");
        return;
    }
    
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    const maxSize = 32 * 1024 * 1024; // 32 MB
    let validFiles = [];
    let invalidFiles = [];
    
    // Validar cada archivo seleccionado
    for (let file of fileInput.files) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            invalidFiles.push(`${file.name} (extension non autorisée)`);
        } else if (file.size > maxSize) {
            invalidFiles.push(`${file.name} (taille > 32 Mo)`);
        } else {
            validFiles.push(file);
        }
    }
    
    // Mostrar advertencias si hay archivos inválidos
    if (invalidFiles.length > 0) {
        showWarning(`Fichiers ignorés :\n${invalidFiles.join('\n')}`);
    }
    
    // Añadir los archivos válidos a la lista pendiente
    if (validFiles.length === 0) return;
    
    const lista = document.getElementById('listaArchivosPendientes');
    for (let file of validFiles) {
        pendingFilesForNewEquipment.push(file);
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `<span><i class="fas fa-file"></i> ${escapeHtml(file.name)} (${formatFileSize(file.size)})</span>
                          <button class="btn btn-sm btn-outline-danger" onclick="eliminarArchivoPendiente(this, '${file.name}')"><i class="fas fa-trash"></i></button>`;
        lista.appendChild(item);
    }
    
    // Limpiar el input para que se puedan seleccionar más archivos después
    fileInput.value = '';
}

function eliminarArchivoPendiente(btn, fileName) {
    const index = pendingFilesForNewEquipment.findIndex(f => f.name === fileName);
    if (index !== -1) pendingFilesForNewEquipment.splice(index, 1);
    btn.closest('.list-group-item').remove();
}

async function openEditCanvas(id, scrollToDocuments = false) {
    try {
        const e = await fetchJson(`${API_URL}/${id}/detail`);
        document.getElementById('formOffcanvasLabel').innerText = 'Éditer équipement';
        document.getElementById('equipementIdCanvas').value = e.id ?? '';
        const codeInput = document.getElementById('codeCanvas');
        if (codeInput) {
            codeInput.value = e.code ?? '';
            codeInput.readOnly = false;
            codeInput.style.backgroundColor = '';
        }
        document.getElementById('descriptionCanvas').value = e.description ?? '';
        document.getElementById('typeCanvas').value = e.type ?? '';
        document.getElementById('marqueCanvas').value = e.marque ?? '';
        document.getElementById('numeroSerieCanvas').value = e.numeroSerie ?? '';
        document.getElementById('localisationCanvas').value = e.localisation ?? '';
        document.getElementById('statutCanvas').value = e.statut ?? 'ACTIF';
        document.getElementById('criticiteCanvas').value = e.criticite ?? '';
        document.getElementById('dateInstallationCanvas').value = e.dateInstallation ?? '';
        document.getElementById('dateMiseEnServiceCanvas').value = e.dateMiseEnService ?? '';
        document.getElementById('commentaireCanvas').value = e.commentaire ?? '';
        document.getElementById('parentIdCanvas').value = e.parentId ?? '';
        document.getElementById('formErrorCanvas').classList.add('d-none');
        applyRequiredErrorOnEmpty();
        await cargarAdjuntosEnEdicion(e.id);
        formOffcanvas.show();

        if (scrollToDocuments) {
            setTimeout(() => {
                const container = document.getElementById('adjuntosEditContainer');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    container.style.transition = 'background-color 0.5s';
                    container.style.backgroundColor = '#fff3cd';
                    setTimeout(() => {
                        container.style.backgroundColor = '';
                    }, 1500);
                    const fileInput = document.getElementById('fileSubir');
                    if (fileInput) fileInput.focus();
                }
            }, 500);
        }
    } catch (err) { 
        showWarning(err.message); 
    }
}

async function cargarAdjuntosEnEdicion(equipementId) {
    const container = document.getElementById('adjuntosEditContainer');
    if (!container) return;
    try {
        const docs = await fetchJson(`${API_URL}/${equipementId}/documents`);
        let html = `<div class="mb-3"><label class="form-label">Téléverser un nouveau document</label><div class="input-group"><input type="file" id="fileSubir" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"><button class="btn btn-primary" onclick="subirDocumento(${equipementId})"><i class="fas fa-upload"></i> Téléverser</button></div></div><div class="list-group" id="listaAdjuntosEdit">`;
        if (docs && docs.length) {
            docs.forEach(doc => {
                const icono = getIconoPorTipo(doc.tipoContenido);
                html += `<div class="list-group-item d-flex justify-content-between align-items-center" data-id="${doc.id}">
                            <div><i class="${icono} me-2"></i> ${escapeHtml(doc.nombreOriginal)} <small class="text-muted">(${formatFileSize(doc.tamaño)})</small></div>
                            <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminarDocumento(${doc.id}, ${equipementId})"><i class="fas fa-trash-alt"></i></button>
                         </div>`;
            });
        } else {
            html += `<div class="list-group-item text-muted">Aucune pièce jointe.</div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="alert alert-danger">Erreur chargement des documents</div>`;
    }
}

async function subirDocumento(equipementId) {
    const fileInput = document.getElementById('fileSubir');
    if (!fileInput.files.length) {
        showWarning("Veuillez sélectionner un fichier.");
        return;
    }
    const file = fileInput.files[0];
    if (file.size > 32 * 1024 * 1024) {
        showWarning("Le fichier ne peut pas dépasser 32 Mo.");
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch(`${API_URL}/${equipementId}/documents`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        await cargarAdjuntosEnEdicion(equipementId);
        fileInput.value = '';
        showWarning("Document téléversé avec succès");
    } catch (err) {
        showWarning("Erreur lors du téléversement: " + (err.message || "Erreur inconnue"));
    }
}

function confirmarEliminarDocumento(documentoId, equipementId) {
    pendingDocumentId = documentoId;
    pendingEquipementIdForDoc = equipementId;
    deleteDocModal.show();
}

async function ejecutarEliminarDocumento() {
    if (!pendingDocumentId) return;
    try {
        const response = await fetch(`/api/documents/${pendingDocumentId}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        await cargarAdjuntosEnEdicion(pendingEquipementIdForDoc);
        showWarning("Document supprimé avec succès");
    } catch (err) {
        showWarning("Erreur lors de la suppression: " + (err.message || "Erreur inconnue"));
    } finally {
        deleteDocModal.hide();
        pendingDocumentId = null;
        pendingEquipementIdForDoc = null;
    }
}

async function saveEquipementCanvas() {
    const id = document.getElementById('equipementIdCanvas').value;
    const isUpdate = !!id;
    const basePayload = {
        description: getVal('descriptionCanvas'),
        type: getVal('typeCanvas'),
        marque: getVal('marqueCanvas'),
        numeroSerie: getVal('numeroSerieCanvas'),
        localisation: getVal('localisationCanvas'),
        statut: isUpdate ? getVal('statutCanvas') : 'ACTIF',
        dateInstallation: getVal('dateInstallationCanvas') || null,
        dateMiseEnService: getVal('dateMiseEnServiceCanvas') || null,
        criticite: getVal('criticiteCanvas'),
        commentaire: getVal('commentaireCanvas'),
        parentId: getNumberVal('parentIdCanvas')
    };
    const payload = isUpdate ? basePayload : {
        code: getVal('codeCanvas'),
        ...basePayload,
        statut: 'ACTIF'
    };
    try {
        // Verificar unicidad del código (solo para creación, en edición lo maneja el backend)
        if (!isUpdate && payload.code) {
            const exists = await fetchJson(`${API_URL}/exists?code=${encodeURIComponent(payload.code)}`);
            if (exists) throw new Error('Ce code équipement existe déjà. Veuillez en choisir un autre.');
        }

        let nuevoId = id;
        if (!isUpdate) {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }
            const newEquip = await response.json();
            nuevoId = newEquip.id || newEquip.equipementId;
            if (!nuevoId) throw new Error("ID du nouvel équipement non reçu");
            
            // Subir documentos pendientes
            if (pendingFilesForNewEquipment.length > 0) {
                for (const file of pendingFilesForNewEquipment) {
                    const formData = new FormData();
                    formData.append('file', file);
                    await fetch(`${API_URL}/${nuevoId}/documents`, { method: 'POST', body: formData });
                }
                pendingFilesForNewEquipment = [];
            }
        } else {
            await fetchJson(`${API_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        }
        
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

function getAllowedManualStatuses(currentStatus) {
    const status = (currentStatus || '').toUpperCase();
    if (status === 'ACTIF') return ['HS', 'ARCHIVED'];
    if (status === 'MAINTENANCE') return ['HS', 'ARCHIVED'];
    if (status === 'HS') return ['ARCHIVED'];
    if (status === 'ARCHIVED') return ['ACTIF'];
    return [];
}

function openStatusModalWrapper(id, statut) {
    const allowedStatuses = getAllowedManualStatuses(statut);
    if (allowedStatuses.length === 0) {
        showWarning("Aucun changement manuel autorisé pour ce statut.");
        return;
    }
    document.querySelectorAll('.status-option-btn').forEach(btn => {
        const target = btn.getAttribute('data-status');
        btn.classList.toggle('d-none', !allowedStatuses.includes(target));
    });
    pendingStatusId = id;
    statusModal.show();
}

async function changeStatus(id, newStatus) {
    try {
        await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(newStatus)}`, { method: 'PATCH' });
        await refreshPage();
    } catch (err) { showWarning(err.message); }
}

// ======================== IMPORTACIÓN ========================
function showImportModal() {
    const modalElem = document.getElementById('importModal');
    if (modalElem?.classList.contains('show')) return;

    document.getElementById('importResult').innerHTML = '';
    document.getElementById('importProgress').classList.add('d-none');

    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    const modal = new bootstrap.Modal(modalElem);
    modal.show();
}

function setupImportFeatures() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    if (!dropZone || !fileInput) return;

    if (window._importInitialized) return;
    window._importInitialized = true;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && !isImporting) processFile(file);
    });

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-close')) return;
        if (!isImporting) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length && !isImporting) {
            processFile(e.target.files[0]);
        }
    });
}

async function processFile(file) {
    if (isImporting) return;
    
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        const resultDiv = document.getElementById('importResult');
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Format non autorisé. Veuillez utiliser .csv, .xlsx ou .txt.</div>`;
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        return;
    }
    
    isImporting = true;

    const progressDiv = document.getElementById('importProgress');
    const progressBar = document.getElementById('importProgressBar');
    const resultDiv = document.getElementById('importResult');
    progressDiv.classList.remove('d-none');
    progressBar.style.width = '30%';
    resultDiv.innerHTML = '';

    const fileInput = document.getElementById('fileInput');

    try {
        let jsonData;
        if (fileExtension === 'txt') {
            const text = await readTextFile(file);
            const workbook = XLSX.read(text, { type: 'string', raw: true });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
        } else {
            jsonData = await readExcelFile(file);
        }
        
        progressBar.style.width = '60%';
        
        const requiredColumns = ['description', 'type'];
        const availableColumns = jsonData.length > 0 ? Object.keys(jsonData[0]).map(k => k.toLowerCase()) : [];
        const missingCols = requiredColumns.filter(col => !availableColumns.includes(col));
        if (missingCols.length > 0) {
            throw new Error(`Colonnes obligatoires manquantes: ${missingCols.join(', ')}. Vérifiez que votre fichier contient les en-têtes requis (description, type, etc.) et utilise le séparateur point-virgule (;).`);
        }
        
        if (!allEquipements.length) await loadEquipments();
        
        const equipments = parseEquipmentsFromDataWithCodeGeneration(jsonData);
        if (equipments.length === 0) throw new Error('Aucune donnée valide (description ou type manquant).');
        
        progressBar.style.width = '80%';
        await sendImport(equipments);
        progressBar.style.width = '100%';
        resultDiv.innerHTML = `<div class="alert alert-success">✅ ${equipments.length} équipements importés avec succès.</div>`;
        await loadEquipments();

        setTimeout(() => {
            const modalElem = document.getElementById('importModal');
            const modal = bootstrap.Modal.getInstance(modalElem);
            if (modal) modal.hide();
            if (fileInput) fileInput.value = '';
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
        }, 1500);
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erreur : ${err.message}</div>`;
        if (fileInput) fileInput.value = '';
    } finally {
        progressDiv.classList.add('d-none');
        progressBar.style.width = '0%';
        isImporting = false;
    }
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
            resolve(json);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
    });
}

function parseEquipmentsFromDataWithCodeGeneration(jsonData) {
    if (!jsonData?.length) return [];
    const rawKeys = Object.keys(jsonData[0]);
    const normalizeKey = (key) => key.replace(/^["']|["']$/g, '').trim().toLowerCase();
    const keyMap = new Map();
    rawKeys.forEach(k => keyMap.set(normalizeKey(k), k));

    const result = [];
    const generatedCodes = [];

    for (const row of jsonData) {
        const getValue = (field) => {
            const origKey = keyMap.get(field);
            if (origKey && row[origKey] !== undefined && row[origKey] !== '') {
                let val = row[origKey];
                if (typeof val === 'string') {
                    val = val.trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                }
                return val;
            }
            return '';
        };

        const description = getValue('description');
        const type = getValue('type');
        if (!description || !type) continue;

        const code = generateNextImportCode(generatedCodes);
        generatedCodes.push(code);

        let rawDateInstall = getValue('dateinstallation');
        let rawDateService = getValue('datemiseenservice');
        
        let dateInstallation = rawDateInstall ? parseDateToMySQL(rawDateInstall) : null;
        let dateMiseEnService = rawDateService ? parseDateToMySQL(rawDateService) : null;

        const parentIdVal = getValue('parentid');
        const parentId = parentIdVal && parentIdVal !== '' ? Number(parentIdVal) : null;

        result.push({
            code: code,
            description: description,
            type: type,
            marque: getValue('marque'),
            numeroSerie: getValue('numeroserie'),
            localisation: getValue('localisation'),
            statut: getValue('statut') || 'ACTIF',
            criticite: getValue('criticite'),
            dateInstallation: dateInstallation,
            dateMiseEnService: dateMiseEnService,
            commentaire: getValue('commentaire'),
            parentId: parentId
        });
    }
    return result;
}

async function sendImport(equipments) {
    const response = await fetch('/api/equipements/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipments)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de l\'import');
    }
    return await response.json();
}

function downloadTemplate() {
    const headers = ['description', 'type', 'marque', 'numeroSerie', 'localisation',
                     'statut', 'criticite', 'dateInstallation', 'dateMiseEnService',
                     'commentaire', 'parentId'];
    
    const exampleRow = [
        'Moteur électrique 15kW',    
        'Moteur',                    
        'Siemens',                   
        'SN-M-2024-001',             
        'Atelier A - Bâtiment 2',    
        'ACTIF',                     
        'ELEVE',                     
        '01/01/2025',                
        '15/01/2025',                
        'Moteur principal ligne production',
        ''                           
    ];
    
    const escapeForCSV = (cell) => {
        if (cell == null) return '';
        const str = String(cell);
        if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    
    const rows = [headers, exampleRow.map(escapeForCSV)];
    const csvContent = rows.map(row => row.join(';')).join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'template_equipements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ======================== UTILITAIRES ========================
function getVal(id) { return document.getElementById(id).value.trim(); }
function getNumberVal(id) { const v = document.getElementById(id).value.trim(); return v ? Number(v) : null; }
function formatDate(v) { 
    if (!v) return 'N/A';
    const parts = String(v).split(' ')[0];
    return parts;
}
function escapeHtml(v) { if (v == null) return ''; return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }

// ======================== INITIALISATION ========================
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('equipementFormCanvas').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('codeCanvas').value.trim();
        const description = document.getElementById('descriptionCanvas').value.trim();
        const type = document.getElementById('typeCanvas').value.trim();
        if (!code || !description || !type) {
            showWarning('Veuillez remplir tous les champs obligatoires (Code, Description, Type).');
            applyRequiredErrorOnEmpty();
            return;
        }
        if (!validateFieldLengths()) return;
        if (!validateInstallationDatesCanvas()) return;
        await saveEquipementCanvas();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (pendingDeleteId !== null) {
            await executeDelete(pendingDeleteId);
            deleteModal.hide();
            pendingDeleteId = null;
        }
    });

    const confirmDeleteDocBtn = document.getElementById('confirmDeleteDocBtn');
    if (confirmDeleteDocBtn) {
        confirmDeleteDocBtn.addEventListener('click', () => {
            ejecutarEliminarDocumento();
        });
    }

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
    setupImportFeatures();

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('mainContent').classList.add('expanded');
    }

    await refreshPage();
});