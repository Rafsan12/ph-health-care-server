import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { pick } from "../../helper/pick";
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
const create_Doctor = catchAsync(async (req: Request, res: Response) => {
  const createDoctor = await UserService.create_Doctor(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor created Successfully",
    data: createDoctor,
  });
});
const create_Admin = catchAsync(async (req: Request, res: Response) => {
  const createAdmin = await UserService.create_Admin(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin created Successfully",
    data: createAdmin,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["role", "status", "email", "searchTerm"]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  // const { page, limit, searchTerm, sortBy, sortOrder, role, status } =
  //   req.query;
  const getAllUser = await UserService.getAll(filters, options);
  // const getAllUser = await UserService.getAll({
  //   page: Number(page),
  //   limit: Number(limit),
  //   searchTerm,
  //   sortBy,
  //   sortOrder,
  //   role,
  //   status,
  // });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User retrieve Successfully",
    meta: getAllUser.meta,
    data: getAllUser.data,
  });
});

export const UserController = {
  create_Patient,
  create_Doctor,
  create_Admin,
  getAll,
};
