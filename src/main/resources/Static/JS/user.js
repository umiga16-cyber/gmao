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

document.addEventListener('DOMContentLoaded', async () => {
    await loadRoles();
    await refreshPage();

    document.getElementById('userFormCanvas').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUserCanvas();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', (e) => {
        e.preventDefault();

        const id = pendingDeleteId;
        if (id == null) return;

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

    deleteModalEl.addEventListener('hidden.bs.modal', () => {
        document.body.focus();
    });

    statusModalEl.addEventListener('hidden.bs.modal', () => {
        document.body.focus();
    });
});

async function refreshPage() {
    try {
        await loadUsers();
    } catch (err) {
        showWarning(err.message);
    }
}

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
        const keywordOk =
            !keyword ||
            (u.nom || '').toLowerCase().includes(keyword) ||
            (u.email || '').toLowerCase().includes(keyword);

        const roleOk = !roleId || String(u.roleId) === String(roleId);
        const statusOk = !status || u.statut === status;

        return keywordOk && roleOk && statusOk;
    });

    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('usersTableBody');

    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-users fa-3x mb-3 d-block"></i>
                    <h5>Aucun utilisateur</h5>
                </td>
            </tr>
        `;
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
            <div class="detail-card">
                <div class="detail-label">Nom</div>
                <div class="detail-value">${escapeHtml(u.nom)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Email</div>
                <div class="detail-value">${escapeHtml(u.email)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Rôle</div>
                <div class="detail-value">${escapeHtml(u.roleNom)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Statut</div>
                <div class="detail-value">${escapeHtml(u.statut)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Actif</div>
                <div class="detail-value">${u.actif ? 'Oui' : 'Non'}</div>
            </div>
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
    if (!isUpdate || password) {
        payload.password = password;
    }

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
    await fetchJson(`${API_URL}/${id}/status?statut=${encodeURIComponent(newStatus)}`, {
        method: 'PATCH'
    });
    await refreshPage();
}

function showWarning(message) {
    document.getElementById('warningMessage').textContent = message;
    warningModal.show();
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('expanded');
    const logo = document.getElementById('logo-text');
    if (logo) {
        logo.style.display = document.getElementById('sidebar').classList.contains('collapsed') ? 'none' : 'inline';
    }
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