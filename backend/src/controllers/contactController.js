const db = require("../db");
const { sendEmail } = require("../utils/mailer");

const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, postcode, intent, message } = req.body;
    const result = await db.query(
      "INSERT INTO contact_messages (name, email, phone, postcode, intent, message) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, postcode, intent, message]
    );

    await sendEmail({
      to: process.env.CONTACT_EMAIL || "admin@buildana.com.au",
      subject: "New Buildana contact form submission",
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Postcode: ${postcode}</p><p>Intent: ${intent}</p><p>Message: ${message}</p>`,
    });

    res.status(201).json({ id: result.insertId, status: "received" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitContact,
};
