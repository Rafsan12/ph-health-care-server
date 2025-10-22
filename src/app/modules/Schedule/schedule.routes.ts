import { UserRole } from "@prisma/client";
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { ScheduleController } from "./schedule.controller";

const router = Router();

router.post("/", auth(UserRole.ADMIN), ScheduleController.insertInDB);
router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.ADMIN),
  ScheduleController.scheduleForDoctor
);
router.delete("/:id", auth(UserRole.ADMIN), ScheduleController.deleteSchedule);

export const ScheduleRouter = router;
