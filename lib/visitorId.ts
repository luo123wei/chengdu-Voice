// 访客标识:localStorage UUID,用于投票/预订意向防重复(同一浏览器限一票)
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem('visitor_id');
    if (!id) {
      id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('visitor_id', id);
    }
    return id;
  } catch {
    // localStorage 不可用(隐私模式等)时退化为会话级随机 id
    return `v-session-${Math.random().toString(36).slice(2)}`;
  }
}
