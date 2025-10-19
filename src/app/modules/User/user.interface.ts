import { UserRole } from "@prisma/client";

export interface IPatient {
  name: string;
  email: string;
  password: string;
}

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
}
