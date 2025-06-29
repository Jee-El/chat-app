import { Hono } from "hono";
import { db, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { requestRoute } from "./[requestId]";

export const requestsRoute = new Hono();

requestsRoute.route("/:requestId", requestRoute);

requestsRoute.get("/sent", async (c) => {
    const { id } = c.get("jwtPayload");

    const sentFriendRequests = await db.query.friendRequests.findMany(
        {
            where: eq(schema.friendRequests.senderId, id),
            with: {
                receiver: {
                    columns: {
                        email: false,
                        password: false,
                        lastSeen: false,
                        about: false,
                        createdAt: false,
                    },
                },
            },
            columns: {
                senderId: false,
                receiverId: false,
            },
        }
    );

    return c.json({ success: true, data: {sentFriendRequests} }, 200);
});

requestsRoute.get("/received", async (c) => {
    const { id } = c.get("jwtPayload");

    const receivedFriendRequests =
        await db.query.friendRequests.findMany({
            where: eq(schema.friendRequests.receiverId, id),
            with: {
                sender: {
                    columns: {
                        email: false,
                        password: false,
                        lastSeen: false,
                        about: false,
                        createdAt: false,
                    },
                },
            },
            columns: {
                senderId: false,
                receiverId: false,
            },
        });

    return c.json(
        { success: true, data: { receivedFriendRequests } },
        200
    );
});
