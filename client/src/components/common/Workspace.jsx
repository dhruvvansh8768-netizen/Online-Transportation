import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Workspace({ title, description, children, action }) {
  return (
    <div className="rg-width rg-workspace rg-enter">
      <header className="rg-page-heading">
        <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function Panel({ children, className = '', ...props }) {
  return <section className={'rg-panel ' + className} {...props}>{children}</section>;
}

export function BackLink({ to, children = 'Back' }) {
  return <Link className="rg-back" to={to}><ArrowLeft size={16} /> {children}</Link>;
}

export function ErrorNotice({ children }) {
  return children ? <p className="rg-error" role="alert">{children}</p> : null;
}

export function Loading({ children = 'Loading…' }) {
  return <p className="rg-loading" role="status"><Loader2 size={18} className="animate-spin" /> {children}</p>;
}

export function useResource(load) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    load().then((response) => {
      if (active) setData(response.data.data);
    }).catch((err) => {
      if (active) setError(messageFor(err));
    });
    return () => { active = false; };
  }, [load, revision]);
  return { data, error, retry: () => setRevision((value) => value + 1) };
}

export function messageFor(error) {
  return error.response?.data?.message || 'Could not reach RideGo. Check the connection and try again.';
}

export function ResourceState({ data, error, retry }) {
  if (error) return <Panel><ErrorNotice>{error}</ErrorNotice><button className="rg-link rg-secondary" onClick={retry}>Retry</button></Panel>;
  return data ? null : <Panel><Loading /></Panel>;
}

export function DataTable({ columns, rows, rowKey, empty = 'No records yet.' }) {
  if (!rows.length) return <p className="rg-empty">{empty}</p>;
  return (
    <div className="rg-table-scroll" tabIndex={0} role="region" aria-label="Data table">
      <table className="rg-table">
        <thead><tr>{columns.map(([name]) => <th key={name} scope="col">{name}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map(([name, value]) => <td key={name}>{value(row) ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value ?? 0));
}

export function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

