export type Employee = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    roleId: string;
    role: {
      id: string;
      tenantRole: string;
      description?: string | null;
    };
  }>;
};

export type TenantRoleOption = {
  id: string;
  tenantRole: string;
  description?: string | null;
};

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  company?: string | null;
  status: string;
  assignedToId?: string | null;
};

export type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
};

export type Subscription = {
  id: string;
  status: string;
  startsAt: string;
  endsAt?: string | null;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
};

export type Plan = {
  id: string;
  code: string;
  name: string;
  interval: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
};
