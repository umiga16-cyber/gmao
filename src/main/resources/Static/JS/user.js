const API_URL = '/api/users';
const ROLE_API = '/api/roles';

const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));

const deleteModalEl = document.getElementById('deleteConfirmModal');
const deleteModal = new bootstrap.Modal(deleteModalEl);

const statusModalEl = document.getElementById('statusModal');
const statusModal = new bootstrap.Modal(statusModalEl);

const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

let allUsers = [];
let allRoles = [];
let pendingDeleteId = null;
let pendingStatusId = null;
let pendingNextStatus = null;

// ======================== FUNCIONES AUXILIARES ========================
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function showWarning(message) {
    document.getElementById('warningMessage').textContent = message;
    warningModal.show();
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
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

// ======================== GESTIÓN DE USUARIOS ========================
async function loadRoles() {
    allRoles = await fetchJson(ROLE_API);
    const roleFilter = document.getElementById('roleFilter');
    const roleSelect = document.getElementById('roleIdCanvas');
    roleFilter.innerHTML = '<option value="">Tous</option>';
    roleSelect.innerHTML = '<option value="">Sélectionner</option>';
    allRoles.forEach(role => {
        roleFilter.innerHTML += `<option value="${role.id}">${escapeHtml(role.nom)}</option>`;
        roleSelect.innerHTML += `<option value="${role.id}">${escapeHtml(role.nom)}</option>`;
    });
}

async function loadUsers() {
    allUsers = await fetchJson(API_URL);
    renderStats(allUsers);
    renderTable(allUsers);
}

function renderStats(users) {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('usersActifs').textContent = users.filter(u => u.statut === 'ACTIVE').length;
    document.getElementById('usersInactifs').textContent = users.filter(u => u.statut === 'INACTIVE').length;
    document.getElementById('adminsCount').textContent = users.filter(u => u.roleNom === 'ADMIN').length;
}

function renderFilteredUsers() {
    const keyword = document.getElementById('keywordFilter').value.trim().toLowerCase();
    const roleId = document.getElementById('roleFilter').value;
    const status = document.getElementById('statusFilter').value;
    const filtered = allUsers.filter(u => {
        const keywordOk = !keyword || (u.nom || '').toLowerCase().includes(keyword) || (u.email || '').toLowerCase().includes(keyword);
        const roleOk = !roleId || String(u.roleId) === String(roleId);
        const statusOk = !status || u.statut === status;
        return keywordOk && roleOk && statusOk;
    });
    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('usersTableBody');
    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fas fa-users fa-3x mb-3 d-block"></i><h5>Aucun utilisateur</h5></td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(u => `
        <tr>
            <td><div class="avatar">${getInitials(u.nom)}</div></td>
            <td>${escapeHtml(u.nom)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${renderRoleBadge(u.roleNom)}</td>
            <td>${renderStatusBadge(u.statut)}</td>
            <td>${u.actif ? 'Oui' : 'Non'}</td>
            <td class="text-center">
                <button class="btn btn-outline-primary btn-action" onclick="showDetailCanvas(${u.id})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-outline-warning btn-action" onclick="openEditCanvas(${u.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-outline-info btn-action" onclick="openStatusModal(${u.id})"><i class="fas fa-repeat"></i></button>
                <button class="btn btn-outline-danger btn-action" onclick="confirmDelete(${u.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderRoleBadge(role) {
    const safeRole = escapeHtml(role || '');
    return `<span class="role-badge role-${safeRole}">${safeRole || '—'}</span>`;
}

function renderStatusBadge(status) {
    const safeStatus = escapeHtml(status || '');
    return `<span class="status-badge status-${safeStatus}">${safeStatus || '—'}</span>`;
}

async function showDetailCanvas(id) {
    try {
        const u = await fetchJson(`${API_URL}/${id}`);
        document.getElementById('detailBodyCanvas').innerHTML = `
            <div class="detail-card"><div class="detail-label">Nom</div><div class="detail-value">${escapeHtml(u.nom)}</div></div>
            <div class="detail-card"><div class="detail-label">Email</div><div class="detail-value">${escapeHtml(u.email)}</div></div>
            <div class="detail-card"><div class="detail-label">Rôle</div><div class="detail-value">${escapeHtml(u.roleNom)}</div></div>
            <div class="detail-card"><div class="detail-label">Statut</div><div class="detail-value">${escapeHtml(u.statut)}</div></div>
            <div class="detail-card"><div class="detail-label">Actif</div><div class="detail-value">${u.actif ? 'Oui' : 'Non'}</div></div>
        `;
        detailOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

function openCreateOffcanvas() {
    document.getElementById('formOffcanvasLabel').innerText = 'Nouvel utilisateur';
    document.getElementById('userFormCanvas').reset();
    document.getElementById('userIdCanvas').value = '';
    document.getElementById('passwordCanvas').required = true;
    document.getElementById('passwordHelp').textContent = '*';
    document.getElementById('formErrorCanvas').classList.add('d-none');
    formOffcanvas.show();
}

async function openEditCanvas(id) {
    try {
        const u = await fetchJson(`${API_URL}/${id}`);
        document.getElementById('formOffcanvasLabel').innerText = 'Éditer utilisateur';
        document.getElementById('userIdCanvas').value = u.id;
        document.getElementById('nomCanvas').value = u.nom || '';
        document.getElementById('emailCanvas').value = u.email || '';
        document.getElementById('roleIdCanvas').value = u.roleId || '';
        document.getElementById('statusCanvas').value = u.statut || 'ACTIVE';
        document.getElementById('actifCanvas').value = String(u.actif ?? true);
        document.getElementById('passwordCanvas').value = '';
        document.getElementById('passwordCanvas').required = false;
        document.getElementById('passwordHelp').textContent = '(laisser vide pour ne pas changer)';
        document.getElementById('formErrorCanvas').classList.add('d-none');
        formOffcanvas.show();
    } catch (err) {
        showWarning(err.message);
    }
}

async function saveUserCanvas() {
    const id = document.getElementById('userIdCanvas').value;
    const isUpdate = !!id;
    const payload = {
        nom: document.getElementById('nomCanvas').value.trim(),
        email: document.getElementById('emailCanvas').value.trim(),
        roleId: Number(document.getElementById('roleIdCanvas').value),
        statut: document.getElementById('statusCanvas').value,
        actif: document.getElementById('actifCanvas').value === 'true'
    };
    const password = document.getElementById('passwordCanvas').value.trim();
    if (!isUpdate || password) payload.password = password;
    try {
        const url = isUpdate ? `${API_URL}/${id}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST';
        await fetchJson(url, { method, body: JSON.stringify(payload) });
        formOffcanvas.hide();
        await loadUsers();
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
        await loadUsers();
    } catch (err) {
        const msg = String(err.message || '');
        if (msg.includes('DISPONIBILITE') || msg.includes('Referential integrity constraint violation')) {
            showWarning("Impossible de supprimer cet utilisateur car il possède encore des disponibilités liées. Il faut d’abord supprimer ses disponibilités ou l’archiver.");
            return;
        }
        showWarning(msg || "Suppression impossible.");
    }
}

function openStatusModal(id) {
    pendingStatusId = id;
    statusModal.show();
}

async function changeStatus(id, newStatus) {
    await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(newStatus)}`, { method: 'PATCH' });
    await loadUsers();
}

async function refreshPage() {
    try {
        await loadUsers();
    } catch (err) {
        showWarning(err.message);
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('expanded');
    const logo = document.getElementById('logo-text');
    if (logo) logo.style.display = document.getElementById('sidebar').classList.contains('collapsed') ? 'none' : 'inline';
}

// ======================== IMPORTACIÓN MASIVA ========================
let isImportingUsers = false;

function showImportUsersModal() {
    const modalElem = document.getElementById('importUsersModal');
    if (modalElem?.classList.contains('show')) return;
    document.getElementById('importUsersResult').innerHTML = '';
    document.getElementById('importUsersProgress').classList.add('d-none');
    const fileInput = document.getElementById('fileInputUsers');
    if (fileInput) fileInput.value = '';
    const modal = new bootstrap.Modal(modalElem);
    modal.show();
}

function setupImportUsersFeatures() {
    const dropZone = document.getElementById('dropZoneUsers');
    const fileInput = document.getElementById('fileInputUsers');
    if (!dropZone || !fileInput) return;
    if (window._importUsersInitialized) return;
    window._importUsersInitialized = true;

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
        if (file && !isImportingUsers) processUserFile(file);
    });
    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.btn-close')) return;
        if (!isImportingUsers) fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length && !isImportingUsers) {
            processUserFile(e.target.files[0]);
        }
    });
}

async function processUserFile(file) {
    if (isImportingUsers) return;
    
    const allowedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        document.getElementById('importUsersResult').innerHTML = `<div class="alert alert-danger">❌ Format non autorisé. Veuillez utiliser .csv, .xlsx ou .txt.</div>`;
        const fileInput = document.getElementById('fileInputUsers');
        if (fileInput) fileInput.value = '';
        return;
    }
    
    isImportingUsers = true;
    const progressDiv = document.getElementById('importUsersProgress');
    const progressBar = document.getElementById('importUsersProgressBar');
    const resultDiv = document.getElementById('importUsersResult');
    progressDiv.classList.remove('d-none');
    progressBar.style.width = '30%';
    resultDiv.innerHTML = '';

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
        
        const requiredColumns = ['nom', 'email'];
        const availableColumns = jsonData.length > 0 ? Object.keys(jsonData[0]).map(k => k.toLowerCase()) : [];
        const missingCols = requiredColumns.filter(col => !availableColumns.includes(col));
        if (missingCols.length > 0) {
            throw new Error(`Colonnes obligatoires manquantes: ${missingCols.join(', ')}. Vérifiez votre fichier (nom, email).`);
        }
        
        const users = parseUsersFromData(jsonData);
        if (users.length === 0) throw new Error('Aucune donnée valide (nom et email requis).');
        progressBar.style.width = '80%';
        
        const response = await fetch('/api/users/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        });
        if (!response.ok) throw new Error(await response.text());
        const result = await response.json();
        
        progressBar.style.width = '100%';
        resultDiv.innerHTML = `<div class="alert alert-success">✅ ${result.imported} utilisateurs importés avec succès.</div>`;
        await loadUsers();
        
        setTimeout(() => {
            const modalElem = document.getElementById('importUsersModal');
            const modal = bootstrap.Modal.getInstance(modalElem);
            if (modal) modal.hide();
            const fileInputElem = document.getElementById('fileInputUsers');
            if (fileInputElem) fileInputElem.value = '';
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
        }, 1500);
    } catch (err) {
        console.error(err);
        resultDiv.innerHTML = `<div class="alert alert-danger">❌ Erreur : ${err.message}</div>`;
        const fileInputElem = document.getElementById('fileInputUsers');
        if (fileInputElem) fileInputElem.value = '';
    } finally {
        progressDiv.classList.add('d-none');
        progressBar.style.width = '0%';
        isImportingUsers = false;
    }
}

function parseUsersFromData(jsonData) {
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
        const nom = getValue('nom');
        const email = getValue('email');
        if (!nom || !email) continue;
        const role = getValue('role') || 'TECHNICIAN';
        const statut = getValue('statut') || 'ACTIVE';
        const actif = getValue('actif')?.toLowerCase() === 'true' || getValue('actif') === '1' || getValue('actif') === 'oui';
        const password = getValue('password') || '';
        result.push({ nom, email, role: role.toUpperCase(), statut: statut.toUpperCase(), actif, password });
    }
    return result;
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
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
    });
}

function downloadUserTemplate() {
    const headers = ['nom', 'email', 'role', 'statut', 'actif', 'password'];
    const exampleRow = ['Jean Dupont', 'jean.dupont@example.com', 'TECHNICIAN', 'ACTIVE', 'true', ''];
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
    link.setAttribute('download', 'template_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ======================== INITIALISATION ========================
document.addEventListener('DOMContentLoaded', async () => {
    await loadRoles();
    await refreshPage();

    document.getElementById('userFormCanvas').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUserCanvas();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (pendingDeleteId !== null) {
            const id = pendingDeleteId;
            pendingDeleteId = null;
            e.currentTarget.blur();
            const onceHidden = async () => {
                deleteModalEl.removeEventListener('hidden.bs.modal', onceHidden);
                try {
                    await executeDelete(id);
                } catch (err) {
                    showWarning(err.message);
                }
            };
            deleteModalEl.addEventListener('hidden.bs.modal', onceHidden, { once: true });
            deleteModal.hide();
        }
    });

    document.querySelectorAll('.status-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = pendingStatusId;
            const newStatus = btn.getAttribute('data-status');
            if (id == null || !newStatus) return;
            pendingStatusId = null;
            pendingNextStatus = newStatus;
            e.currentTarget.blur();
            const onceHidden = async () => {
                statusModalEl.removeEventListener('hidden.bs.modal', onceHidden);
                try {
                    await changeStatus(id, pendingNextStatus);
                } catch (err) {
                    showWarning(err.message);
                } finally {
                    pendingNextStatus = null;
                }
            };
            statusModalEl.addEventListener('hidden.bs.modal', onceHidden, { once: true });
            statusModal.hide();
        });
    });

    deleteModalEl.addEventListener('hidden.bs.modal', () => document.body.focus());
    statusModalEl.addEventListener('hidden.bs.modal', () => document.body.focus());

    setupImportUsersFeatures();
});