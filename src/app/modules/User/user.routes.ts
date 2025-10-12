import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../../helper/fileUpload";
import { UserController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

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
export const UserRouter = router;
