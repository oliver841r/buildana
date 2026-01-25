const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

jest.mock("../src/db", () => ({
  query: jest.fn(),
}));

describe("Comments API", () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  it("adds a comment", async () => {
    db.query
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValueOnce([{ id: 1, content: "Nice" }])
      .mockResolvedValueOnce([{ title: "Post", author_email: null }]);

    const response = await request(app).post("/api/comments").send({
      postId: 1,
      userId: 2,
      content: "Nice",
    });

    expect(response.status).toBe(201);
    expect(response.body.content).toBe("Nice");
  });

  it("gets comments for a post", async () => {
    db.query.mockResolvedValueOnce([{ id: 1, content: "Nice" }]);

    const response = await request(app).get("/api/comments/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
