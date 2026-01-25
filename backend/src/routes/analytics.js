const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

/**
 * @swagger
 * /api/analytics/pageview:
 *   post:
 *     summary: Record a page view analytics event
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [path]
 *             properties:
 *               path:
 *                 type: string
 *               referrer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event recorded
 */
router.post(
  "/pageview",
  [body("path").trim().notEmpty().withMessage("Path is required")],
  validateRequest,
  analyticsController.recordPageView
);

module.exports = router;
