import { Router } from "express";
import { AuthRouter } from "../modules/Auth/auth.routes";
import { ScheduleRouter } from "../modules/Schedule/schedule.routes";
import { UserRouter } from "../modules/User/user.routes";

const router = Router();

const moduleRouter = [
  {
    path: "/user",
    route: UserRouter,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/schedule",
    route: ScheduleRouter,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
