import { describe, it, expect } from 'vitest';
import { validateItemInput } from '../server/validation.mjs';

// 校验模块纯函数单测：只测边界组合的外部行为（通过/拒绝 + 中文消息）
describe('validateItemInput', () => {
  it('空名称、纯空白名称被拒绝，消息为中文', () => {
    for (const name of ['', '   ', undefined, null]) {
      const result = validateItemInput({ name });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/[一-龥]/);
    }
  });

  it('名称 50 字符通过，51 字符被拒绝', () => {
    expect(validateItemInput({ name: '货'.repeat(50) }).ok).toBe(true);
    expect(validateItemInput({ name: '货'.repeat(51) }).ok).toBe(false);
  });

  it('名称首尾空白被去除后再校验', () => {
    const result = validateItemInput({ name: '  牛奶  ' });
    expect(result.ok).toBe(true);
    expect(result.value.name).toBe('牛奶');
  });

  it('数量 1 和 99 通过；0、100、小数被拒绝', () => {
    expect(validateItemInput({ name: '牛奶', quantity: 1 }).ok).toBe(true);
    expect(validateItemInput({ name: '牛奶', quantity: 99 }).ok).toBe(true);
    for (const quantity of [0, 100, 1.5, -3]) {
      const result = validateItemInput({ name: '牛奶', quantity });
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/[一-龥]/);
    }
  });

  it('数量缺省为 1', () => {
    expect(validateItemInput({ name: '牛奶' }).value.quantity).toBe(1);
  });
});
