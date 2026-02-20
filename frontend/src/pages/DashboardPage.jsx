import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Panel from '../components/ui/Panel';
import { recentActivities, pendingTasks } from '../data/crmSeed';
import { useAuth } from '../context/AuthContext';
import { checkHealth, getClients, getEmployees, getLeads, getSubscriptions } from '../services/crmApi';
import useAsyncData from '../hooks/useAsyncData';

function DashboardPage() {
  const { token, user } = useAuth();
  const { loading, error, data, reload } = useAsyncData(async (signal) => {
    const requests = [
      checkHealth({ signal }),
      getClients(token, 'page=1&limit=20&includeTotal=false', { signal }),
      getLeads(token, 'page=1&limit=20&includeTotal=false', { signal }),
      getSubscriptions(token, 'page=1&limit=20&includeTotal=false', { signal })
    ];

    if (user?.role === 'admin') {
      requests.push(getEmployees(token, 'page=1&limit=20&includeTotal=false', { signal }));
    }

    const [health, clients, leads, subscriptions, employees] = await Promise.all(requests);

    return {
      health,
      clients: clients.data,
      leads: leads.data,
      subscriptions: subscriptions.data,
      employees: employees?.data || null
    };
  }, [token, user?.role]);

  const clientCount = data?.clients?.clients?.length ?? 0;
  const leadCount = data?.leads?.leads?.length ?? 0;
  const subscriptionCount = data?.subscriptions?.subscriptions?.length ?? 0;
  const paidSubscriptions = (data?.subscriptions?.subscriptions || []).filter(
    (item) => item.paymentStatus === 'paid'
  );
  const totalRevenue = paidSubscriptions.reduce((sum, item) => {
    const price = Number(item?.plan?.price || 0);
    return sum + (Number.isNaN(price) ? 0 : price);
  }, 0);

  const employeeProgress = (() => {
    if (user?.role !== 'admin') {
      return [];
    }

    const employees = data?.employees?.employees || [];
    const leads = data?.leads?.leads || [];
    const clients = data?.clients?.clients || [];

    return employees.map((employee) => {
      const ownedLeads = leads.filter((lead) => lead.assignedTo === employee.id);
      const ownedClients = clients.filter((client) => client.assignedTo === employee.id);
      const converted = ownedLeads.filter((lead) => lead.status === 'converted').length;
      return {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.role,
        leads: ownedLeads.length,
        converted,
        clients: ownedClients.length
      };
    });
  })();

  return (
    <section>
      <PageHeader
        title={user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
        subtitle={
          user?.role === 'admin'
            ? 'Monitor employee progress, client growth, and revenue.'
            : 'Track your assigned leads, clients, and follow-up workload.'
        }
        actions={<button className="crm-btn crm-btn-secondary" onClick={reload}>Refresh</button>}
      />

      <div className="stats-grid">
        <StatCard label="Total Leads" value={leadCount} tone="primary" />
        <StatCard label="Total Clients" value={clientCount} tone="success" />
        <StatCard label="Subscriptions" value={subscriptionCount} tone="warning" />
        <StatCard
          label={user?.role === 'admin' ? 'Revenue (Paid)' : 'API Status'}
          value={user?.role === 'admin' ? `$${totalRevenue.toFixed(2)}` : (data?.health?.message || 'Checking...')}
        />
      </div>

      {error ? <p className="crm-error">{error}</p> : null}
      {loading ? <p className="crm-loading">Loading dashboard...</p> : null}

      <div className="dashboard-grid">
        <Panel title={user?.role === 'admin' ? 'Employee Progress' : 'Recent Activity'}>
          {user?.role === 'admin' ? (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Leads</th>
                  <th>Converted</th>
                  <th>Clients</th>
                </tr>
              </thead>
              <tbody>
                {employeeProgress.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.role}</td>
                    <td>{item.leads}</td>
                    <td>{item.converted}</td>
                    <td>{item.clients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
          <ul className="list-clean">
            {recentActivities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          )}
        </Panel>

        <Panel title={user?.role === 'admin' ? 'Income Summary' : 'Upcoming Tasks'}>
          {user?.role === 'admin' ? (
            <ul className="list-clean">
              <li>Paid subscriptions: {paidSubscriptions.length}</li>
              <li>Estimated recognized revenue: ${totalRevenue.toFixed(2)}</li>
              <li>Active clients in CRM: {clientCount}</li>
              <li>Current lead pipeline size: {leadCount}</li>
            </ul>
          ) : (
          <ul className="task-list">
            {pendingTasks.map((task) => (
              <li key={task.id}>
                <span>{task.title}</span>
                <span className="task-due">{task.due}</span>
              </li>
            ))}
          </ul>
          )}
        </Panel>
      </div>
    </section>
  );
}

export default DashboardPage;
