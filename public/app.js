// 购物清单前端：拉取清单并渲染；空清单显示空状态
const listEl = document.getElementById('item-list');
const emptyEl = document.getElementById('empty-state');
const formEl = document.getElementById('add-form');
const nameInput = document.getElementById('name-input');
const quantityInput = document.getElementById('quantity-input');

const formErrorEl = document.getElementById('form-error');

function showFormError(message) {
  formErrorEl.textContent = message;
  formErrorEl.hidden = !message;
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value, quantity: Number(quantityInput.value) || 1 }),
  });
  if (res.ok) {
    showFormError('');
    nameInput.value = '';
    quantityInput.value = '1';
    nameInput.focus();
    await loadItems();
  } else {
    const body = await res.json().catch(() => ({}));
    showFormError(body.error || '添加失败，请重试');
  }
});

const summaryEl = document.getElementById('summary');
let currentFilter = 'all';

document.querySelectorAll('.filter-tab').forEach((tab) => {
  tab.addEventListener('click', async () => {
    currentFilter = tab.dataset.filter;
    document.querySelectorAll('.filter-tab').forEach((t) => t.classList.toggle('active', t === tab));
    await loadItems();
  });
});

document.getElementById('clear-purchased').addEventListener('click', async () => {
  await fetch('/api/items?purchased=true', { method: 'DELETE' });
  await loadItems();
});

async function loadItems() {
  // 行内容按当前标签页向服务端取；统计始终基于全量
  const [filtered, all] = await Promise.all([
    fetch(`/api/items?filter=${currentFilter}`).then((r) => r.json()),
    fetch('/api/items').then((r) => r.json()),
  ]);
  render(filtered);
  const purchasedCount = all.filter((i) => i.purchased).length;
  summaryEl.textContent = `共 ${all.length} 项 · 已购 ${purchasedCount} 项`;
}

function render(items) {
  listEl.innerHTML = '';
  emptyEl.hidden = items.length > 0;
  for (const item of items) {
    listEl.appendChild(renderItem(item));
  }
}

function renderItem(item) {
  const li = document.createElement('li');
  li.className = 'item-row' + (item.purchased ? ' purchased' : '');
  li.dataset.id = item.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'purchased-toggle';
  checkbox.checked = item.purchased;
  checkbox.setAttribute('aria-label', '已购');
  checkbox.addEventListener('change', async () => {
    await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchased: checkbox.checked }),
    });
    await loadItems();
  });

  const label = document.createElement('span');
  label.className = 'item-label';
  label.textContent = `${item.name} × ${item.quantity}`;

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'edit-button';
  editButton.textContent = '编辑';
  editButton.addEventListener('click', () => enterEditMode(li, item));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '删除';
  deleteButton.addEventListener('click', async () => {
    await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
    await loadItems();
  });

  li.append(checkbox, label, editButton, deleteButton);
  return li;
}

// 行内编辑态：名称/数量输入框 + 保存/取消；校验失败行内报错并保持编辑态
function enterEditMode(li, item) {
  li.classList.add('editing');
  li.innerHTML = '';

  const nameField = document.createElement('input');
  nameField.type = 'text';
  nameField.className = 'edit-name';
  nameField.value = item.name;

  const quantityField = document.createElement('input');
  quantityField.type = 'number';
  quantityField.className = 'edit-quantity';
  quantityField.value = item.quantity;

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'save-button';
  saveButton.textContent = '保存';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'cancel-button';
  cancelButton.textContent = '取消';

  const errorEl = document.createElement('span');
  errorEl.className = 'edit-error';
  errorEl.hidden = true;

  saveButton.addEventListener('click', async () => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameField.value, quantity: Number(quantityField.value) }),
    });
    if (res.ok) {
      await loadItems();
    } else {
      const body = await res.json().catch(() => ({}));
      errorEl.textContent = body.error || '保存失败，请重试';
      errorEl.hidden = false;
    }
  });

  cancelButton.addEventListener('click', () => loadItems());

  li.append(nameField, quantityField, saveButton, cancelButton, errorEl);
  nameField.focus();
}

loadItems();
