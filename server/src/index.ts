import { Elysia } from "elysia";
import { Database } from "bun:sqlite";

// 连接一个 SQLite 数据库（文件叫 blog.db，不存在会自动建）
const db = new Database("blog.db");

// 建一张表：记录每篇文章的阅读量
db.run(`
  CREATE TABLE IF NOT EXISTS post_views (
    post_id TEXT PRIMARY KEY,
    count   INTEGER NOT NULL DEFAULT 0
  )
`);

// 建一张表：评论（id 自增，post_id 关联文章，name 昵称，content 内容）
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

const app = new Elysia()
  // 健康检查
  .get("/api/ping", () => ({ message: "pong" }))
  // 阅读量 +1，并返回最新值
  .post("/api/posts/:id/views", ({ params }) => {
    const row = db
      .query("SELECT count FROM post_views WHERE post_id = ?")
      .get(params.id) as { count: number } | null;

    let count: number;
    if (row) {
      count = row.count + 1;
      db.run("UPDATE post_views SET count = ? WHERE post_id = ?", [count, params.id]);
    } else {
      count = 1;
      db.run("INSERT INTO post_views (post_id, count) VALUES (?, ?)", [params.id, count]);
    }
    return { post_id: params.id, count };
  })
  // 获取某篇文章的所有评论（新的在前）
  .get("/api/posts/:id/comments", ({ params }) => {
    const comments = db
      .query("SELECT id, name, content, created_at FROM comments WHERE post_id = ? ORDER BY id DESC")
      .all(params.id);
    return { comments };
  })
  // 提交一条评论
  .post("/api/posts/:id/comments", ({ params, body, set }) => {
    const { name, content } = body as { name?: string; content?: string };
    if (!name?.trim() || !content?.trim()) {
      set.status = 400;
      return { error: "昵称和内容不能为空" };
    }
    db.run(
      "INSERT INTO comments (post_id, name, content) VALUES (?, ?, ?)",
      [params.id, name.trim(), content.trim()]
    );
    return { ok: true };
  })
  .listen(3000);

console.log("后端跑起来了：http://localhost:3000");
