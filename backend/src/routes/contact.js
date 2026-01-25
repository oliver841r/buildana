const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const contactController = require("../controllers/contactController");

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, postcode, intent, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               postcode:
 *                 type: string
 *               intent:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message received
 */
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("postcode").trim().notEmpty().withMessage("Postcode is required"),
    body("intent").trim().notEmpty().withMessage("Intent is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validateRequest,
  contactController.submitContact
);

module.exports = router;
