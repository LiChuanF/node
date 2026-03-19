import express from "express";
import { prisma } from "../prisma";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ========== User CRUD ==========

// 创建用户
app.post("/users", async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await prisma.user.create({
            data: { email, name },
        });
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 获取所有用户
app.get("/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { posts: true },
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个用户
app.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: { posts: true },
        });
        if (!user) {
            return res.status(404).json({ error: "用户不存在" });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 更新用户
app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name } = req.body;
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { email, name },
        });
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 删除用户
app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ========== Post CRUD ==========

// 创建文章
app.post("/posts", async (req, res) => {
    try {
        const { title, content, authorId, published } = req.body;
        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId,
                published: published || false,
            },
        });
        res.status(201).json(post);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 获取所有文章
app.get("/posts", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: { author: true },
        });
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个文章
app.get("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: { author: true },
        });
        if (!post) {
            return res.status(404).json({ error: "文章不存在" });
        }
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 更新文章
app.put("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, published } = req.body;
        const post = await prisma.post.update({
            where: { id: Number(id) },
            data: { title, content, published },
        });
        res.json(post);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 删除文章
app.delete("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.post.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
