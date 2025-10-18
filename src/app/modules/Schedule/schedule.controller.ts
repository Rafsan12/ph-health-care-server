import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { ScheduleService } from "./schedule.service";

const insertInDB = catchAsync(async (req: Request, res: Response) => {
  const createSchedule = await ScheduleService.insertInDB(req.body);
  console.log(createSchedule);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule Created Successfully",
    data: createSchedule,
  });
});

export const ScheduleController = {
  insertInDB,
};
