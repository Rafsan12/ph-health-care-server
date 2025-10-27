import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { pick } from "../../helper/pick";
import { IUser } from "./../User/user.interface";
import { AppointmentService } from "./appoinment.service";

const createAppointment = catchAsync(
  async (req: Request & { user?: IUser }, res: Response) => {
    const user = req.user;
    const result = await AppointmentService.createAppointment(
      user as IUser,
      req.body
    );

    // console.log(result);

    sendResponse(res, {
      statusCode: 200,
      message: "Appointment Create successfully",
      success: true,
      data: result,
    });
  }
);

const getMyAppointment = catchAsync(
  async (req: Request & { user?: IUser }, res: Response) => {
    const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const user = req.user;

    const result = await AppointmentService.getMyAppointment(
      user as IUser,
      filters,
      option
    );
    console.log(result);
    sendResponse(res, {
      statusCode: 200,
      message: "My Appointment fetch successfully",
      success: true,
      data: result,
    });
  }
);

const updateAppointmentStatus = catchAsync(
  async (req: Request & { user?: IUser }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const result = await AppointmentService.updateAppointmentStatus(
      id,
      status,
      user as IUser
    );

    sendResponse(res, {
      statusCode: 200,
      message: "Appointment Update successfully",
      success: true,
      data: result,
    });
  }
);

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
};
