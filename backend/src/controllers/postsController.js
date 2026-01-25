const db = require("../db");
const { sendEmail } = require("../utils/mailer");

const createPost = async (req, res, next) => {
  try {
    const { title, body, authorId } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await db.query(
      "INSERT INTO posts (title, body, author_id, image_path) VALUES (?, ?, ?, ?)",
      [title, body, authorId, imagePath]
    );
    const post = await db.query("SELECT * FROM posts WHERE id = ?", [result.insertId]);
    res.status(201).json(post[0]);
  } catch (err) {
    next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let rows;
    if (search) {
      rows = await db.query(
        "SELECT posts.*, users.name AS author_name FROM posts LEFT JOIN users ON posts.author_id = users.id WHERE posts.title LIKE ? OR posts.body LIKE ? ORDER BY posts.created_at DESC LIMIT ? OFFSET ?",
        [search, search, limit, offset]
      );
    } else {
      rows = await db.query(
        "SELECT posts.*, users.name AS author_name FROM posts LEFT JOIN users ON posts.author_id = users.id ORDER BY posts.created_at DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
    }

    const totalRows = await db.query("SELECT COUNT(*) AS total FROM posts");
    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: totalRows[0].total,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const [post] = await db.query(
      "SELECT posts.*, users.name AS author_name FROM posts LEFT JOIN users ON posts.author_id = users.id WHERE posts.id = ?",
      [req.params.id]
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const existing = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
    if (!existing[0]) {
      return res.status(404).json({ error: "Post not found" });
    }

    await db.query(
      "UPDATE posts SET title = ?, body = ?, image_path = COALESCE(?, image_path) WHERE id = ?",
      [title, body, imagePath, req.params.id]
    );

    const [post] = await db.query(
      "SELECT posts.*, users.email AS author_email FROM posts LEFT JOIN users ON posts.author_id = users.id WHERE posts.id = ?",
      [req.params.id]
    );

    if (post && post.author_email) {
      await sendEmail({
        to: post.author_email,
        subject: "Your post was updated",
        html: `<p>Your post "${post.title}" has been updated.</p>`,
      });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const existing = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
    if (!existing[0]) {
      return res.status(404).json({ error: "Post not found" });
    }
    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
