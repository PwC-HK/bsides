// Shared inline-style helpers for new ERP pages.
// (Existing pages keep their own local copies — these are for new pages only.)

export const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: '#888', textTransform: 'uppercase',
                    letterSpacing: '0.06em', borderBottom: '1px solid #eee' };

export const td = { padding: '12px 14px', borderBottom: '1px solid #f5f5f5', fontSize: 13 };

export const cardWrap = { background: '#fff', borderRadius: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' };

export const pageH1 = { fontSize: 20, fontWeight: 700, marginBottom: 20 };

export const input = { padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
                       fontSize: 14, outline: 'none' };

export const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#444',
                       marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };

export const btn = { padding: '10px 20px', background: '#1a1a2e', color: '#fff',
                     border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                     cursor: 'pointer' };

export const chip = (color) => ({
  background: (color || '#ccc') + '22',
  color: color || '#666',
  padding: '2px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  display: 'inline-block'
});
