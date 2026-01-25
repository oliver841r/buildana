const express = require("express");
const { body } = require("express-validator");
const upload = require("../middleware/upload");
const validateRequest = require("../middleware/validateRequest");
const postsController = require("../controllers/postsController");

const router = express.Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, body, authorId]
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               authorId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created
 */
router.post(
  "/",
  upload.single("image"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("body").trim().notEmpty().withMessage("Body is required"),
    body("authorId").isInt().withMessage("Author ID must be an integer"),
  ],
  validateRequest,
  postsController.createPost
);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve posts with pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated posts
 */
router.get("/", postsController.getPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Retrieve a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Post detail
 *       404:
 *         description: Post not found
 */
router.get("/:id", postsController.getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated
 */
router.put(
  "/:id",
  upload.single("image"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("body").trim().notEmpty().withMessage("Body is required"),
  ],
  validateRequest,
  postsController.updatePost
);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Post deleted
 */
router.delete("/:id", postsController.deletePost);

module.exports = router;
