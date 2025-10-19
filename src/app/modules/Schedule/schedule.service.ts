import { Prisma } from "@prisma/client";
import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../../utlis/prisma";
import { calculatePagination, TOption } from "../../helper/pagationHelper";
import { IUser } from "../User/user.interface";

const insertInDB = async (payload: any) => {
  const { startTime, endTime, startDate, endDate } = payload;

  const intervalTime = 30;
  const schedules = [];

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const scheduleForDoctor = async (
  user: IUser,
  filters: any,
  options: TOption
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { startDateTime: filterStartDateTime, endDateTime: filterEndDateTime } =
    filters;
  console.log("User email:", user.email);

  const andCondition: Prisma.ScheduleWhereInput[] = [];

  if (filterStartDateTime && filterEndDateTime) {
    andCondition.push({
      AND: [
        {
          startDateTime: {
            gte: filterStartDateTime,
          },
        },
        {
          endDateTime: {
            lte: filterEndDateTime,
          },
        },
      ],
    });
  }

  const doctorSchedule = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  // console.log("Doctor schedules:", doctorSchedule);

  const whereConditions: Prisma.ScheduleWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const doctorScheduleIds = doctorSchedule.map(
    (schedule) => schedule.scheduleId
  );

  // console.log(doctorScheduleIds);

  const result = await prisma.schedule.findMany({
    skip,
    take: limit,
    where: { ...whereConditions, id: { notIn: doctorScheduleIds } },
    orderBy: { [sortBy]: sortOrder },
  });
  // console.log(result);

  const total = await prisma.schedule.count({
    where: { ...whereConditions, id: { notIn: doctorScheduleIds } },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const deleteSchedule = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });

  return result;
};

export const ScheduleService = {
  insertInDB,
  scheduleForDoctor,
  deleteSchedule,
};
