export type EnvConfig = { BASE_URL: string; USERNAME?: string; PASSWORD?: string; MANIFEST_URL?: string; LOCAL_MANIFEST_FILE?: string;};
export const env: EnvConfig = {
  BASE_URL: process.env.BASE_URL ?? 'https://www.office.com/launch/excel',
  USERNAME: process.env.USERNAME,
  PASSWORD: process.env.PASSWORD,
  MANIFEST_URL: process.env.MANIFEST_URL,
  LOCAL_MANIFEST_FILE: process.env.LOCAL_MANIFEST_FILE
  

};
