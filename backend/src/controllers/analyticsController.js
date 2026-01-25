const db = require("../db");

const recordPageView = async (req, res, next) => {
  try {
    const { path, referrer } = req.body;
    await db.query(
      "INSERT INTO analytics_events (event_type, path, referrer, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)",
      ["pageview", path, referrer || null, req.headers["user-agent"], req.ip]
    );
    res.status(201).json({ status: "recorded" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordPageView,
};
