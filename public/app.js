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

async function loadItems() {
  const res = await fetch('/api/items');
  const items = await res.json();
  render(items);
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

  li.append(checkbox, label);
  return li;
}

loadItems();
