import { nameBalance } from "@generated/prisma/enums"

export const DEFAULT_BALANCE_SECTION = [
    {nameBalance: nameBalance.AVAILABLE},
    {nameBalance: nameBalance.SAVINGS},
    {nameBalance: nameBalance.INVESTMENTS},
    {nameBalance: nameBalance.TOTAL},
]