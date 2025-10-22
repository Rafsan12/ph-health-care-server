import { Specialties } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../../../utlis/prisma";
import { uploadToCloudinary } from "../../helper/fileUpload";

const inserIntoDB = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinaryFile = await uploadToCloudinary(file);
    req.body.icon = uploadToCloudinaryFile?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (): Promise<Specialties[]> => {
  return await prisma.specialties.findMany();
};

const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
