import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { pick } from "../../helper/pick";
import { IUser } from "../User/user.interface";
import { ScheduleService } from "./schedule.service";

const insertInDB = catchAsync(async (req: Request, res: Response) => {
  const createSchedule = await ScheduleService.insertInDB(req.body);
  // console.log(createSchedule);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created Successfully",
    data: createSchedule,
  });
});

const scheduleForDoctor = catchAsync(
  async (req: Request & { user?: IUser }, res: Response) => {
    const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = pick(req.query, ["startDateTime", "endDateTime"]);
    const user = req.user;

    const result = await ScheduleService.scheduleForDoctor(
      user as IUser,
      filters,
      option
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedule fetch Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await ScheduleService.deleteSchedule(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule Deleted Successfully",
    data: result,
  });
});

export const ScheduleController = {
  insertInDB,
  scheduleForDoctor,
  deleteSchedule,
};
