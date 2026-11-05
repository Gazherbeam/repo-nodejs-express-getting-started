const employeeTable = document.querySelector('#employee-rows');
const searchInput = document.querySelector('#search-input');
const statusFilter = document.querySelector('#status-filter');
const modal = document.querySelector('#employee-modal');
const form = document.querySelector('#employee-form');
const formError = document.querySelector('#form-error');
const toast = document.querySelector('#toast');

let employees = [];
let editingId = null;
let toastTimer;

const avatarTones = ['avatar-tone-0', 'avatar-tone-1', 'avatar-tone-2', 'avatar-tone-3', 'avatar-tone-4'];
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.errors?.join(' ') || payload.error || 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return payload;
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle('toast-error', isError);
  toast.classList.add('toast-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('toast-visible'), 3300);
}

function initials(employee) {
  return `${employee.first_name?.trim().charAt(0) || ''}${employee.last_name?.trim().charAt(0) || ''}`.toUpperCase();
}

function getVisibleEmployees() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  return employees.filter((employee) => {
    const matchesSearch = !query || [employee.first_name, employee.last_name, employee.email, employee.designation, employee.organization]
      .some((value) => String(value || '').toLowerCase().includes(query));
    const matchesStatus = selectedStatus === 'all' || String(employee.status) === selectedStatus;
    return matchesSearch && matchesStatus;
  });
}

function renderEmployees() {
  const visible = getVisibleEmployees();
  document.querySelector('#sidebar-count').textContent = employees.length;
  document.querySelector('#stat-total').textContent = employees.length;
  document.querySelector('#stat-active').innerHTML = `${employees.filter((employee) => Number(employee.status) === 1).length} <span class="text-xs font-semibold tracking-normal text-moss-700">active</span>`;
  document.querySelector('#stat-payroll').textContent = currency.format(employees.reduce((total, employee) => total + Number(employee.salary || 0), 0));
  document.querySelector('#table-summary').textContent = visible.length === employees.length
    ? `A lovely little team of ${employees.length} ${employees.length === 1 ? 'person' : 'people'}`
    : `Showing ${visible.length} of ${employees.length} teammates`;

  if (!visible.length) {
    const hasFilters = searchInput.value.trim() || statusFilter.value !== 'all';
    employeeTable.innerHTML = `<tr><td class="px-6 py-12 text-center" colspan="6"><div class="mx-auto grid size-10 place-items-center rounded-2xl bg-moss-50 text-moss-700">✳</div><p class="mt-3 text-sm font-semibold text-ink">${hasFilters ? 'No people found just yet' : 'Your team page is waiting to bloom'}</p><p class="mt-1 text-xs text-muted">${hasFilters ? 'Try another search or filter.' : 'Add your first teammate to get things growing.'}</p>${hasFilters ? '' : '<button class="button-primary mt-4" data-action="add" type="button">Add your first teammate</button>'}</td></tr>`;
    return;
  }

  employeeTable.innerHTML = visible.map((employee) => {
    const fullName = `${employee.first_name} ${employee.last_name}`.trim();
    const active = Number(employee.status) === 1;
    const tone = avatarTones[(Number(employee.id) - 1 + avatarTones.length * 100) % avatarTones.length];
    return `<tr class="table-row">
      <td class="pl-6"><div class="flex min-w-45 items-center gap-3"><span class="avatar ${tone}">${escapeHtml(initials(employee))}</span><div class="min-w-0"><p class="truncate text-xs font-bold text-ink">${escapeHtml(fullName)}</p><p class="mt-0.5 max-w-47.5 truncate text-[10px] text-muted">${escapeHtml(employee.email)}</p></div></div></td>
      <td><span class="text-xs font-medium text-[#505850]">${escapeHtml(employee.designation)}</span><p class="mt-0.5 text-[10px] text-muted">Team member</p></td>
      <td><span class="inline-flex max-w-36.25 items-center gap-1.5 truncate rounded-lg bg-[#f7f8f5] px-2.5 py-1.5 text-[10px] font-semibold text-[#626a61]"><svg viewBox="0 0 24 24" fill="none" class="size-3.5 shrink-0 text-[#87917f]" aria-hidden="true"><path d="M4 20h16M6.5 20V7.5L12 4l5.5 3.5V20M9.5 10h.1m4.8 0h.1m-5 3.5h.1m4.8 0h.1m-2.5 6.5v-4h-2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>${escapeHtml(employee.organization)}</span></td>
      <td><span class="inline-flex items-center gap-1.5 rounded-full ${active ? 'bg-[#eff5eb] text-[#52734e]' : 'bg-[#f1f1ef] text-[#858982]'} px-2.5 py-1.5 text-[10px] font-bold"><span class="size-1.5 rounded-full ${active ? 'bg-[#6c945e]' : 'bg-[#a2a59e]'}"></span>${active ? 'Growing' : 'On a pause'}</span></td>
      <td class="pr-6 text-right"><span class="whitespace-nowrap text-xs font-semibold tabular-nums text-ink">${currency.format(Number(employee.salary || 0))}</span></td>
      <td class="pr-3"><div class="flex items-center justify-end gap-0.5"><button class="icon-button" type="button" data-action="edit" data-id="${escapeHtml(employee.id)}" aria-label="Edit ${escapeHtml(fullName)}" title="Edit teammate"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="m14 6 4 4M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="icon-button hover:bg-rose-50! hover:text-rose-600!" type="button" data-action="delete" data-id="${escapeHtml(employee.id)}" aria-label="Remove ${escapeHtml(fullName)}" title="Remove teammate"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></td>
    </tr>`;
  }).join('');
}

async function loadEmployees() {
  employeeTable.innerHTML = '<tr><td class="px-6 py-12 text-center text-sm text-muted" colspan="6"><span class="inline-flex items-center gap-2"><span class="loading-dot"></span> Gathering your people…</span></td></tr>';
  try {
    const result = await request('/api/employees');
    employees = result.data;
    renderEmployees();
    updateConnection(true);
  } catch (error) {
    employeeTable.innerHTML = `<tr><td class="px-6 py-12 text-center" colspan="6"><p class="text-sm font-semibold text-rose-700">We couldn't reach your people right now.</p><p class="mt-1 text-xs text-muted">${escapeHtml(error.message)}</p><button class="button-secondary mt-4" data-action="reload" type="button">Try again</button></td></tr>`;
    updateConnection(false);
  }
}

function updateConnection(connected) {
  const dot = document.querySelector('#connection-dot');
  dot.classList.toggle('bg-moss-500', connected);
  dot.classList.toggle('bg-rose-400', !connected);
  document.querySelector('#connection-label').textContent = connected ? 'All connected & growing' : 'Connection needs a little care';
}

function openModal(employee = null) {
  editingId = employee ? employee.id : null;
  form.reset();
  form.elements.status.checked = true;
  formError.classList.add('hidden');
  document.querySelector('#modal-title').textContent = employee ? 'A little team update' : 'Welcome someone new';
  document.querySelector('#modal-description').textContent = employee ? 'Keep their details fresh and up to date.' : 'Add a teammate to your little corner of the world.';
  document.querySelector('#save-label').textContent = employee ? 'Save their details' : 'Add to the team';

  if (employee) {
    for (const field of ['first_name', 'last_name', 'email', 'phone', 'organization', 'designation', 'salary']) {
      form.elements[field].value = employee[field] ?? '';
    }
    form.elements.status.checked = Number(employee.status) === 1;
  }

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  window.setTimeout(() => form.elements.first_name.focus(), 50);
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  editingId = null;
}

async function submitEmployee(event) {
  event.preventDefault();
  const saveButton = document.querySelector('#save-employee');
  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());
  body.status = form.elements.status.checked ? 1 : 0;
  if (body.salary === '') delete body.salary;
  else body.salary = Number(body.salary);

  saveButton.disabled = true;
  document.querySelector('#save-label').textContent = 'Saving a little magic…';
  formError.classList.add('hidden');

  try {
    if (editingId) {
      await request(`/api/employees/${encodeURIComponent(editingId)}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Their details are all fresh and lovely.');
    } else {
      await request('/api/employees', { method: 'POST', body: JSON.stringify(body) });
      showToast('A new teammate has joined your garden.');
    }
    closeModal();
    await loadEmployees();
  } catch (error) {
    formError.textContent = error.message;
    formError.classList.remove('hidden');
  } finally {
    saveButton.disabled = false;
    document.querySelector('#save-label').textContent = editingId ? 'Save their details' : 'Add to the team';
  }
}

async function handleTableAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'add') {
    openModal();
    return;
  }
  if (action === 'reload') {
    loadEmployees();
    return;
  }

  const employee = employees.find((person) => String(person.id) === String(id));
  if (!employee) return;
  if (action === 'edit') {
    openModal(employee);
    return;
  }
  if (action === 'delete' && window.confirm(`Remove ${employee.first_name} ${employee.last_name} from your team?`)) {
    try {
      await request(`/api/employees/${encodeURIComponent(id)}`, { method: 'DELETE' });
      employees = employees.filter((person) => String(person.id) !== String(id));
      renderEmployees();
      showToast('They’ve been removed from the team.');
    } catch (error) {
      showToast(error.message, true);
    }
  }
}

async function loadInspiration() {
  try {
    const result = await request('/api/films');
    if (!result.data?.length) return;
    const film = result.data[Math.floor(Math.random() * result.data.length)];
    document.querySelector('#film-title').textContent = film.title || film.original_title || 'A little movie magic';
    document.querySelector('#film-year').textContent = film.release_date ? `A little magic from ${film.release_date}` : 'A film for the soul';
    document.querySelector('#film-description').textContent = film.description || 'A beautiful story is waiting just around the corner.';
    const image = document.querySelector('#film-image');
    image.addEventListener('load', () => {
      image.classList.remove('opacity-0');
      image.classList.add('opacity-65');
      document.querySelector('.film-art-decoration').classList.add('opacity-0');
    }, { once: true });
    image.addEventListener('error', () => image.remove(), { once: true });
    if (film.image) image.src = film.image;
  } catch {
    // The employee dashboard stays useful when the optional films service is offline.
  }
}

document.querySelector('#add-button').addEventListener('click', () => openModal());
document.querySelector('#hero-add-button').addEventListener('click', () => openModal());
document.querySelector('#employee-form').addEventListener('submit', submitEmployee);
document.querySelector('#close-modal').addEventListener('click', closeModal);
document.querySelector('#cancel-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
employeeTable.addEventListener('click', handleTableAction);
searchInput.addEventListener('input', renderEmployees);
statusFilter.addEventListener('change', renderEmployees);

loadEmployees();
loadInspiration();
