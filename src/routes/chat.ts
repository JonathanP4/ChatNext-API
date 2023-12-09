import { Router } from "express";
import * as chatControllers from "../controllers/chat";
import isAuth from "../middleware/isAuth";

const router = Router();

router.get("/users", isAuth, chatControllers.getUsers);

router.post("/messages", isAuth, chatControllers.getMessages);

export default router;
