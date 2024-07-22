export interface IWelcomeData {
  doctorName: string;
  email: string;
  password: string;
}

export interface IVerifyData {
  name: string;
  email: string;
  link: string;
}

export interface IRequestResetData {
  doctorName: string;
  code: string;
  email: string;
}

export interface IShareReport {
  name: string;
  link: string;
  email: string;
}
