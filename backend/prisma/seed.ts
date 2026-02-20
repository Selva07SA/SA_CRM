import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissionKeys = [
  "lead.create",
  "lead.view",
  "lead.assign",
  "lead.convert",
  "client.create",
  "client.view",
  "client.update",
  "subscription.create",
  "subscription.cancel",
  "subscription.renew",
  "invoice.create",
  "invoice.view",
  "payment.record",
  "employee.manage",
  "dashboard.view",
  "plan.manage"
];

async function seedPermissions() {
  for (const key of permissionKeys) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key }
    });
  }
}

async function seedTenantRoles(tenantId: string) {
  const [ownerRole, adminRole, employeeRole] = await Promise.all([
    prisma.role.upsert({
      where: { tenantId_tenantRole: { tenantId, tenantRole: "OWNER" } },
      update: {},
      create: { tenantId, tenantRole: "OWNER", description: "Full access" }
    }),
    prisma.role.upsert({
      where: { tenantId_tenantRole: { tenantId, tenantRole: "ADMIN" } },
      update: {},
      create: { tenantId, tenantRole: "ADMIN", description: "Operational manager" }
    }),
    prisma.role.upsert({
      where: { tenantId_tenantRole: { tenantId, tenantRole: "EMPLOYEE" } },
      update: {},
      create: { tenantId, tenantRole: "EMPLOYEE", description: "Sales employee" }
    })
  ]);

  const permissions = await prisma.permission.findMany({ select: { id: true, key: true } });

  const ownerKeys = new Set(permissionKeys);
  const managerKeys = new Set([
    "lead.create",
    "lead.view",
    "lead.assign",
    "lead.convert",
    "client.create",
    "client.view",
    "client.update",
    "subscription.create",
    "subscription.cancel",
    "subscription.renew",
    "invoice.create",
    "invoice.view",
    "payment.record",
    "dashboard.view"
  ]);
  const agentKeys = new Set(["lead.create", "lead.view", "client.view", "dashboard.view"]);

  const grants = [
    ...permissions.filter((p) => ownerKeys.has(p.key)).map((p) => ({ roleId: ownerRole.id, permissionId: p.id })),
    ...permissions.filter((p) => managerKeys.has(p.key)).map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
    ...permissions.filter((p) => agentKeys.has(p.key)).map((p) => ({ roleId: employeeRole.id, permissionId: p.id }))
  ];

  for (const grant of grants) {
    await prisma.rolePermission.upsert({
      where: {
        tenantId_roleId_permissionId: {
          tenantId,
          roleId: grant.roleId,
          permissionId: grant.permissionId
        }
      },
      update: {},
      create: {
        tenantId,
        roleId: grant.roleId,
        permissionId: grant.permissionId
      }
    });
  }
}

async function main() {
  await seedPermissions();

  const tenants = await prisma.tenant.findMany({ where: { deletedAt: null }, select: { id: true } });
  for (const tenant of tenants) {
    await seedTenantRoles(tenant.id);
  }

  console.log(`Seed complete. Permissions: ${permissionKeys.length}, Tenants processed: ${tenants.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
