const API_STOCK_URL = '/api/stock';

const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));

const deleteModalEl = document.getElementById('deleteConfirmModal');
const deleteModal = new bootstrap.Modal(deleteModalEl);

const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

let stockData = [];
let pendingDeleteId = null;
let selectedStockId = null;          // ID de la PR sélectionnée (sélection unique)
let currentQuickFilter = 'TOTAL';    // pour la surbrillance des cartes

// ======================== FONCTIONS UTILITAIRES ========================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function parseNumber(value) {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
}

function showWarning(message) {
    document.getElementById('warningMessage').textContent = message;
    warningModal.show();
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const rawText = await response.text();

    if (!response.ok) {
        let message = rawText || `HTTP ${response.status}`;
        try {
            const err = JSON.parse(rawText);
            message = err.message || err.error || message;
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

// ======================== STATISTIQUES & MISE À JOUR ========================
function updateStats() {
    const total = stockData.length;
    let low = 0;
    let out = 0;
    let totalQty = 0;

    stockData.forEach(item => {
        const qty = parseNumber(item.quantiteStock);
        const seuil = parseNumber(item.seuilMini);
        totalQty += qty;
        if (qty === 0) out++;
        else if (qty <= seuil) low++;
    });

    document.getElementById('totalItems').textContent = total;
    document.getElementById('lowStockCount').textContent = low;
    document.getElementById('outOfStockCount').textContent = out;
    document.getElementById('totalQuantity').textContent = totalQty.toFixed(3);
}

// ======================== FILTRES PAR CARTES ========================
function applyQuickFilter(filterType) {
    currentQuickFilter = filterType;
    updateQuickCardsStyle();

    // Réinitialiser la recherche textuelle
    document.getElementById('searchName').value = '';

    let filtered = [...stockData];

    switch(filterType) {
        case 'LOW':
            filtered = filtered.filter(item => {
                const qty = parseNumber(item.quantiteStock);
                const seuil = parseNumber(item.seuilMini);
                return qty > 0 && qty <= seuil;
            });
            break;
        case 'OUT':
            filtered = filtered.filter(item => parseNumber(item.quantiteStock) === 0);
            break;
        case 'TOTAL':
        default:
            // aucun filtre
            break;
    }
    renderTable(filtered);
}

function updateQuickCardsStyle() {
    const cards = {
        TOTAL: document.getElementById('quickCardTotal'),
        LOW: document.getElementById('quickCardLow'),
        OUT: document.getElementById('quickCardOut')
    };
    Object.values(cards).forEach(card => card?.classList.remove('active-quick-filter'));
    const activeCard = cards[currentQuickFilter];
    if (activeCard) activeCard.classList.add('active-quick-filter');
}

// ======================== RECHERCHE TEXTUELLE ========================
function renderFilteredStock() {
    // Si on utilise la recherche, on désactive le filtre rapide
    currentQuickFilter = null;
    updateQuickCardsStyle();

    const search = document.getElementById('searchName').value.trim().toLowerCase();
    let filtered = [...stockData];
    if (search) {
        filtered = filtered.filter(item =>
            (item.libelle && item.libelle.toLowerCase().includes(search)) ||
            (item.code && item.code.toLowerCase().includes(search)) ||
            (item.reference && item.reference.toLowerCase().includes(search))
        );
    }
    renderTable(filtered);
}

function resetFilters() {
    document.getElementById('searchName').value = '';
    currentQuickFilter = 'TOTAL';
    updateQuickCardsStyle();
    renderTable(stockData);
}

// ======================== SÉLECTION UNIQUE & BARRE D'ACTIONS ========================
function bindSelectionEvents() {
    document.querySelectorAll('input[name="stockSelect"]').forEach(radio => {
        radio.removeEventListener('change', handleRadioChange);
        radio.addEventListener('change', handleRadioChange);
    });
    document.querySelectorAll('#stockTableBody tr').forEach(row => {
        row.removeEventListener('click', handleRowClick);
        row.addEventListener('click', handleRowClick);
    });
}

function handleRadioChange(event) {
    if (event.target.checked) {
        selectedStockId = parseInt(event.target.value);
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
        selectedStockId = parseInt(row.dataset.id);
        highlightSelectedRow();
        updateToolbarState();
    }
}

function highlightSelectedRow() {
    document.querySelectorAll('#stockTableBody tr').forEach(tr => {
        const id = parseInt(tr.dataset.id);
        if (selectedStockId === id) tr.classList.add('selected-row');
        else tr.classList.remove('selected-row');
    });
}

function updateToolbarState() {
    const hasSelection = selectedStockId !== null;
    const btns = ['btnDetail', 'btnEdit', 'btnDelete'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = !hasSelection;
    });
}

// Actions centralisées
function actionDetail() {
    if (selectedStockId) showDetail(selectedStockId);
    else showWarning("Veuillez sélectionner une PR.");
}

function actionEdit() {
    if (selectedStockId) openEditCanvas(selectedStockId);
    else showWarning("Veuillez sélectionner une PR.");
}

function actionDelete() {
    if (selectedStockId) confirmDelete(selectedStockId);
    else showWarning("Veuillez sélectionner une PR.");
}

// ======================== RENDU TABLEAU ========================
function renderTable(data) {
    const tbody = document.getElementById('stockTableBody');

    if (!tbody) {
        console.error("Élément 'stockTableBody' introuvable dans le DOM");
        return;
    }
    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
                    <h5>Aucune PR en stock</h5>
                    <p class="text-muted mb-0">Ajoutez votre première pièce de rechange.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(item => {
        const qty = parseNumber(item.quantiteStock);
        const seuil = parseNumber(item.seuilMini);
        const mouvementsCount = item.mouvementsCount ?? 0;
        const interventionsCount = item.interventionsCount ?? 0;
        const isSelected = (selectedStockId === item.id);

        let stockClass = 'stock-normal';
        let stockLabel = 'Normal';

        if (qty === 0) {
            stockClass = 'stock-out';
            stockLabel = 'Rupture';
        } else if (qty <= seuil) {
            stockClass = 'stock-low';
            stockLabel = 'Stock bas';
        }

        return `
            <tr data-id="${item.id}" class="${isSelected ? 'selected-row' : ''}">
                <td class="text-center"><input type="radio" name="stockSelect" value="${item.id}" class="radio-select" ${isSelected ? 'checked' : ''}></td>
                <td class="text-truncate-cell" title="${escapeHtml(item.code)}"><strong>${escapeHtml(item.code)}</strong></td>
                <td class="text-truncate-cell" title="${escapeHtml(item.libelle)}">${escapeHtml(item.libelle)}</td>
                <td>${escapeHtml(item.reference || '—')}</td>
                <td>${parseNumber(item.pmp).toFixed(2)} DH</td>
                <td>${qty}</td>
                <td>${seuil}</td>
                <td><span class="stock-badge ${stockClass}">${stockLabel}</span></td>
                <td>${mouvementsCount}</td>
                <td>${interventionsCount}</td>
            <tr>
        `;
    }).join('');
    bindSelectionEvents();
    updateToolbarState();
}

// ======================== CHARGEMENT DONNÉES ========================
async function loadStock() {
    try {
        const data = await fetchJson(API_STOCK_URL);
        stockData = Array.isArray(data) ? data : [];
        updateStats();
        // Réappliquer le filtre actif
        if (currentQuickFilter === 'TOTAL') renderTable(stockData);
        else if (currentQuickFilter === 'LOW') applyQuickFilter('LOW');
        else if (currentQuickFilter === 'OUT') applyQuickFilter('OUT');
        else renderTable(stockData);
        // Vérifier si l'élément sélectionné existe toujours
        if (selectedStockId && !stockData.some(s => s.id === selectedStockId)) {
            selectedStockId = null;
            updateToolbarState();
        }
    } catch (err) {
        showWarning("Erreur chargement stock : " + err.message);
    }
}

// ======================== DÉTAIL ========================
async function showDetail(id) {
    try {
        const item = await fetchJson(`${API_STOCK_URL}/${id}`);

        const html = `
            <div class="detail-card">
                <div class="detail-label">Code PR</div>
                <div class="detail-value">${escapeHtml(item.code)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Libellé</div>
                <div class="detail-value">${escapeHtml(item.libelle)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Référence</div>
                <div class="detail-value">${escapeHtml(item.reference) || '—'}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">PMP (DH)</div>
                <div class="detail-value">${parseNumber(item.pmp).toFixed(2)} DH</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Quantité en stock</div>
                <div class="detail-value">${item.quantiteStock}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Seuil minimum</div>
                <div class="detail-value">${item.seuilMini}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Nombre de mouvements</div>
                <div class="detail-value">${item.mouvementsCount ?? 0}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Nombre d'interventions liées</div>
                <div class="detail-value">${item.interventionsCount ?? 0}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Suppression autorisée</div>
                <div class="detail-value">${item.canDelete ? 'Oui' : 'Non'}</div>
            </div>
            <hr class="my-3">
            <div class="text-end text-muted small">
                <i class="fas fa-hashtag me-1"></i> ID interne : ${item.id}
            </div>
        `;

        document.getElementById('detailBodyCanvas').innerHTML = html;
        detailOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

// ======================== CRÉATION / ÉDITION ========================
function openCreateOffcanvas() {
    document.getElementById('formOffcanvasLabel').innerText = 'Nouvelle PR';
    document.getElementById('stockFormCanvas').reset();
    document.getElementById('stockIdCanvas').value = '';
    document.getElementById('quantiteStockCanvas').value = '0';
    document.getElementById('seuilMiniCanvas').value = '0';
    document.getElementById('pmpCanvas').value = '0';
    document.getElementById('formErrorCanvas').classList.add('d-none');
    formOffcanvas.show();
}

async function openEditCanvas(id) {
    try {
        const item = await fetchJson(`${API_STOCK_URL}/${id}`);
        document.getElementById('formOffcanvasLabel').innerText = 'Modifier la PR';
        document.getElementById('stockIdCanvas').value = item.id;
        document.getElementById('codeCanvas').value = item.code || '';
        document.getElementById('libelleCanvas').value = item.libelle || '';
        document.getElementById('referenceCanvas').value = item.reference || '';
        document.getElementById('pmpCanvas').value = item.pmp ?? 0;
        document.getElementById('quantiteStockCanvas').value = item.quantiteStock ?? 0;
        document.getElementById('seuilMiniCanvas').value = item.seuilMini ?? 0;
        document.getElementById('formErrorCanvas').classList.add('d-none');
        formOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

async function saveStock() {
    const id = document.getElementById('stockIdCanvas').value;
    const isUpdate = !!id;

    const payload = {
        code: document.getElementById('codeCanvas').value.trim(),
        libelle: document.getElementById('libelleCanvas').value.trim(),
        reference: document.getElementById('referenceCanvas').value.trim(),
        pmp: parseNumber(document.getElementById('pmpCanvas').value),
        quantiteStock: parseNumber(document.getElementById('quantiteStockCanvas').value),
        seuilMini: parseNumber(document.getElementById('seuilMiniCanvas').value)
    };

    if (!payload.code) {
        showWarning("Le code PR est obligatoire.");
        return;
    }
    if (!payload.libelle) {
        showWarning("Le libellé est obligatoire.");
        return;
    }
    if (payload.pmp < 0) {
        showWarning("Le PMP ne peut pas être négatif.");
        return;
    }

    const quantite = parseNumber(document.getElementById('quantiteStockCanvas').value);
    const seuil = parseNumber(document.getElementById('seuilMiniCanvas').value);

    if (!Number.isInteger(quantite)) {
        showWarning("La quantité en stock doit être un nombre entier.");
        return;
    }
    if (!Number.isInteger(seuil)) {
        showWarning("Le seuil minimum doit être un nombre entier.");
        return;
    }

    try {
        const url = isUpdate ? `${API_STOCK_URL}/${id}` : API_STOCK_URL;
        const method = isUpdate ? 'PUT' : 'POST';

        await fetchJson(url, {
            method,
            body: JSON.stringify(payload)
        });

        formOffcanvas.hide();
        await loadStock();
    } catch (err) {
        const errBox = document.getElementById('formErrorCanvas');
        errBox.textContent = err.message;
        errBox.classList.remove('d-none');
    }
}

// ======================== SUPPRESSION ========================
function confirmDelete(id) {
    const item = stockData.find(s => Number(s.id) === Number(id));

    if (item && item.canDelete === false) {
        showWarning("Impossible de supprimer cette PR car elle est déjà liée à des mouvements de stock ou à des interventions.");
        return;
    }

    pendingDeleteId = id;

    if (deleteModal) {
        deleteModal.show();
    } else {
        showWarning("Erreur technique : popup de suppression introuvable.");
    }
}

async function executeDelete(id) {
    try {
        await fetchJson(`${API_STOCK_URL}/${id}`, { method: 'DELETE' });
        if (selectedStockId === id) selectedStockId = null;
        await loadStock();
    } catch (err) {
        showWarning(err.message || "Suppression impossible.");
    }
}

// ======================== IMPORTATION PRS ========================
let isImportingPrs = false;

function showImportPrsModal() {
    const modalElem = document.getElementById('importPrsModal');
    if (modalElem?.classList.contains('show')) return;

    document.getElementById('importPrsResult').innerHTML = '';
    document.getElementById('importPrsProgress').classList.add('d-none');

    const fileInput = document.getElementById('fileInputPrs');
    if (fileInput) fileInput.value = '';

    const modal = new bootstrap.Modal(modalElem);
    modal.show();
}

function setupImportPrsFeatures() {
    const dropZone = document.getElementById('dropZonePrs');
    const fileInput = document.getElementById('fileInputPrs');
    if (!dropZone || !fileInput) return;

    if (window._importPrsInitialized) return;
    window._importPrsInitialized = true;

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
        if (file && !isImportingPrs) processPrsFile(file);
    });

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-close')) return;
        if (!isImportingPrs) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length && !isImportingPrs) {
            processPrsFile(e.target.files[0]);
        }
    });
}

async function processPrsFile(file) {
    if (isImportingPrs) return;
    
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        const resultDiv = document.getElementById('importPrsResult');
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Format non autorisé. Veuillez utiliser .csv, .xlsx ou .txt.</div>`;
        const fileInput = document.getElementById('fileInputPrs');
        if (fileInput) fileInput.value = '';
        return;
    }
    
    isImportingPrs = true;

    const progressDiv = document.getElementById('importPrsProgress');
    const progressBar = document.getElementById('importPrsProgressBar');
    const resultDiv = document.getElementById('importPrsResult');
    progressDiv.classList.remove('d-none');
    progressBar.style.width = '30%';
    resultDiv.innerHTML = '';

    const fileInput = document.getElementById('fileInputPrs');

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
        
        const requiredColumns = ['libelle'];  // minimum nécessaire
        const availableColumns = jsonData.length > 0 ? Object.keys(jsonData[0]).map(k => k.toLowerCase()) : [];
        const missingCols = requiredColumns.filter(col => !availableColumns.includes(col));
        if (missingCols.length > 0) {
            throw new Error(`Colonnes obligatoires manquantes: ${missingCols.join(', ')}. Vérifiez votre fichier (libelle).`);
        }
        
        const prsList = parsePrsFromData(jsonData);
        if (prsList.length === 0) throw new Error('Aucune donnée valide (libelle requis).');
        
        progressBar.style.width = '80%';
        const response = await fetch('/api/stock/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prsList)
        });
        if (!response.ok) throw new Error(await response.text());
        const result = await response.json();
        
        progressBar.style.width = '100%';
        resultDiv.innerHTML = `<div class="alert alert-success">✅ ${result.imported} PRs importées avec succès.</div>`;
        await loadStock();

        setTimeout(() => {
            const modalElem = document.getElementById('importPrsModal');
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
        isImportingPrs = false;
    }
}

function parsePrsFromData(jsonData) {
    if (!jsonData?.length) return [];
    const rawKeys = Object.keys(jsonData[0]);
    const normalizeKey = (key) => key.replace(/^["']|["']$/g, '').trim().toLowerCase();
    const keyMap = new Map();
    rawKeys.forEach(k => keyMap.set(normalizeKey(k), k));

    const result = [];
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

        const libelle = getValue('libelle');
        if (!libelle) continue;

        const code = getValue('code') || '';
        const reference = getValue('reference') || '';
        const pmp = parseFloat(getValue('pmp')) || 0;
        const quantiteStock = parseFloat(getValue('quantitestock')) || 0;
        const seuilMini = parseFloat(getValue('seuilmini')) || 0;

        result.push({
            code: code,
            libelle: libelle,
            reference: reference,
            pmp: pmp,
            quantiteStock: quantiteStock,
            seuilMini: seuilMini
        });
    }
    return result;
}

function downloadPrsTemplate() {
    const headers = ['code', 'libelle', 'reference', 'pmp', 'quantiteStock', 'seuilMini'];
    const exampleRow = ['', 'Roulement à billes', 'SKF-6204', '25.50', '100', '10'];
    
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
    link.setAttribute('download', 'template_prs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

// ======================== INITIALISATION ========================
document.addEventListener('DOMContentLoaded', async () => {
    await loadStock();

    document.getElementById('stockFormCanvas').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveStock();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (pendingDeleteId !== null) {
            const id = pendingDeleteId;
            pendingDeleteId = null;
            deleteModal.hide();
            await executeDelete(id);
        }
    });

    setupImportPrsFeatures();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('mainContent');
    const logoText = document.getElementById('logo-text');

    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');

    if (logoText) {
        logoText.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'inline';
    }
}