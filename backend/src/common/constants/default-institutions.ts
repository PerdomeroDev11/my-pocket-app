import { typeIntitution, typeInvestment } from "@generated/prisma/enums";

export const DEFAULT_INSTITUTIONS = [
    {name: "Nequi" , type: typeIntitution.DIGITALWILLET},
    {name: 'Safe' , type: typeIntitution.CASH},
    {name: "Willet" , Type: typeIntitution.CASH}
]