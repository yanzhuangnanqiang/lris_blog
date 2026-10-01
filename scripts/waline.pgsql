-- Waline 评论系统 —— PostgreSQL 建表脚本(给 Supabase 用)
--
-- 用法:Supabase → SQL Editor → New query → 把本文件全部内容粘进去 → Run
-- 成功标志:左侧 Table Editor 出现 wl_Users / wl_Comment / wl_Counter 三张表
--
-- 注意:这是 PostgreSQL 版。网上很多教程给的是 MySQL 版(带反引号、
-- AUTO_INCREMENT、ENGINE=InnoDB),那份在 Supabase 跑不了。

CREATE TABLE IF NOT EXISTS "wl_Users" (
  "id" serial NOT NULL,
  "display_name" varchar(255) NOT NULL DEFAULT '',
  "email" varchar(255) NOT NULL DEFAULT '',
  "password" varchar(255) NOT NULL DEFAULT '',
  "type" varchar(50) NOT NULL DEFAULT '',
  "label" varchar(255) DEFAULT NULL,
  "url" varchar(255) DEFAULT NULL,
  "avatar" text DEFAULT NULL,
  "github" varchar(255) DEFAULT NULL,
  "twitter" varchar(255) DEFAULT NULL,
  "facebook" varchar(255) DEFAULT NULL,
  "google" varchar(255) DEFAULT NULL,
  "weibo" varchar(255) DEFAULT NULL,
  "qq" varchar(255) DEFAULT NULL,
  "oidc" varchar(255) DEFAULT NULL,
  "huawei" varchar(255) DEFAULT NULL,
  "2fa" varchar(32) DEFAULT NULL,
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_email" ON "wl_Users" ("email");
CREATE INDEX IF NOT EXISTS "idx_user_type" ON "wl_Users" ("type");
CREATE INDEX IF NOT EXISTS "idx_user_created_at" ON "wl_Users" ("createdAt");

CREATE TABLE IF NOT EXISTS "wl_Comment" (
  "id" serial NOT NULL,
  "user_id" integer DEFAULT NULL,
  "comment" text,
  "insertedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "ip" varchar(100) DEFAULT '',
  "link" varchar(255) DEFAULT NULL,
  "mail" varchar(255) DEFAULT NULL,
  "nick" varchar(255) DEFAULT NULL,
  "pid" integer DEFAULT NULL,
  "rid" integer DEFAULT NULL,
  "sticky" boolean DEFAULT NULL,
  "status" varchar(50) NOT NULL DEFAULT '',
  "like" integer DEFAULT NULL,
  "ua" text,
  "url" varchar(255) DEFAULT NULL,
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_comment_url" ON "wl_Comment" ("url");
CREATE INDEX IF NOT EXISTS "idx_comment_user_id" ON "wl_Comment" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comment_status" ON "wl_Comment" ("status");
CREATE INDEX IF NOT EXISTS "idx_comment_pid_rid" ON "wl_Comment" ("pid", "rid");
CREATE INDEX IF NOT EXISTS "idx_comment_created_at" ON "wl_Comment" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_comment_updated_at" ON "wl_Comment" ("updatedAt");
CREATE INDEX IF NOT EXISTS "idx_comment_sticky" ON "wl_Comment" ("sticky");

CREATE TABLE IF NOT EXISTS "wl_Counter" (
  "id" serial NOT NULL,
  "time" integer DEFAULT NULL,
  "reaction0" integer DEFAULT NULL,
  "reaction1" integer DEFAULT NULL,
  "reaction2" integer DEFAULT NULL,
  "reaction3" integer DEFAULT NULL,
  "reaction4" integer DEFAULT NULL,
  "reaction5" integer DEFAULT NULL,
  "reaction6" integer DEFAULT NULL,
  "reaction7" integer DEFAULT NULL,
  "reaction8" integer DEFAULT NULL,
  "url" varchar(255) NOT NULL DEFAULT '',
  "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "idx_counter_url" ON "wl_Counter" ("url");
CREATE INDEX IF NOT EXISTS "idx_counter_time" ON "wl_Counter" ("time");
CREATE INDEX IF NOT EXISTS "idx_counter_created_at" ON "wl_Counter" ("createdAt");
