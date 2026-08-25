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

// Dictionaries for displaying customer-readable names
export const LanguageLabels: Record<LanguageEnum, string> = {
  [LanguageEnum.Spanish]: 'Español',
  [LanguageEnum.English]: 'English',
  [LanguageEnum.Portuguese]: 'Português',
  [LanguageEnum.French]: 'Français',
  [LanguageEnum.German]: 'Deutsch',
  [LanguageEnum.Italian]: 'Italiano',
  [LanguageEnum.Japanese]: '日本語',
  [LanguageEnum.Chinese]: '中文',
};

export const CountryLabels: Record<CountryEnum, string> = {
  [CountryEnum.Colombia]: 'Colombia',
  [CountryEnum.Mexico]: 'México',
  [CountryEnum.Argentina]: 'Argentina',
  [CountryEnum.Chile]: 'Chile',
  [CountryEnum.Peru]: 'Perú',
  [CountryEnum.Spain]: 'España',
  [CountryEnum.UnitedStates]: 'Estados Unidos',
  [CountryEnum.Brazil]: 'Brasil',
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
  lenguge: LanguageEnum | null
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
}
 export interface updateProfilePicture{
  profilePicture?: File | null
 }