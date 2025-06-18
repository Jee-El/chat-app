import { Hono } from "hono";
import { meRoute } from "./me";

export const usersRoute = new Hono();

usersRoute.route("/me", meRoute);
