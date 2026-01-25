const db = require("../db");
const { sendEmail } = require("../utils/mailer");

const addComment = async (req, res, next) => {
  try {
    const { postId, userId, content } = req.body;
    const result = await db.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [postId, userId, content]
    );

    const [comment] = await db.query(
      "SELECT comments.*, users.name AS author_name FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE comments.id = ?",
      [result.insertId]
    );

    const [post] = await db.query(
      "SELECT posts.title, users.email AS author_email FROM posts LEFT JOIN users ON posts.author_id = users.id WHERE posts.id = ?",
      [postId]
    );

    if (post && post.author_email) {
      await sendEmail({
        to: post.author_email,
        subject: `New comment on ${post.title}`,
        html: `<p>A new comment was added to "${post.title}".</p><p>${content}</p>`,
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

const getCommentsByPost = async (req, res, next) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    let rows;
    if (search) {
      rows = await db.query(
        "SELECT comments.*, users.name AS author_name FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? AND comments.content LIKE ? ORDER BY comments.created_at DESC",
        [req.params.postId, search]
      );
    } else {
      rows = await db.query(
        "SELECT comments.*, users.name AS author_name FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at DESC",
        [req.params.postId]
      );
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
};
