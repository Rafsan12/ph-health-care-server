import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { IUser } from "../User/user.interface";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: IUser }, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorSchedule(
      user as IUser,
      req.body
    );

    // console.log(result);
    sendResponse(res, {
      statusCode: 201,
      message: "Doctor Schedule Created Successfully",
      success: true,
      data: result,
    });
  }
);

export const DoctorScheduleController = {
  createDoctorSchedule,
};
