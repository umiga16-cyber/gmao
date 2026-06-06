const API_STOCK_URL = '/api/stock';

const detailOffcanvas = new bootstrap.Offcanvas(document.getElementById('detailOffcanvas'));
const formOffcanvas = new bootstrap.Offcanvas(document.getElementById('formOffcanvas'));

const deleteModalEl = document.getElementById('deleteConfirmModal');
const deleteModal = new bootstrap.Modal(deleteModalEl);

const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));

let stockData = [];
let pendingDeleteId = null;

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

function parseNumber(value) {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
}

function updateStats() {
    const total = stockData.length;
    let low = 0;
    let out = 0;
    let totalQty = 0;

    stockData.forEach(item => {
        const qty = parseNumber(item.quantiteStock);
        const seuil = parseNumber(item.seuilMini);

        totalQty += qty;

        if (qty === 0) {
            out++;
        } else if (qty <= seuil) {
            low++;
        }
    });

    document.getElementById('totalItems').textContent = total;
    document.getElementById('lowStockCount').textContent = low;
    document.getElementById('outOfStockCount').textContent = out;
    document.getElementById('totalQuantity').textContent = totalQty.toFixed(3);
}

function renderTable(filteredData) {
    const tbody = document.getElementById('stockTableBody');

    if (!filteredData.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
                    <h5>Aucune PR en stock</h5>
                    <p class="text-muted mb-0">Ajoutez votre première pièce de rechange.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredData.map(item => {
        const qty = parseNumber(item.quantiteStock);
        const seuil = parseNumber(item.seuilMini);
        const mouvementsCount = item.mouvementsCount ?? 0;
        const interventionsCount = item.interventionsCount ?? 0;

        let stockClass = 'stock-normal';
        let stockLabel = 'Normal';

        if (qty === 0) {
            stockClass = 'stock-out';
            stockLabel = 'Rupture';
        } else if (qty <= seuil) {
            stockClass = 'stock-low';
            stockLabel = 'Stock bas';
        }

		const deleteDisabled = '';

        return `
            <tr>
                <td class="text-truncate-cell" title="${escapeHtml(item.libelle)}">
                    <strong>${escapeHtml(item.libelle)}</strong>
                </td>
                <td>${qty}</td>
                <td>${seuil}</td>
                <td><span class="stock-badge ${stockClass}">${stockLabel}</span></td>
                <td>${mouvementsCount}</td>
                <td>${interventionsCount}</td>
                <td class="text-nowrap text-center">
                    <button class="btn btn-outline-info btn-action" onclick="showDetail(${item.id})" title="Détail">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning btn-action" onclick="openEditCanvas(${item.id})" title="Éditer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-action" onclick="confirmDelete(${item.id})" title="Supprimer" ${deleteDisabled}>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterStock() {
    const search = document.getElementById('searchName').value.trim().toLowerCase();

    let filtered = [...stockData];

    if (search) {
        filtered = filtered.filter(item =>
            item.libelle && item.libelle.toLowerCase().includes(search)
        );
    }

    renderTable(filtered);
}

function resetFilters() {
    document.getElementById('searchName').value = '';
    filterStock();
}

async function loadStock() {
    try {
        const data = await fetchJson(API_STOCK_URL);
        stockData = Array.isArray(data) ? data : [];
        updateStats();
        filterStock();
    } catch (err) {
        showWarning("Erreur chargement stock : " + err.message);
    }
}

async function showDetail(id) {
    try {
        const item = await fetchJson(`${API_STOCK_URL}/${id}`);

        const html = `
            <div class="detail-card">
                <div class="detail-label">Libellé</div>
                <div class="detail-value">${escapeHtml(item.libelle)}</div>
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

function openCreateOffcanvas() {
    document.getElementById('formOffcanvasLabel').innerText = 'Nouvelle PR';
    document.getElementById('stockFormCanvas').reset();
    document.getElementById('stockIdCanvas').value = '';
    document.getElementById('quantiteStockCanvas').value = '0';
    document.getElementById('seuilMiniCanvas').value = '0';
    document.getElementById('formErrorCanvas').classList.add('d-none');
    formOffcanvas.show();
}

async function openEditCanvas(id) {
    try {
        const item = await fetchJson(`${API_STOCK_URL}/${id}`);
        document.getElementById('formOffcanvasLabel').innerText = 'Modifier la PR';
        document.getElementById('stockIdCanvas').value = item.id;
        document.getElementById('libelleCanvas').value = item.libelle || '';
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
        libelle: document.getElementById('libelleCanvas').value.trim(),
        quantiteStock: document.getElementById('quantiteStockCanvas').value,
        seuilMini: document.getElementById('seuilMiniCanvas').value
    };

    if (!payload.libelle) {
        showWarning("Le libellé est obligatoire.");
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
        await loadStock();
    } catch (err) {
        showWarning(err.message || "Suppression impossible.");
    }
}

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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}