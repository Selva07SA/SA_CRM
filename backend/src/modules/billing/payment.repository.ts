import { prisma } from "../../config/prisma";

export class PaymentRepository {
  create(data: Parameters<typeof prisma.payment.create>[0]["data"]) {
    return prisma.payment.create({ data });
  }
}
