import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { PaymentRepository } from "./payment.repository";

const repo = new PaymentRepository();

export class PaymentService {
  async record(tenantId: string, body: { invoiceId: string; amountCents: number; currency: string; providerRef?: string }) {
    const invoice = await prisma.invoice.findFirst({ where: { tenantId, id: body.invoiceId, deletedAt: null } });
    if (!invoice) throw new ApiError(404, "Invoice not found");

    const payment = await repo.create({
      tenantId,
      invoiceId: body.invoiceId,
      amountCents: body.amountCents,
      currency: body.currency,
      status: "succeeded",
      providerRef: body.providerRef
    });

    await prisma.invoice.update({
      where: { id_tenantId: { id: invoice.id, tenantId } },
      data: { status: "paid", paidAt: new Date() }
    });

    return payment;
  }
}
