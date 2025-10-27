import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { pick } from "../../helper/pick";
import { doctorFilterableFields } from "./doctor.constant";
import { DoctorService } from "./doctor.service";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filter = pick(req.query, doctorFilterableFields);

  const result = await DoctorService.getAllDoctors(options, filter);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor Fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.updateDoctor(id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Update Successfully",
    data: result,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await DoctorService.getDoctorById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieval successfully",
    data: result,
  });
});

const getAiSuggestions = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getAiSuggestions(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Ai Doctor fetch Successfully",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctors,
  updateDoctor,
  getAiSuggestions,
  getDoctorById,
};
