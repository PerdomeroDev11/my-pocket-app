import { Prisma } from "@generated/prisma/browser";


export type MovementWithCategory = Prisma.MovementsGetPayload<{
  include: {
    category: true;
    institutionFinancial: true;
  };
}>;