import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../utlis/prisma";
import { calculatePagination, TOption } from "../../helper/pagationHelper";
import { stripe } from "../../helper/stripe";
import ApiError from "../../middlewares/ApiError";
import { IUser } from "../User/user.interface";

const createAppointment = async (
  user: IUser,
  payload: { doctorId: string; scheduleId: string }
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const isBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooking: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (appointment) => {
    const appointmentData = await appointment.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await appointment.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooking: true,
      },
    });

    const transactionId = uuidv4();

    await appointment.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Consultation with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: patientData.id,
      },
      success_url: `https://web.programming-hero.com/home`,
      cancel_url: `https://next.programming-hero.com/`,
    });

    // console.log(session);
    return { paymentUrl: session.url };
  });

  return result;

  // console.log({
  //   patientId: patientData.id,
  //   doctorId: doctorData.id,
  //   scheduleId: payload.scheduleId,
  //   videoCallingId,
  // });
};

const getMyAppointment = async (user: IUser, filters: any, option: TOption) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(option);
  const { ...filterData } = filters;

  const andCondition: Prisma.AppointmentWhereInput[] = [];
  console.log(user);

  if (user.role === UserRole.PATIENT) {
    andCondition.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    const doctor = await prisma.doctor.findUnique({
      where: { email: user.email },
    });
    if (!doctor) throw new Error("Doctor not found");
    andCondition.push({ doctorId: doctor.id });
  }

  if (Object.keys(filterData).length > 0) {
    const filterCondition = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));

    andCondition.push(...filterCondition);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};
  console.log(whereConditions);

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:
      user.role === UserRole.DOCTOR ? { patient: true } : { doctor: true },
  });

  console.log(result);

  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      limit,
      page,
    },
    data: result,
  };
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IUser
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "This is not your appointment"
      );
    }

    return await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status,
      },
    });
  }
};

export const AppointmentService = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
};
