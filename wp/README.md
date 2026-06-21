# WP 存档

这个文件夹用于存放 404NFD 官网的 Writeup Markdown 原文。

建议按年份和比赛建立子目录，例如：

```text
wp/
  2026-4月高校联合训练赛/
    index.md
    boxing.md
  data/
    boxing-writeup/
      page-01-image-01.png
```

新增 Markdown 后，在 `scripts/wp.js` 顶部 `writeups` 数组中添加一条索引数据。
