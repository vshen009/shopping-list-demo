// 购物清单前端：拉取清单并渲染；空清单显示空状态
const listEl = document.getElementById('item-list');
const emptyEl = document.getElementById('empty-state');

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
  li.textContent = `${item.name} × ${item.quantity}`;
  return li;
}

loadItems();
