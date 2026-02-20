import { useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import useAsyncData from '../hooks/useAsyncData';
import { getClients } from '../services/crmApi';

function ClientsPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');

  const { loading, error, data, reload } = useAsyncData(
    (signal) => getClients(token, 'page=1&limit=20&includeTotal=false', { signal }),
    [token]
  );

  const rows = data?.data?.clients || [];
  const filtered = useMemo(() => {
    if (!query) {
      return rows;
    }
    const q = query.toLowerCase();
    return rows.filter((row) =>
      [row.firstName, row.lastName, row.email, row.company, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [rows, query]);

  return (
    <section>
      <PageHeader
        title="Clients"
        subtitle="Manage customer accounts and ownership."
        actions={<button className="crm-btn crm-btn-secondary" onClick={reload}>Reload</button>}
      />

      <Panel>
        <div className="table-tools">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients by name, email, company..."
          />
        </div>

        {error ? <p className="crm-error">{error}</p> : null}
        {loading ? <p className="crm-loading">Loading clients...</p> : null}
        {!loading && filtered.length === 0 ? <EmptyState message="No clients found." /> : null}

        {!loading && filtered.length > 0 ? (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td>{client.firstName} {client.lastName}</td>
                  <td>{client.email}</td>
                  <td>{client.company || '-'}</td>
                  <td><span className={`pill pill-${client.status || 'default'}`}>{client.status || '-'}</span></td>
                  <td>{client.assignedEmployee ? `${client.assignedEmployee.firstName} ${client.assignedEmployee.lastName}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}

export default ClientsPage;
