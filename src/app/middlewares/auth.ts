import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../../config";
import { verifyToken } from "../helper/jwtToken";
import ApiError from "./ApiError";

export const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "you are not authorized");
      }

      const verifyUser = verifyToken(token, config.ACCESS_TOKEN);
      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "you are not authorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
