import { Hono } from "hono";
import type { AppEnv } from "../../types/hono";
import { ok } from "../../lib/response";


const todoRouter = new Hono<AppEnv>();

todoRouter.get("/", ( context ) => {
   return ok(context, {
    name:"belanja pasar"
   }) 
});
todoRouter.get("/detail/:id");
todoRouter.post("/create");
todoRouter.put("/update");
todoRouter.delete("/delete");

export { todoRouter };