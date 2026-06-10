// 校验模块（深模块）：清单项输入规则集中在此，路由层不重复定义。
// 规则：名称去首尾空白后 1–50 字符；数量为 1–99 的整数（缺省 1）。
const NAME_MAX = 50;
const QUANTITY_MIN = 1;
const QUANTITY_MAX = 99;

export function validateItemInput({ name, quantity } = {}) {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) {
    return { ok: false, error: '名称不能为空' };
  }
  if (trimmed.length > NAME_MAX) {
    return { ok: false, error: `名称不能超过 ${NAME_MAX} 个字符` };
  }

  const qty = quantity === undefined || quantity === null ? 1 : quantity;
  if (!Number.isInteger(qty) || qty < QUANTITY_MIN || qty > QUANTITY_MAX) {
    return { ok: false, error: `数量必须是 ${QUANTITY_MIN}–${QUANTITY_MAX} 的整数` };
  }

  return { ok: true, value: { name: trimmed, quantity: qty } };
}

// PATCH 局部校验：只校验出现的字段，规则与 validateItemInput 完全一致
export function validateItemPatch(patch = {}) {
  const out = {};
  if ('name' in patch) {
    const result = validateItemInput({ name: patch.name });
    if (!result.ok) return result;
    out.name = result.value.name;
  }
  if ('quantity' in patch) {
    const result = validateItemInput({ name: '占位', quantity: patch.quantity });
    if (!result.ok) return result;
    out.quantity = result.value.quantity;
  }
  if ('purchased' in patch) {
    out.purchased = Boolean(patch.purchased);
  }
  return { ok: true, value: out };
}
