import { Hono } from "hono";
import { meRoute } from "./me";
import { searchRoute } from "./search";

export const usersRoute = new Hono();

usersRoute.route("/me", meRoute);
usersRoute.route("/search", searchRoute);
