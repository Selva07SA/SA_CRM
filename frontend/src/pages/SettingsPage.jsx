import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import { API_BASE_URL } from '../services/apiClient';
import { checkHealth } from '../services/crmApi';
import useAsyncData from '../hooks/useAsyncData';

function SettingsPage() {
  const { loading, error, data, reload } = useAsyncData((signal) => checkHealth({ signal }), []);

  return (
    <section>
      <PageHeader
        title="Settings"
        subtitle="Environment and integration settings for your CRM workspace."
        actions={<button className="crm-btn crm-btn-secondary" onClick={reload}>Ping API</button>}
      />

      <div className="settings-grid">
        <Panel title="API Connection">
          <div className="settings-row">
            <span>Base URL</span>
            <code>{API_BASE_URL}</code>
          </div>
          <div className="settings-row">
            <span>Health</span>
            <strong>{loading ? 'Checking...' : data?.message || 'Unavailable'}</strong>
          </div>
          {error ? <p className="crm-error">{error}</p> : null}
        </Panel>

        <Panel title="Security Recommendations">
          <ul className="list-clean">
            <li>Use HTTPS for both frontend and backend in production.</li>
            <li>Set strict `CORS_ORIGINS` on backend environment.</li>
            <li>Rotate `JWT_SECRET` periodically and store it securely.</li>
            <li>Use short-lived tokens and re-authenticate when needed.</li>
          </ul>
        </Panel>
      </div>
    </section>
  );
}

export default SettingsPage;
