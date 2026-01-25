const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const commentsController = require("../controllers/commentsController");

const router = express.Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId, userId, content]
 *             properties:
 *               postId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post(
  "/",
  [
    body("postId").isInt().withMessage("Post ID must be an integer"),
    body("userId").isInt().withMessage("User ID must be an integer"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  validateRequest,
  commentsController.addComment
);

/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     summary: Retrieve comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment list
 */
router.get("/:postId", commentsController.getCommentsByPost);

module.exports = router;
