import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { PaymentRepository } from "./payment.repository";

const repo = new PaymentRepository();

export class PaymentService {
  async record(
    tenantId: string,
    body: { invoiceId: string; amountCents: number; currency: string; providerRef?: string },
    scopedUserId?: string
  ) {
    if (!Number.isInteger(body.amountCents) || body.amountCents <= 0) {
      throw new ApiError(400, "Payment amount must be a positive integer in cents");
    }

    const invoice = await repo.invoiceById(tenantId, body.invoiceId, scopedUserId);
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status === "canceled") throw new ApiError(409, "Cannot record payment for canceled invoice");
    if (invoice.status === "paid") throw new ApiError(409, "Invoice is already fully paid");
    if (invoice.currency !== body.currency) throw new ApiError(400, "Payment currency must match invoice currency");

    const payment = await prisma.$transaction(async (tx) => {
      const paid = await tx.payment.aggregate({
        where: {
          tenantId,
          invoiceId: body.invoiceId,
          deletedAt: null,
          status: "succeeded"
        },
        _sum: { amountCents: true }
      });

      const alreadyPaid = paid._sum.amountCents ?? 0;
      const remaining = invoice.amountCents - alreadyPaid;
      if (remaining <= 0) throw new ApiError(409, "Invoice is already fully paid");
      if (body.amountCents > remaining) {
        throw new ApiError(409, `Payment exceeds remaining invoice balance (${remaining} cents)`);
      }

      const created = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: body.invoiceId,
          amountCents: body.amountCents,
          currency: body.currency,
          status: "succeeded",
          providerRef: body.providerRef
        }
      });

      const newPaidTotal = alreadyPaid + body.amountCents;
      await tx.invoice.update({
        where: { id_tenantId: { id: invoice.id, tenantId } },
        data: {
          status: newPaidTotal >= invoice.amountCents ? "paid" : invoice.status,
          paidAt: newPaidTotal >= invoice.amountCents ? new Date() : invoice.paidAt
        }
      });

      return created;
    });

    return payment;
  }
}
