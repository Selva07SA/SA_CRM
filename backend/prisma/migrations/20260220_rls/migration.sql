-- Helper: fetch tenant id from session setting
CREATE OR REPLACE FUNCTION set_tenant() RETURNS text AS $$
  SELECT current_setting('app.current_tenant', true)
$$ LANGUAGE sql STABLE;

-- Tenant table: id must match current tenant
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "Tenant";
CREATE POLICY tenant_isolation ON "Tenant" USING ("id" = set_tenant());

-- All tenant-scoped tables
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN (
    SELECT unnest(ARRAY[
      'User','Role','RolePermission','UserRole',
      'Lead','LeadNote','Client',
      'Subscription','Invoice','Payment',
      'Activity','AuditLog','RefreshToken'
    ])
  ) LOOP
    EXECUTE format('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON "%s";', lower(tbl || '_isolation'), tbl);
    EXECUTE format('CREATE POLICY %I ON "%s" USING ("tenantId" = set_tenant());', lower(tbl || '_isolation'), tbl);
  END LOOP;
END$$;
