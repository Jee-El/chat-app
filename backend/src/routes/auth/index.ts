import { Hono } from "hono";
import { signupRoute } from "./signup";
import { loginRoute } from "./login";


export const authRoutes = new Hono()

authRoutes.route("/signup", signupRoute)
authRoutes.route("/login", loginRoute)