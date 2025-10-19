import { prisma } from "../../../utlis/prisma";
import { IUser } from "../User/user.interface";

const createDoctorSchedule = async (
  user: IUser,
  payload: { scheduleids: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  // console.log(doctorData);

  const doctorScheduleData = payload.scheduleids.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  console.log(doctorScheduleData);
  return await prisma.doctorSchedules.createMany({ data: doctorScheduleData });

  // return result;
};

export const DoctorScheduleService = {
  createDoctorSchedule,
};
