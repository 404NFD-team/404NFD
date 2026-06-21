const events = [
  {
    title: "安师大CTF校赛",
    date: "敬请期待",
    time: "",
    type: "训练",
    location: "线上",
    description: "面向安徽师范大学的校赛",
    link: "https://qm.qq.com/q/nKADRLbjC8",
  },
  {
    title: "网络空间安全数学基础分享",
    date: "敬请期待",
    time: "",
    type: "分享",
    location: "QQ 群 / 线上",
    description: "进行网络空间安全数学基础分享",
    link: "https://qm.qq.com/q/nKADRLbjC8",
  },
];

const calendarFallbackMonth = "2026-06";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

const unknownDateTexts = new Set(["", "待定", "敬请期待", "未定", "日期待定", "tbd", "unknown"]);
const unknownTimeTexts = new Set(["", "待定", "敬请期待", "未定", "时间待定", "tbd", "unknown"]);

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

function normalizeText(value) {
  return String(value ?? "").trim();
}

function isUnknownDate(value) {
  return unknownDateTexts.has(normalizeText(value).toLowerCase());
}

function isUnknownTime(value) {
  return unknownTimeTexts.has(normalizeText(value).toLowerCase());
}

function parseEventDate(event) {
  if (isUnknownDate(event.date)) return null;

  const time = isUnknownTime(event.time) ? "00:00" : normalizeText(event.time);
  const parsed = new Date(`${normalizeText(event.date)}T${time}:00+08:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatEventDate(event) {
  return event.startsAt ? dateFormatter.format(event.startsAt) : "日期待定";
}

function formatEventTime(event) {
  return isUnknownTime(event.time) ? "时间待定" : normalizeText(event.time);
}

function getDateTimeAttribute(event) {
  if (!event.startsAt) return "";

  const value = isUnknownTime(event.time) ? normalizeText(event.date) : `${normalizeText(event.date)}T${normalizeText(event.time)}`;
  return ` datetime="${escapeHTML(value)}"`;
}

function getEventDateBadge(event) {
  if (!event.startsAt) {
    return {
      day: "TBD",
      month: "待定",
    };
  }

  return {
    day: String(event.startsAt.getDate()).padStart(2, "0"),
    month: event.startsAt.toLocaleDateString("zh-CN", { month: "short" }),
  };
}

function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events
    .map((event) => ({ ...event, startsAt: parseEventDate(event) }))
    .filter((event) => !event.startsAt || event.startsAt >= today)
    .sort((a, b) => {
      if (!a.startsAt && !b.startsAt) return 0;
      if (!a.startsAt) return 1;
      if (!b.startsAt) return -1;
      return a.startsAt - b.startsAt;
    });
}

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - today) / 86400000);
}

function formatCountdown(event) {
  if (!event.startsAt) return "日期待定";

  const dayCount = daysUntil(event.startsAt);
  return dayCount === 0 ? "今天" : `${dayCount} 天后`;
}

function renderNextEvent(upcoming) {
  const container = document.querySelector("#nextEvent");
  if (!container) return;

  const event = upcoming[0];
  if (!event) {
    container.innerHTML = `
      <span class="event-label">NEXT EVENT</span>
      <h2>暂无即将发生的活动</h2>
      <p>新的训练、比赛或分享确定后，会同步更新到这里。</p>
    `;
    return;
  }

  container.innerHTML = `
    <span class="event-label">NEXT EVENT</span>
    <h2>${escapeHTML(event.title)}</h2>
    <div class="event-countdown">${escapeHTML(formatCountdown(event))}</div>
    <p>${escapeHTML(event.description)}</p>
    <div class="event-meta">
      <span>${escapeHTML(formatEventDate(event))}</span>
      <span>${escapeHTML(formatEventTime(event))}</span>
      <span>${escapeHTML(event.location)}</span>
    </div>
    ${event.link ? `<a class="btn primary" href="${escapeHTML(event.link)}" target="_blank" rel="noopener">报名 / 咨询</a>` : ""}
  `;
}

function renderEventList(upcoming) {
  const container = document.querySelector("#eventList");
  if (!container) return;

  if (!upcoming.length) {
    container.innerHTML = '<p class="member-empty">暂无即将发生的活动，欢迎关注 404NFD 后续通知。</p>';
    return;
  }

  container.innerHTML = upcoming
    .map((event) => {
      const badge = getEventDateBadge(event);

      return `
        <article class="event-card">
          <div class="event-date">
            <strong>${escapeHTML(badge.day)}</strong>
            <span>${escapeHTML(badge.month)}</span>
          </div>
          <div class="event-body">
            <div class="event-topline">
              <span>${escapeHTML(event.type)}</span>
              <time${getDateTimeAttribute(event)}>${escapeHTML(formatEventTime(event))}</time>
            </div>
            <h3>${escapeHTML(event.title)}</h3>
            <p>${escapeHTML(event.description)}</p>
            <div class="event-meta">
              <span>${escapeHTML(event.location)}</span>
              <span>${escapeHTML(formatEventDate(event))}</span>
            </div>
          </div>
          ${event.link ? `<a class="event-link" href="${escapeHTML(event.link)}" target="_blank" rel="noopener">JOIN -></a>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderCalendar(upcoming) {
  const monthLabel = document.querySelector("#calendarMonth");
  const grid = document.querySelector("#calendarGrid");
  if (!monthLabel || !grid) return;

  const fallbackDate = new Date(`${calendarFallbackMonth}-01T00:00:00+08:00`);
  const base = upcoming[0]?.startsAt || (Number.isNaN(fallbackDate.getTime()) ? new Date() : fallbackDate);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const eventDays = new Set(
    upcoming
      .filter((event) => event.startsAt)
      .filter((event) => event.startsAt.getFullYear() === year && event.startsAt.getMonth() === month)
      .map((event) => event.startsAt.getDate()),
  );

  monthLabel.textContent = `${year}.${String(month + 1).padStart(2, "0")}`;

  const cells = [];
  const weekdayOffset = firstDay.getDay();

  for (let i = 0; i < weekdayOffset; i += 1) {
    cells.push('<span class="calendar-cell muted"></span>');
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const active = eventDays.has(day) ? " active" : "";
    cells.push(`<span class="calendar-cell${active}">${day}</span>`);
  }

  grid.innerHTML = ["日", "一", "二", "三", "四", "五", "六"]
    .map((day) => `<b>${day}</b>`)
    .join("") + cells.join("");
}

function bootEvents() {
  const upcoming = getUpcomingEvents();
  renderNextEvent(upcoming);
  renderEventList(upcoming);
  renderCalendar(upcoming);
}

bootEvents();
