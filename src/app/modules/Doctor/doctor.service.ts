import { Prisma } from "@prisma/client";
import { prisma } from "../../../utlis/prisma";
import { calculatePagination, TOption } from "../../helper/pagationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorInput } from "./doctor.interface";

const getAllDoctors = async (options: TOption, filters: any) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andCondition: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterCondition = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));

    andCondition.push(...filterCondition);
  }

  const whereCondition: Prisma.DoctorWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.doctor.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.doctor.count({
    where: whereCondition,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateDoctor = async (id: string, payload: Partial<IDoctorInput>) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { specialties, ...doctorData } = payload;

  if (specialties && specialties.length > 0) {
    const deleteSpecialties = specialties.filter(
      (specialty) => specialty.isDeleted
    );
    for (const specialty of deleteSpecialties) {
      await prisma.doctorSpecialties.deleteMany({
        where: {
          doctorId: id,
          specialitiesId: specialty.specialtyId,
        },
      });
    }
    const createSpecialties = specialties.filter(
      (specialty) => !specialty.isDeleted
    );
    for (const specialty of createSpecialties) {
      await prisma.doctorSpecialties.create({
        data: {
          doctorId: id,
          specialitiesId: specialty.specialtyId,
        },
      });
    }
  }

  const updateData = await prisma.doctor.update({
    where: {
      id: doctorInfo.id,
    },
    data: doctorData,
  });

  return updateData;
};

export const DoctorService = {
  getAllDoctors,
  updateDoctor,
};
