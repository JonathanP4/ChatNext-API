import { Router } from "express";
import * as chatControllers from "../controllers/chat";
import isAuth from "../middleware/isAuth";

const router = Router();

router.get("/users", isAuth, chatControllers.getUsers);

router.post("/messages", isAuth, chatControllers.getMessages);
router.post("/check-link", isAuth, chatControllers.checkLink);
router.post("/trust-link", isAuth, chatControllers.saveTrustedLink);

export default router;
