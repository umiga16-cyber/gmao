const ROLE_API = '/api/roles';

   document.addEventListener('DOMContentLoaded', async () => {
       await loadRoles();

       document.getElementById('roleForm').addEventListener('submit', async (e) => {
           e.preventDefault();
           await createRole();
       });
   });
function getCsrfHeaders() {
    const token = document.querySelector('meta[name="_csrf"]')?.content;
    const header = document.querySelector('meta[name="_csrf_header"]')?.content;

    if (token && header) {
        return { [header]: token };
    }
    return {};
}
async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...getCsrfHeaders(),
            ...(options.headers || {})
        },
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

    return rawText ? JSON.parse(rawText) : null;
}

   async function loadRoles() {
       const roles = await fetchJson(ROLE_API);
       const tbody = document.getElementById('rolesTableBody');

       if (!Array.isArray(roles) || roles.length === 0) {
           tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-4">Aucun rôle</td></tr>`;
           return;
       }

       tbody.innerHTML = roles.map(role => `
           <tr>
               <td>${role.id}</td>
               <td>${escapeHtml(role.nom)}</td>
           </tr>
       `).join('');
   }

   async function createRole() {
       const nom = document.getElementById('roleName').value.trim();
       const errorBox = document.getElementById('roleError');

       try {
           await fetchJson(ROLE_API, {
               method: 'POST',
               body: JSON.stringify({ nom })
           });

           document.getElementById('roleForm').reset();
           errorBox.classList.add('d-none');
           await loadRoles();
       } catch (err) {
           errorBox.textContent = err.message;
           errorBox.classList.remove('d-none');
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