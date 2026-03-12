# 星火园帮项目上传到 GitHub 步骤

## 一、上传前自检

1. **敏感信息**：确认 `星火园帮后台管理系统/.env` 里没有把真实密码、API 密钥提交上去。  
   - 若已存在且含敏感信息，建议先删除该文件中的敏感内容，或把 `.env` 加入 `.gitignore` 后从暂存区移除：  
     `git rm --cached 星火园帮后台管理系统/.env`
2. **.gitignore 已更新**：当前已忽略 `node_modules`、`.env`、`dist` 等，三个项目目录会被正常提交。

---

## 二、在 GitHub 上创建仓库

1. 打开 [https://github.com/new](https://github.com/new)
2. **Repository name**：例如 `xinghuo-yuanbang` 或 `星火园帮`
3. **Description**（可选）：大学生互助服务平台
4. 选择 **Public**
5. **不要**勾选 “Add a README file” 或 “Add .gitignore”（本地已有）
6. 点击 **Create repository**

---

## 三、在本机执行命令

在项目根目录（`test` 或你放星火园帮的文件夹）打开终端，依次执行：

```bash
# 1. 进入项目目录（请改成你的实际路径）
cd d:\Document\test\test

# 2. 若之前有提交过，先取消之前的暂存，让新 .gitignore 生效
git reset

# 3. 添加所有文件（.gitignore 会自动排除 node_modules、.env 等）
git add .

# 4. 首次提交
git commit -m "feat: 星火园帮项目初版 - 后台/前端/网页/小程序"

# 5. 添加远程仓库（把 YOUR_USERNAME 和 YOUR_REPO 换成你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 6. 推送到 main 分支
git branch -M main
git push -u origin main
```

若仓库已存在且已有 `origin`，可先删除再添加：

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 四、使用 SSH（可选）

若已配置 SSH 密钥，可把远程地址改为：

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
```

---

## 五、常见问题

- **推送被拒绝**：若 GitHub 上已有 README 等提交，先执行 `git pull origin main --rebase` 再 `git push`。
- **.env 已被提交过**：按上面“上传前自检”用 `git rm --cached` 移除后重新 commit，再 push。之后务必不要把 `.env` 里的真实密钥写进仓库。
