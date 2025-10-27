import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllDoctors);
router.patch("/:id", DoctorController.updateDoctor);
router.get("/:id", DoctorController.getDoctorById);
router.post("/ai_doctor_suggestions", DoctorController.getAiSuggestions);

export const DoctorRouter = router;
