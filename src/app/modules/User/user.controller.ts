import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { UserService } from "./user.service";

const create_Patient = catchAsync(async (req: Request, res: Response) => {
  // console.log("Patient:", req.body);
  const createPatient = await UserService.create_Patient(req);
  // console.log(createPatient);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient created Successfully",
    data: createPatient,
  });
});

export const UserController = {
  create_Patient,
};
