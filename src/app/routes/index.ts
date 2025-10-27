import { Router } from "express";
import { AppointmentRouter } from "../modules/Appointment/appointemt.routes";
import { AuthRouter } from "../modules/Auth/auth.routes";
import { DoctorScheduleRouter } from "../modules/Doctor-Schedule/doctorSchedule.routes";
import { DoctorRouter } from "../modules/Doctor/doctor.router";
import { PaymentRouter } from "../modules/Payment/payment.router";
import { ScheduleRouter } from "../modules/Schedule/schedule.routes";
import { UserRouter } from "../modules/User/user.routes";
import { SpecialtiesRoutes } from "../modules/specialties/specialties.routes";

const router = Router();

const moduleRouter = [
  {
    path: "/user",
    route: UserRouter,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/schedule",
    route: ScheduleRouter,
  },
  {
    path: "/doctorSchedule",
    route: DoctorScheduleRouter,
  },
  {
    path: "/specialties",
    route: SpecialtiesRoutes,
  },
  {
    path: "/doctor",
    route: DoctorRouter,
  },
  {
    path: "/appointment",
    route: AppointmentRouter,
  },
  {
    path: "/payment",
    route: PaymentRouter,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
