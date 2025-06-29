import { Hono } from "hono";
import { acceptRequestRoute } from "./accept";
import { declineRequestRoute } from "./decline";
import { cancelRequestRoute } from "./cancel";

export const requestRoute = new Hono();

requestRoute.route("/accept", acceptRequestRoute);
requestRoute.route("/decline", declineRequestRoute);
requestRoute.route("/cancel", cancelRequestRoute);
