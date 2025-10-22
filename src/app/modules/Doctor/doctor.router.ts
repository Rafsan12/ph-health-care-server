import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllDoctors);
router.patch("/:id", DoctorController.updateDoctor);

export const DoctorRouter = router;
