import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import useAsyncData from '../hooks/useAsyncData';
import { getSubscriptions } from '../services/crmApi';

function SubscriptionsPage() {
  const { token } = useAuth();
  const { loading, error, data, reload } = useAsyncData(
    (signal) => getSubscriptions(token, 'page=1&limit=20&includeTotal=false', { signal }),
    [token]
  );

  const rows = data?.data?.subscriptions || [];

  return (
    <section>
      <PageHeader
        title="Subscriptions"
        subtitle="Monitor contract lifecycle and payment status."
        actions={<button className="crm-btn crm-btn-secondary" onClick={reload}>Reload</button>}
      />

      <Panel>
        {error ? <p className="crm-error">{error}</p> : null}
        {loading ? <p className="crm-loading">Loading subscriptions...</p> : null}
        {!loading && rows.length === 0 ? <EmptyState message="No subscriptions found." /> : null}

        {!loading && rows.length > 0 ? (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.client ? `${item.client.firstName} ${item.client.lastName}` : '-'}</td>
                  <td>{item.plan?.name || '-'}</td>
                  <td><span className={`pill pill-${item.status || 'default'}`}>{item.status || '-'}</span></td>
                  <td><span className={`pill pill-${item.paymentStatus || 'default'}`}>{item.paymentStatus || '-'}</span></td>
                  <td>{item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}</td>
                  <td>{item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </section>
  );
}

export default SubscriptionsPage;
