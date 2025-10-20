import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";
import { prisma } from "../../../utlis/prisma";
import { generateToken } from "../../helper/jwtToken";
import ApiError from "../../middlewares/ApiError";

const login = async (payload: { email: string; password: string }) => {
  //   console.log(payload);
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email, status: UserStatus.ACTIVE },
  });

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is Incorrect");
  }

  const accessToken = await generateToken(
    { email: user.email, role: user.role },
    config.ACCESS_TOKEN,
    "1d"
  );

  const refreshToken = await generateToken(
    { email: user.email, role: user.role },
    config.ACCESS_TOKEN,
    "30d"
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  login,
};
