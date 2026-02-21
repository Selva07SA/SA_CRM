import { describe, it, expect } from "vitest";
import { prisma } from "../config/prisma";

describe("Tenant Isolation (RLS)", () => {
    it("should correctly set the tenant session variable", async () => {
        const testTenantId = "test-tenant-123";

        // This simulates what the tenantContext middleware does
        await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${testTenantId}, false)`;

        const result = await prisma.$queryRaw<Array<{ current_setting: string }>>`SELECT current_setting('app.current_tenant')`;

        expect(result[0].current_setting).toBe(testTenantId);
    });

    it("should handle multi-tenant context switches correctly", async () => {
        const tenantA = "tenant-a";
        const tenantB = "tenant-b";

        await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantA}, false)`;
        const resA = await prisma.$queryRaw<Array<{ val: string }>>`SELECT current_setting('app.current_tenant') as val`;
        expect(resA[0].val).toBe(tenantA);

        await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantB}, false)`;
        const resB = await prisma.$queryRaw<Array<{ val: string }>>`SELECT current_setting('app.current_tenant') as val`;
        expect(resB[0].val).toBe(tenantB);
    });
});
