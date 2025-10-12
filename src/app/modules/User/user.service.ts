import bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { prisma } from "../../../utlis/prisma";
import { uploadToCloudinary } from "../../helper/fileUpload";

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

export const UserService = {
  create_Patient,
};
