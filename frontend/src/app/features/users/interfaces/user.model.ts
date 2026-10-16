export enum LanguageEnum {
  Spanish = 'es',
  English = 'en',
  Portuguese = 'pt',
  French = 'fr',
  German = 'de',
  Italian = 'it',
  Japanese = 'ja',
  Chinese = 'zh',
}

export enum TypePeriodEnum {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
  FREELANCE = 'FREELANCE'
}

export enum TimezoneEnum {
  AmericaBogota = 'America/Bogota',
  AmericaMexicoCity = 'America/Mexico_City',
  AmericaNewYork = 'America/New_York',
  AmericaSantiago = 'America/Santiago',
  AmericaSaoPaulo = 'America/Sao_Paulo',
  AmericaBuenosAires = 'America/Argentina/Buenos_Aires',
  EuropeMadrid = 'Europe/Madrid',
  UTC = 'UTC',
}

export enum CountryEnum {
  Colombia = 'CO',
  Mexico = 'MX',
  Argentina = 'AR',
  Chile = 'CL',
  Peru = 'PE',
  Spain = 'ES',
  UnitedStates = 'US',
  Brazil = 'BR',
  Ecuador = 'EC',
  Uruguay = 'UY',
}
export enum CurrencyEnum {
  USD = "USD",
  ARS = "ARS",
  BOB = "BOB",
  BRL = "BRL",
  CLP = "CLP",
  COP = "COP",
  CRC = "CRC",
  CUP = "CUP",
  DOP = "DOP",
  GTQ = "GTQ",
  HNL = "HNL",
  MXN = "MXN",
  NIO = "NIO",
  PAB = "PAB",
  PYG = "PYG",
  PEN = "PEN",
  UYU = "UYU",
  VES = "VES"
}

export const CurrencyLabels: Record<CurrencyEnum, string> = {
  [CurrencyEnum.USD]: "Dólar Unites stade(USD)",
  [CurrencyEnum.ARS]: "Peso argentino(ARS)",
  [CurrencyEnum.BOB]: "Boliviano(BOB)",
  [CurrencyEnum.BRL]: "Real brasileño(BRL)",
  [CurrencyEnum.CLP]: "Peso chileno(CLP)",
  [CurrencyEnum.COP]: "Peso colombiano(COP)",
  [CurrencyEnum.CRC]: "Colón costarricense(CRC)",
  [CurrencyEnum.CUP]: "Peso cubano(CUP)",
  [CurrencyEnum.DOP]: "Peso dominicano(DOP)",
  [CurrencyEnum.GTQ]: "Quetzal guatemalteco(GTQ)",
  [CurrencyEnum.HNL]: "Lempira hondureña(HNL)",
  [CurrencyEnum.MXN]: "Peso mexicano(MXN)",
  [CurrencyEnum.NIO]: "Córdoba nicaragüense(NIO)",
  [CurrencyEnum.PAB]: "Balboa panameño(PAB)",
  [CurrencyEnum.PYG]: "Guaraní paraguayo(PYG)",
  [CurrencyEnum.PEN]: "Sol peruano(PEN)",
  [CurrencyEnum.UYU]: "Peso uruguayo(AYU)",
  [CurrencyEnum.VES]: "Bolívar soberano venezolano(VES)"
};
// Dictionaries for displaying customer-readable names
export const LanguageLabels: Record<LanguageEnum, string> = {
  [LanguageEnum.Spanish]: 'Spanish',
  [LanguageEnum.English]: 'English',
  [LanguageEnum.Portuguese]: 'Portuguese',
  [LanguageEnum.French]: 'French',
  [LanguageEnum.German]: 'German',
  [LanguageEnum.Italian]: 'Italian',
  [LanguageEnum.Japanese]: 'Japanese',
  [LanguageEnum.Chinese]: 'Chinese',
};

export const CountryLabels: Record<CountryEnum, string> = {
  [CountryEnum.Colombia]: 'Colombia',
  [CountryEnum.Mexico]: 'Mexico',
  [CountryEnum.Argentina]: 'Argentina',
  [CountryEnum.Chile]: 'Chile',
  [CountryEnum.Peru]: 'Peru',
  [CountryEnum.Spain]: 'Spain',
  [CountryEnum.UnitedStates]: 'United States',
  [CountryEnum.Brazil]: 'Brazil',
  [CountryEnum.Ecuador]: 'Ecuador',
  [CountryEnum.Uruguay]: 'Uruguay',
};

export interface UserResponse {
  name: string
  email: string
  verifyEmail: boolean
  profilePicture: string | null
  timeZone: TimezoneEnum
  status: string
  language: LanguageEnum | null
  country: CountryEnum
  createdAt: Date
  updatedAt: Date
  currency: string | null
  typePeriod: TypePeriodEnum
  withGoogle?: boolean
}

export interface User {
  name: string;
  email: string;
  verifyEmail: boolean;
  status: string;
}

export interface ChangePassword {
  password: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateUser {
  name?: string
  profilePicture?: File
  language?: LanguageEnum
  typePeriod?: TypePeriodEnum
  timeZone?: TimezoneEnum
  country?: CountryEnum
  currency?: CurrencyEnum
}
 export interface updateProfilePicture{
  profilePicture?: File | null
 }
