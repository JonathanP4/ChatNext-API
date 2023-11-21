import { Router } from "express";
import * as chatControllers from "../controllers/chat";
import isAuth from "../middleware/isAuth";

const router = Router();

router.get("/users", isAuth, chatControllers.getUsers);
router.get("/user/:userId", isAuth, chatControllers.getUser);
router.get("/messages/:userId", isAuth, chatControllers.getMessages);

router.post("/send", isAuth, chatControllers.getUsers);
router.post("/message", isAuth, chatControllers.postMessage);

router.post("/user/update/:userId", isAuth, chatControllers.updateProfile);

export default router;
