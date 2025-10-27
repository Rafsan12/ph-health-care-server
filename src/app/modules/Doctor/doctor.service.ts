import { Doctor, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../utlis/prisma";
import { openai } from "../../helper/askAI";
import { extractJsonFromMessage } from "../../helper/extractJsonFromMessage";
import { calculatePagination, TOption } from "../../helper/pagationHelper";
import ApiError from "../../middlewares/ApiError";
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

  return await prisma.$transaction(async (tnx) => {
    if (specialties && specialties.length > 0) {
      const deleteSpecialties = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      for (const specialty of deleteSpecialties) {
        await tnx.doctorSpecialties.deleteMany({
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
        await tnx.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }
    const updateData = await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: true,
      },
    });
    return updateData;
  });
};

const getDoctorById = async (id: string): Promise<Doctor | null> => {
  const getDoctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedule: {
        include: {
          schedule: true,
        },
      },
    },
  });
  return getDoctor;
};

const getAiSuggestions = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Symptoms is required");
  }

  const doctors = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  console.log(doctors);

  // Convert doctors to a cleaner structure for the AI
  const doctorData = doctors.map((doc) => ({
    name: doc.name,
    experience: doc.experience,
    specialties: doc.doctorSpecialties.map((s) => s.specialities),
  }));

  // Build the AI prompt
  // Simplify doctor data before sending to the model
  const doctorList = doctors.map((doc) => ({
    id: doc.id,
    name: doc.name,
    experience: doc.experience,
    specialties: doc.doctorSpecialties.map((s) => s.specialities),
  }));

  console.log("doctor data loaded \n");
  const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptoms}

Here is the doctor list (in JSON):
${JSON.stringify(doctorList, null, 2)}

Return your response in pure JSON format with full individual doctor data.

`;

  console.log("analyzing... \n");
  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:free",
    messages: [
      { role: "system", content: "You are a helpful AI medical assistant..." },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const result = await extractJsonFromMessage(completion.choices[0].message);
  console.log(completion.choices[0].message);
  return result;
};

export const DoctorService = {
  getAllDoctors,
  updateDoctor,
  getAiSuggestions,
  getDoctorById,
};
