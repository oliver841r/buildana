const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

jest.mock("../src/db", () => ({
  query: jest.fn(),
}));

const mockPost = {
  id: 1,
  title: "Hello",
  body: "World",
  author_id: 2,
};

describe("Posts API", () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  it("creates a post", async () => {
    db.query
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValueOnce([mockPost]);

    const response = await request(app)
      .post("/api/posts")
      .field("title", "Hello")
      .field("body", "World")
      .field("authorId", "2");

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Hello");
  });

  it("returns paginated posts", async () => {
    db.query.mockResolvedValueOnce([mockPost]).mockResolvedValueOnce([{ total: 1 }]);

    const response = await request(app).get("/api/posts");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
