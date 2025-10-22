import { UserGender } from "@prisma/client";

export interface IDoctorInput {
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  registrationNumber: string;
  experience: number;
  gender: UserGender;
  appointmentFee: number;
  qualification: string;
  currentWorkingPlace: string;
  designation: string;
  isDeleted: boolean;

  specialties: {
    specialtyId: string;
    isDeleted: boolean;
  }[];
}
