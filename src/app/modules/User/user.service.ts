import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../../utlis/prisma";
import { uploadToCloudinary } from "../../helper/fileUpload";
import { calculatePagination, TOption } from "../../helper/pagationHelper";
import { userSearchableField } from "./user.constant";

const create_Patient = async (req: Request) => {
  const patientInfo = req.body;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file);
    patientInfo.patient.profilePhoto = uploadResult?.secure_url;
  }

  const passwordSalt = Number(config.passwordSalt);
  const hashPassword = await bcrypt.hash(patientInfo.password, passwordSalt);

  const createPatient = await prisma.$transaction(async (tnx) => {
    // ✅ Create user first
    const user = await tnx.user.create({
      data: {
        email: patientInfo.patient.email,
        password: hashPassword,
      },
    });

    // ✅ Then create patient linked to that user
    const patient = await tnx.patient.create({
      data: {
        name: patientInfo.patient.name,
        email: patientInfo.patient.email,
        profilePhoto: patientInfo.patient.profilePhoto,
        user: { connect: { id: user.id } },
      },
    });

    return patient;
  });

  return createPatient;
};

const getAll = async (params: any, options: TOption) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andCondition: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: userSearchableField.map((filed) => ({
        [filed]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const getAllUser = await prisma.user.findMany({
    skip,
    take: limit,
    where: { AND: andCondition },
    orderBy: { [sortBy]: sortOrder },
  });
  return getAllUser;
};

export const UserService = {
  create_Patient,
  getAll,
};
