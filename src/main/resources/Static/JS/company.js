const COMPANY_API_URL = '/api/companies';

    const companyDetailOffcanvas = new bootstrap.Offcanvas(document.getElementById('companyDetailOffcanvas'));
    const companyFormOffcanvas = new bootstrap.Offcanvas(document.getElementById('companyFormOffcanvas'));
    const deleteCompanyModal = new bootstrap.Modal(document.getElementById('deleteCompanyModal'));
    const companyWarningModal = new bootstrap.Modal(document.getElementById('companyWarningModal'));

    let allCompanies = [];
    let pendingDeleteCompanyId = null;

    document.addEventListener('DOMContentLoaded', async () => {
        await refreshCompanyPage();

        document.getElementById('companyFormCanvas').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveCompanyCanvas();
        });

        document.getElementById('confirmDeleteCompanyBtn').addEventListener('click', async () => {
            if (pendingDeleteCompanyId !== null) {
                await executeDeleteCompany(pendingDeleteCompanyId);
                deleteCompanyModal.hide();
                pendingDeleteCompanyId = null;
            }
        });
    });

    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('mainContent').classList.toggle('expanded');
        const logo = document.getElementById('logo-text');
        if (logo) {
            logo.style.display = document.getElementById('sidebar').classList.contains('collapsed') ? 'none' : 'inline';
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
            throw new Error(message);
        }

        if (!rawText) return null;
        try {
            return JSON.parse(rawText);
        } catch (_) {
            return rawText;
        }
    }

    async function refreshCompanyPage() {
        try {
            await loadCompanyStats();
            await loadCompanies();
        } catch (err) {
            showCompanyWarning("Erreur: " + err.message);
        }
    }

    async function loadCompanyStats() {
        const data = await fetchJson(COMPANY_API_URL);
        const companies = Array.isArray(data) ? data : [];

        document.getElementById('totalCompanies').textContent = companies.length;
        document.getElementById('companiesWithCity').textContent =
            companies.filter(c => (c.city || '').trim() !== '').length;
        document.getElementById('demoCompanies').textContent =
            companies.filter(c => c.demo === true).length;
        document.getElementById('totalEmployees').textContent =
            companies.reduce((sum, c) => sum + (Number(c.employeesCount) || 0), 0);
    }

    async function loadCompanies() {
        allCompanies = await fetchJson(COMPANY_API_URL);
        renderCompanies(allCompanies);
    }

    function renderFilteredCompanies() {
        const keyword = document.getElementById('searchCompanyKeyword').value.trim().toLowerCase();
        const demoFilter = document.getElementById('demoFilter').value;

        let filtered = [...allCompanies];

        if (keyword) {
            filtered = filtered.filter(c =>
                (c.name || '').toLowerCase().includes(keyword) ||
                (c.email || '').toLowerCase().includes(keyword) ||
                (c.city || '').toLowerCase().includes(keyword)
            );
        }

        if (demoFilter !== '') {
            filtered = filtered.filter(c => String(c.demo) === demoFilter);
        }

        renderCompanies(filtered);
    }

    function resetCompanyFilters() {
        document.getElementById('searchCompanyKeyword').value = '';
        document.getElementById('demoFilter').value = '';
        renderCompanies(allCompanies);
    }

    function renderCompanies(data) {
        const tbody = document.getElementById('companyTableBody');

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-building fa-3x mb-3"></i>
                        <h5>Aucune société</h5>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(c => `
            <tr>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.email)}</td>
                <td>${escapeHtml(c.city)}</td>
                <td>${c.employeesCount ?? 0}</td>
                <td>${renderDemoBadge(c.demo)}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary btn-action" onclick="showCompanyDetail(${c.id})" title="Détail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-action" onclick="openEditCompanyOffcanvas(${c.id})" title="Éditer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-action" onclick="confirmDeleteCompany(${c.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderDemoBadge(demo) {
        return demo
            ? `<span class="badge-demo demo-yes">Démo</span>`
            : `<span class="badge-demo demo-no">Réelle</span>`;
    }

    async function showCompanyDetail(id) {
        try {
            const c = await fetchJson(`${COMPANY_API_URL}/${id}/detail`);
            document.getElementById('companyDetailBodyCanvas').innerHTML = `
                <div class="detail-header">
                    <div class="detail-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <h4 class="fw-bold mb-1">${escapeHtml(c.name)}</h4>
                    <p class="text-muted mb-0">${escapeHtml(c.email)}</p>
                </div>

                <div class="section-title">Informations générales</div>
                <div class="row g-3 mb-4">
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Téléphone</div><div class="detail-value">${escapeHtml(c.phone)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Site web</div><div class="detail-value">${escapeHtml(c.website)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Ville</div><div class="detail-value">${escapeHtml(c.city)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">État</div><div class="detail-value">${escapeHtml(c.state)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Code postal</div><div class="detail-value">${escapeHtml(c.zipCode)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Employés</div><div class="detail-value">${c.employeesCount ?? 0}</div></div></div>
                    <div class="col-12"><div class="detail-card"><div class="detail-label">Adresse</div><div class="detail-value">${escapeHtml(c.address)}</div></div></div>
                </div>

                <div class="section-title">Préférences</div>
                <div class="row g-3 mb-4">
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Langue</div><div class="detail-value">${escapeHtml(c.language)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Date format</div><div class="detail-value">${escapeHtml(c.dateFormat)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Currency</div><div class="detail-value">${escapeHtml(c.currencyCode)}</div></div></div>
                    <div class="col-6"><div class="detail-card"><div class="detail-label">Business type</div><div class="detail-value">${escapeHtml(c.businessType)}</div></div></div>
                    <div class="col-12"><div class="detail-card"><div class="detail-label">Time zone</div><div class="detail-value">${escapeHtml(c.timeZone)}</div></div></div>
                </div>
            `;
            companyDetailOffcanvas.show();
        } catch (err) {
            showCompanyWarning(err.message);
        }
    }

    function openCreateCompanyOffcanvas() {
        document.getElementById('companyFormOffcanvasLabel').innerText = 'Nouvelle société';
        document.getElementById('companyFormCanvas').reset();
        document.getElementById('companyIdCanvas').value = '';
        document.getElementById('companyFormErrorCanvas').classList.add('d-none');
        companyFormOffcanvas.show();
    }

    async function openEditCompanyOffcanvas(id) {
        try {
            const c = await fetchJson(`${COMPANY_API_URL}/${id}/detail`);
            document.getElementById('companyFormOffcanvasLabel').innerText = 'Éditer société';
            document.getElementById('companyIdCanvas').value = c.id ?? '';
            document.getElementById('companyNameCanvas').value = c.name ?? '';
            document.getElementById('companyEmailCanvas').value = c.email ?? '';
            document.getElementById('companyPhoneCanvas').value = c.phone ?? '';
            document.getElementById('companyWebsiteCanvas').value = c.website ?? '';
            document.getElementById('companyAddressCanvas').value = c.address ?? '';
            document.getElementById('companyCityCanvas').value = c.city ?? '';
            document.getElementById('companyStateCanvas').value = c.state ?? '';
            document.getElementById('companyZipCodeCanvas').value = c.zipCode ?? '';
            document.getElementById('companyEmployeesCountCanvas').value = c.employeesCount ?? '';
            document.getElementById('companyLogoUrlCanvas').value = c.logoUrl ?? '';
            document.getElementById('companyDemoCanvas').value = String(c.demo ?? false);
            document.getElementById('companyLanguageCanvas').value = c.language ?? '';
            document.getElementById('companyDateFormatCanvas').value = c.dateFormat ?? '';
            document.getElementById('companyCurrencyCodeCanvas').value = c.currencyCode ?? '';
            document.getElementById('companyBusinessTypeCanvas').value = c.businessType ?? '';
            document.getElementById('companyTimeZoneCanvas').value = c.timeZone ?? '';
            document.getElementById('companyFormErrorCanvas').classList.add('d-none');
            companyFormOffcanvas.show();
        } catch (err) {
            showCompanyWarning(err.message);
        }
    }

    async function saveCompanyCanvas() {
        const id = document.getElementById('companyIdCanvas').value;
        const isUpdate = !!id;

        const payload = {
            name: getValue('companyNameCanvas'),
            email: getValue('companyEmailCanvas'),
            phone: getValue('companyPhoneCanvas'),
            website: getValue('companyWebsiteCanvas'),
            address: getValue('companyAddressCanvas'),
            city: getValue('companyCityCanvas'),
            state: getValue('companyStateCanvas'),
            zipCode: getValue('companyZipCodeCanvas'),
            employeesCount: getNumberValue('companyEmployeesCountCanvas'),
            logoUrl: getValue('companyLogoUrlCanvas'),
            demo: document.getElementById('companyDemoCanvas').value === 'true',
            language: getValue('companyLanguageCanvas') || null,
            dateFormat: getValue('companyDateFormatCanvas') || null,
            currencyCode: getValue('companyCurrencyCodeCanvas') || null,
            businessType: getValue('companyBusinessTypeCanvas') || null,
            timeZone: getValue('companyTimeZoneCanvas') || null
        };

        try {
            const url = isUpdate ? `${COMPANY_API_URL}/${id}` : COMPANY_API_URL;
            const method = isUpdate ? 'PUT' : 'POST';

            await fetchJson(url, {
                method,
                body: JSON.stringify(payload)
            });

            companyFormOffcanvas.hide();
            await refreshCompanyPage();
        } catch (err) {
            const errBox = document.getElementById('companyFormErrorCanvas');
            errBox.textContent = err.message;
            errBox.classList.remove('d-none');
        }
    }

    function confirmDeleteCompany(id) {
        pendingDeleteCompanyId = id;
        deleteCompanyModal.show();
    }

    async function executeDeleteCompany(id) {
        try {
            await fetchJson(`${COMPANY_API_URL}/${id}`, { method: 'DELETE' });
            await refreshCompanyPage();
        } catch (err) {
            showCompanyWarning(err.message);
        }
    }

    function showCompanyWarning(message) {
        document.getElementById('companyWarningMessage').textContent = message;
        companyWarningModal.show();
    }

    function getValue(id) {
        return document.getElementById(id).value.trim();
    }

    function getNumberValue(id) {
        const value = document.getElementById(id).value.trim();
        return value ? Number(value) : null;
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

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
        document.getElementById('mainContent').classList.add('expanded');
    }