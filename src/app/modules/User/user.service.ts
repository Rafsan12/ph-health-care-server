import { Prisma, UserRole } from "@prisma/client";
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
const create_Doctor = async (req: Request) => {
  const doctorInfo = req.body;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file);
    doctorInfo.doctor.profilePhoto = uploadResult?.secure_url;
  }

  const passwordSalt = Number(config.passwordSalt);
  const hashPassword = await bcrypt.hash(doctorInfo.password, passwordSalt);

  const createDoctor = await prisma.$transaction(async (tnx) => {
    // ✅ Create user first
    const user = await tnx.user.create({
      data: {
        email: doctorInfo.doctor.email,
        password: hashPassword,
        role: UserRole.DOCTOR,
      },
    });

    // ✅ Then create doctor linked to that user
    const doctor = await tnx.doctor.create({
      data: {
        name: doctorInfo.doctor.name,
        email: doctorInfo.doctor.email,
        profilePhoto: doctorInfo.doctor.profilePhoto,
        contactNumber: doctorInfo.doctor.contactNumber,
        address: doctorInfo.doctor.address,
        registrationNumber: doctorInfo.doctor.registrationNumber,
        experience: doctorInfo.doctor.experience,
        gender: doctorInfo.doctor.gender,
        appointmentFee: doctorInfo.doctor.appointmentFee,
        qualification: doctorInfo.doctor.qualification,
        currentWorkingPlace: doctorInfo.doctor.currentWorkingPlace,
        designation: doctorInfo.doctor.designation,
        user: { connect: { id: user.id } },
      },
    });

    return doctor;
  });

  return createDoctor;
};
const create_Admin = async (req: Request) => {
  const adminInfo = req.body;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file);
    adminInfo.admin.profilePhoto = uploadResult?.secure_url;
  }

  const passwordSalt = Number(config.passwordSalt);
  const hashPassword = await bcrypt.hash(adminInfo.password, passwordSalt);

  const createAdmin = await prisma.$transaction(async (tnx) => {
    // ✅ Create user first
    const user = await tnx.user.create({
      data: {
        email: adminInfo.admin.email,
        password: hashPassword,
        role: UserRole.ADMIN,
      },
    });

    // ✅ Then create admin linked to that user
    const admin = await tnx.admin.create({
      data: {
        name: adminInfo.admin.name,
        email: adminInfo.admin.email,
        profilePhoto: adminInfo.admin.profilePhoto,
        contactNumber: adminInfo.admin.contactNumber,
        user: { connect: { id: user.id } },
      },
    });

    return admin;
  });

  return createAdmin;
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

  const whereConditions: Prisma.UserWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const getAllUser = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: getAllUser,
  };
};

export const UserService = {
  create_Patient,
  create_Doctor,
  create_Admin,
  getAll,
};
