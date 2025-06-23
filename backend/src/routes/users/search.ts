import { Hono } from "hono";
import { db, schema } from "../../db";
import { ilike, sql } from "drizzle-orm";

export const searchRoute = new Hono();
searchRoute.get("/", async (c) => {
    const usernameQuery = c.req.query("q");

    const searchResults = await db
        .select(schema.publicUserSelect)
        .from(schema.users)
        .where(ilike(schema.users.username, `%${usernameQuery}`))
        .orderBy(sql`LENGTH(${schema.users.username})`)
        .limit(6);

    return c.json(searchResults, 200);
});
