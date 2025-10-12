import { Router } from "express";
import { UserRouter } from "../modules/User/user.routes";

const router = Router();

const moduleRouter = [
  {
    path: "/user",
    route: UserRouter,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
