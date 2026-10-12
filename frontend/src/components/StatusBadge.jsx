import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (type === 'severity') {
    const sevClass = `badge-${(status || 'Medium').toLowerCase()}`;
    return <span className={`badge ${sevClass}`}>{status}</span>;
  }

  const norm = (status || 'Pending').toLowerCase().replace(' ', '-');
  const statusClass = `badge-${norm}`;
  return <span className={`badge ${statusClass}`}>{status}</span>;
}
