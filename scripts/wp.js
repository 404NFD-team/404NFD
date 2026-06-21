const writeups = [
  {
    id: "2026-april-union",
    kind: "collection",
    title: "4 月高校联合训练赛 WP 总览",
    event: "4 月高校联合训练赛",
    year: "2026",
    category: "比赛合集",
    author: "404NFD",
    summary: "比赛题解入口，按作者归档整理。",
    href: "wp/2026-4月高校联合训练赛/index.md",
    tags: ["复盘", "索引"],
  },
  {
    id: "2026-april-union-boxing",
    kind: "writeup",
    title: "Boxing Writeup",
    event: "4 月高校联合训练赛",
    year: "2026",
    category: "Misc / Reverse / Hardware",
    author: "Boxing",
    summary: "包含 Forensics、Hardware、Reverse 等方向题目记录。",
    href: "wp/2026-4月高校联合训练赛/boxing.md",
    tags: ["Forensics", "Reverse", "Hardware"],
  },
];

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function isExternalHref(href) {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

function getSiteRootPrefix() {
  return window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? "../" : "";
}

function getReaderPath() {
  return window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? "wp-view.html" : "pages/wp-view.html";
}

function normalizePath(path) {
  const parts = [];

  String(path || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .forEach((part) => {
      if (!part || part === ".") return;
      if (part === "..") {
        parts.pop();
        return;
      }
      parts.push(part);
    });

  return parts.join("/");
}

function resolveMarkdownDoc(href) {
  const target = String(href || "").trim();
  if (!target || isExternalHref(target) || target.startsWith("#")) return target;

  let nextPath = target.split("#")[0].split("?")[0];

  if (nextPath.startsWith("/writeups/")) {
    nextPath = nextPath.replace(/^\/writeups\//, "wp/");
  } else if (nextPath.startsWith("/wp/")) {
    nextPath = nextPath.slice(1);
  } else if (!nextPath.startsWith("wp/")) {
    const currentDoc = new URLSearchParams(window.location.search).get("doc") || "";
    const basePath = currentDoc.includes("/") ? currentDoc.slice(0, currentDoc.lastIndexOf("/") + 1) : "";
    nextPath = `${basePath}${nextPath}`;
  }

  return normalizePath(nextPath);
}

function getFetchPath(doc) {
  if (isExternalHref(doc)) return doc;
  return `${getSiteRootPrefix()}${normalizePath(doc)}`;
}

function getAssetPath(href) {
  if (isExternalHref(href) || href.startsWith("#")) return href;
  return getFetchPath(resolveMarkdownDoc(href));
}

function getViewUrl(item) {
  return `${getReaderPath()}?doc=${encodeURIComponent(item.href)}&id=${encodeURIComponent(item.id)}`;
}

function renderSummary() {
  const container = document.querySelector("#wpSummary");
  if (!container) return;

  const collections = writeups.filter((item) => item.kind === "collection");
  const articles = writeups.filter((item) => item.kind !== "collection");

  container.innerHTML = `
    <span class="wp-label">ARCHIVE STATUS</span>
    <h2>${articles.length} 篇题解</h2>
    <div class="wp-stats">
      <span>${collections.length} 个合集</span>
      <span>${new Set(writeups.map((item) => item.year)).size} 年份</span>
      <span>${new Set(writeups.flatMap((item) => item.tags || [])).size} 标签</span>
    </div>
    <p>把每一次比赛和训练的解题过程沉淀下来，方便复盘、检索和新人补课。</p>
  `;
}

function renderWriteupGroup(selector, items) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<p class="member-empty">WP 存档整理中。</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="wp-card">
          <div class="wp-card-top">
            <span>${escapeHTML(item.year)}</span>
            <strong>${escapeHTML(item.category)}</strong>
          </div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.summary)}</p>
          <div class="wp-meta">
            <span>${escapeHTML(item.event)}</span>
            <span>${escapeHTML(item.author)}</span>
          </div>
          <div class="member-tags">
            ${(item.tags || []).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}
          </div>
          <a class="event-link" href="${escapeHTML(getViewUrl(item))}">READ -></a>
        </article>
      `,
    )
    .join("");
}

function renderWriteups() {
  renderWriteupGroup("#wpCollections", writeups.filter((item) => item.kind === "collection"));
  renderWriteupGroup("#wpArticles", writeups.filter((item) => item.kind !== "collection"));
}

function inlineMarkdown(value) {
  return escapeHTML(value)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, href) => {
      const normalized = getAssetPath(href);
      return `<img src="${escapeHTML(normalized)}" alt="${escapeHTML(alt)}" loading="lazy" />`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const normalized = normalizeMarkdownHref(href);
      return `<a href="${escapeHTML(normalized)}">${label}</a>`;
    });
}

function normalizeMarkdownHref(href) {
  if (isExternalHref(href) || href.startsWith("#")) return href;

  const [pathPart, hash = ""] = href.split("#");
  if (pathPart.split("?")[0].endsWith(".md")) {
    const normalized = resolveMarkdownDoc(href);
    const hashSuffix = hash ? `#${encodeURIComponent(hash)}` : "";
    return `${getReaderPath()}?doc=${encodeURIComponent(normalized)}${hashSuffix}`;
  }

  return href;
}

function markdownToHTML(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listOpen = false;
  let quoteOpen = false;
  let codeOpen = false;
  let codeLines = [];

  function closeParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!listOpen) return;
    html.push("</ul>");
    listOpen = false;
  }

  function closeQuote() {
    if (!quoteOpen) return;
    html.push("</blockquote>");
    quoteOpen = false;
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (codeOpen) {
        html.push(`<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`);
        codeOpen = false;
        codeLines = [];
      } else {
        closeParagraph();
        closeList();
        closeQuote();
        codeOpen = true;
      }
      continue;
    }

    if (codeOpen) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeList();
      closeQuote();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      closeQuote();
      const level = Math.min(heading[1].length + 1, 5);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const list = trimmed.match(/^[-*]\s+(.+)$/);
    if (list) {
      closeParagraph();
      closeQuote();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(list[1])}</li>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      closeParagraph();
      closeQuote();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    const quote = trimmed.match(/^>\s*(.+)$/);
    if (quote) {
      closeParagraph();
      closeList();
      if (!quoteOpen) {
        html.push("<blockquote>");
        quoteOpen = true;
      }
      html.push(`<p>${inlineMarkdown(quote[1])}</p>`);
      continue;
    }

    closeList();
    closeQuote();
    paragraph.push(trimmed);
  }

  closeParagraph();
  closeList();
  closeQuote();

  if (codeOpen) {
    html.push(`<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("");
}

async function renderWriteupReader() {
  const article = document.querySelector("#wpArticle");
  if (!article) return;

  const params = new URLSearchParams(window.location.search);
  const doc = resolveMarkdownDoc(params.get("doc"));
  const current = writeups.find((item) => item.href === doc || item.id === params.get("id"));

  if (!doc) {
    article.innerHTML = '<p class="member-empty">没有指定要打开的 WP。</p>';
    return;
  }

  if (current) {
    const title = document.querySelector("#wpReaderTitle");
    const meta = document.querySelector("#wpReaderMeta");
    if (title) title.textContent = current.title;
    if (meta) {
      meta.innerHTML = `
        <span>${escapeHTML(current.year)}</span>
        <span>${escapeHTML(current.event)}</span>
        <span>${escapeHTML(current.author)}</span>
      `;
    }
  }

  try {
    const response = await fetch(getFetchPath(doc));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    article.innerHTML = markdownToHTML(markdown);
  } catch (error) {
    article.innerHTML = `
      <p class="member-empty">WP 读取失败：${escapeHTML(error.message)}。请确认 Markdown 路径存在，并通过本地服务或 GitHub Pages 访问。</p>
    `;
  }
}

function bootWriteups() {
  renderSummary();
  renderWriteups();
  renderWriteupReader();
}

bootWriteups();
