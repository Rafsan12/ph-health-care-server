import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../helper/fileUpload";
import { auth } from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.get("/", auth(UserRole.ADMIN), UserController.getAll);

router.post(
  "/create_patient",
  upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createPatientValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.create_Patient(req, res, next);
  }
);
router.post(
  "/create_doctor",
  auth(UserRole.ADMIN),
  upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.create_Doctor(req, res, next);
  }
);
router.post(
  "/create_admin",
  auth(UserRole.ADMIN),
  upload.single("file"),

  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.create_Admin(req, res, next);
  }
);
export const UserRouter = router;
