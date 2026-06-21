const members = [
  {
    name: "工一阵",
    role: "店长",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=3750387410&s=640",
    url: "https://gong-yie.github.io",
    bio: "奶粉店店长，会一点点 Web 和 Misc，努力学习中。真的没有咕咕咕。",
    tags: ["Web", "Misc"],
  },
  {
    name: "诸清羽",
    role: "保安",
    avatar: "https://autyui.github.io/img/theYellow.jpg",
    url: "https://autyui.github.io",
    bio: "奶粉店保安，Pwn 手。",
    tags: ["Pwn"],
  },
  {
    name: "Rhomin",
    role: "杂食理货员",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=1745536485&s=640",
    bio: "奶粉店杂食理货员，Web + Misc 手。",
    tags: ["Web", "Misc"],
  },
  {
    name: "Ria_VT",
    role: "偷吃手",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=1353122676&s=640",
    bio: "奶粉店偷吃手，Misc 脚。",
    tags: ["Misc"],
  },
  {
    name: "Boxing",
    role: "魂殿殿长",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=3569106840&s=640",
    bio: "奶粉店魂殿殿长，Reverse + Misc。",
    tags: ["Reverse", "Misc"],
  },
  {
    name: "Hykon",
    role: "训练中",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=2540830127&s=640",
    bio: "有一种只需要努力而不需要天赋的方法……",
    tags: ["CTF"],
  },
  {
    name: "chen11qaq",
    role: "队员",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=3033488776&s=640",
    bio: "人见人爱，花见花开，车见车爆胎。",
    tags: ["CTF"],
  },
  {
    name: "web小手子",
    role: "Web 手",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=3673140049&s=640",
    bio: "当你在 CTF 上无脑开环境传附件的时候，有没有想过几年前你的梦想是成为手撕代码挖掘 0day 漏洞的安全研究员。",
    tags: ["Web"],
  },
  {
    name: "Flashzin0",
    role: "喵喵拳击手",
    avatar: "https://q1.qlogo.cn/g?b=qq&nk=3024264633&s=640",
    bio: "奶粉店喵喵拳击手，叫我闪电就好 ovo*。",
    tags: ["CTF"],
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

function renderMemberCard(member) {
  const tagName = member.url ? "a" : "article";
  const href = member.url ? ` href="${escapeHTML(member.url)}" target="_blank" rel="noopener"` : "";
  const tags = (member.tags || []).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  const fallback = escapeHTML(member.name.slice(0, 1).toUpperCase());

  return `
    <${tagName} class="member-card"${href}>
      <div class="avatar-frame">
        <span class="avatar-fallback">${fallback}</span>
        <img src="${escapeHTML(member.avatar)}" alt="${escapeHTML(member.name)} 头像" loading="lazy" referrerpolicy="no-referrer" />
      </div>
      <div class="member-body">
        <div class="member-topline">
          <h3 class="member-name">${escapeHTML(member.name)}</h3>
          <span class="member-role">${escapeHTML(member.role)}</span>
        </div>
        <p class="member-bio">${escapeHTML(member.bio)}</p>
        <div class="member-tags">${tags}</div>
        ${member.url ? '<span class="member-more">OPEN PROFILE -></span>' : ""}
      </div>
    </${tagName}>
  `;
}

function renderMembers() {
  const grid = document.querySelector("#memberGrid");
  if (!grid) return;

  if (!members.length) {
    grid.innerHTML = '<p class="member-empty">成员资料整理中，欢迎更多同学加入 404NFD。</p>';
    return;
  }

  grid.innerHTML = members.map(renderMemberCard).join("");
}

renderMembers();
