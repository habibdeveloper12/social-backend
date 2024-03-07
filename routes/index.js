import express from "express";
const router = express.Router();
import { socialController } from "../controllers/index.js";

router.post("/user", socialController.postUser);
router.patch("/user/:id", socialController.updateUser);
router.get("/user/:id", socialController.getUserById);
router.get("/user", socialController.getAllUser);
router.delete("/user/:id", socialController.deleteUser);
// ---------------------------------------

router.post("/post/:id/unlike", socialController.unlike);
router.post("/post/:id/like", socialController.addLike);
router.post("/post", socialController.postPost);
router.put("/post/:id", socialController.updatePost);
router.get("/post", socialController.getAllPost);
router.get("/post/top", socialController.topLike);
router.get("/post/:id", socialController.getAllPostById);
router.delete("/post/:id", socialController.deletePost);
// *****************
router.post("/comment", socialController.createComment);
router.put("/comment/:id", socialController.updateComment);
router.delete("/comment/:id", socialController.deleteComment);
router.get("/comment/:id", socialController.getCommentsForPost);

export default router;
