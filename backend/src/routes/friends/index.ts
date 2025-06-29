import { Hono } from "hono";
import { db, schema } from "../../db";
import { eq } from "drizzle-orm";
import { friendRoute } from "./[friendId]";
import { requestsRoute } from "./requests";

export const friendsRoute = new Hono();

friendsRoute.route("/:friendId", friendRoute);
friendsRoute.route("/requests", requestsRoute);

friendsRoute.get("/", async (c) => {
    const { id } = c.get("jwtPayload");

    const friends = await db.query.friends.findMany({
        where: eq(schema.friends.userId, id),
        with: {
            friend: {
                columns: {
                    email: false,
                    password: false,
                },
            },
        },
        columns: {
            userId: false,
            friendId: false,
        },
    });

    return c.json({ success: true, data: { friends } }, 200);
});
