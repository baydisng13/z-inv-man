export type ErrorRes = {
  message: string;
  errors?: { [key: string]: string[] };
};

export * from "./category";
