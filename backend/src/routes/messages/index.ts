import { Hono } from "hono";
import { messageRoute } from "./[messageId]";

export const messagesRoute = new Hono();

messagesRoute.route("/:messageId", messageRoute);
