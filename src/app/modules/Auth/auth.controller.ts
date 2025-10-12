import { Request, Response } from "express";
import { catchAsync } from "../../../utlis/catchAsync";
import sendResponse from "../../../utlis/sendResponse";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
  const login = await AuthService.login(req.body);
  const { accessToken, refreshToken, needPasswordChange } = login;

  res.cookie("accessToken", accessToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Login Successfully",
    data: { needPasswordChange },
  });
});

export const AuthController = {
  login,
};
