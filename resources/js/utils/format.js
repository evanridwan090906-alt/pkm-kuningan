export const formatDate = (dateString, format = 'd/m/Y') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const Y = date.getFullYear();
  const M = date.toLocaleString('id-ID', { month: 'short' });

  const pad = (n) => n.toString().padStart(2, '0');

  switch (format) {
    case 'Y-m-d':
      return `${Y}-${pad(m)}-${pad(d)}`;
    case 'd M Y':
      return `${pad(d)} ${M} ${Y}`;
    case 'd/m/Y':
    default:
      return `${pad(d)}/${pad(m)}/${Y}`;
  }
};
