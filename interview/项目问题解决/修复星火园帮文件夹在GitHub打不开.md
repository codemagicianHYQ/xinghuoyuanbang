# 为什么「星火园帮」文件夹在 GitHub 打不开？

## 原因

「星火园帮」目录里**自带了一个 `.git` 文件夹**，所以整个目录被当成 **Git 子模块（submodule）**。  
父仓库只存了一个“指向某个提交”的引用，不会存里面的具体文件，所以在 GitHub 上无法像「星火园帮前端UI」等普通文件夹那样点进去浏览。

## 解决步骤（让星火园帮变成普通文件夹）

在 **PowerShell** 或 **命令提示符** 里，进入项目根目录后按顺序执行：

```powershell
cd D:\Document\test\test

# 1. 删除「星火园帮」内部的 .git，使其变为普通目录（不影响你本地文件）
Remove-Item -Recurse -Force "星火园帮\.git"

# 2. 从当前仓库里删掉对「星火园帮」的子模块引用（若存在）
git rm --cached "星火园帮" -f 2>$null; $?

# 3. 把「星火园帮」当作普通目录重新加入（会排除 .gitignore 里的 unpackage、node_modules 等）
git add "星火园帮/"

# 4. 提交
git commit -m "fix: 将星火园帮作为普通目录纳入仓库，修复 GitHub 无法打开该文件夹"

# 5. 推送
git push origin main
```

若第 2 步报错说 `星火园帮` 不存在或不是 submodule，可忽略，直接做 3、4、5 步。

## 完成后

推送成功后，在 GitHub 上刷新仓库，「星火园帮」会像另外三个文件夹一样，可以正常点开并浏览里面的文件。

## 注意

- 删除的是 **星火园帮\.git**，不会动你的源码（pages、components、App.vue 等）。
- 若你希望「星火园帮」单独一个 Git 仓库，可以之后在 GitHub 再建一个空仓库，在「星火园帮」目录里重新 `git init` 并单独推送；当前步骤是让大仓库里能正常打开这个文件夹。
