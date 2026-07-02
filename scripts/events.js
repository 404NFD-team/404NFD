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

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

const unknownDateTexts = new Set(["", "待定", "敬请期待", "未定", "日期待定", "tbd", "unknown"]);
const unknownTimeTexts = new Set(["", "待定", "敬请期待", "未定", "时间待定", "tbd", "unknown"]);
const calendarState = {
  upcoming: [],
  selectedDateKey: "",
  viewMonth: null,
  viewYear: null,
};

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

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function getCalendarDateKey(year, month, day) {
  return `${year}-${padNumber(month + 1)}-${padNumber(day)}`;
}

function parseDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function formatDateKeyLabel(dateKey) {
  const parts = parseDateKey(dateKey);
  if (!parts) return dateKey;

  return dateFormatter.format(new Date(parts.year, parts.month, parts.day));
}

function getEventDateKey(event) {
  if (!event.startsAt) return "";

  const date = normalizeText(event.date);
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : getCalendarDateKey(event.startsAt.getFullYear(), event.startsAt.getMonth(), event.startsAt.getDate());
}

function getEventsForDate(upcoming, dateKey) {
  if (!dateKey) return upcoming;

  return upcoming.filter((event) => getEventDateKey(event) === dateKey);
}

function renderNextEvent(upcoming, selectedDateKey = "") {
  const container = document.querySelector("#nextEvent");
  if (!container) return;

  const selectedEvents = getEventsForDate(upcoming, selectedDateKey);
  const event = selectedEvents[0];
  const label = selectedDateKey ? "SELECTED DATE" : "NEXT EVENT";

  if (!event) {
    container.innerHTML = `
      <span class="event-label">${label}</span>
      <h2>${selectedDateKey ? `${escapeHTML(formatDateKeyLabel(selectedDateKey))}暂无活动` : "暂无即将发生的活动"}</h2>
      <p>${selectedDateKey ? "这天暂时没有安排活动。" : "新的训练、比赛或分享确定后，会同步更新到这里。"}</p>
    `;
    return;
  }

  container.innerHTML = `
    <span class="event-label">${label}</span>
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

function renderEventList(upcoming, selectedDateKey = "") {
  const container = document.querySelector("#eventList");
  if (!container) return;

  const visibleEvents = getEventsForDate(upcoming, selectedDateKey);

  if (!visibleEvents.length) {
    container.innerHTML = selectedDateKey
      ? `<p class="member-empty">${escapeHTML(formatDateKeyLabel(selectedDateKey))} 暂无活动。</p>`
      : '<p class="member-empty">暂无即将发生的活动，欢迎关注 404NFD 后续通知。</p>';
    return;
  }

  container.innerHTML = visibleEvents
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

function getInitialCalendarDate(upcoming) {
  if (upcoming[0]?.startsAt) return upcoming[0].startsAt;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));

  return new Date(Number(parts.year), Number(parts.month) - 1, 1);
}

function setCalendarView(date) {
  calendarState.viewYear = date.getFullYear();
  calendarState.viewMonth = date.getMonth();
}

function updateCalendarSelection() {
  const selection = document.querySelector("#calendarSelection");
  const clearButton = document.querySelector("#clearDateButton");

  if (selection) {
    selection.textContent = calendarState.selectedDateKey
      ? `已选 ${formatDateKeyLabel(calendarState.selectedDateKey)}`
      : "全部日期";
  }

  if (clearButton) {
    clearButton.disabled = !calendarState.selectedDateKey;
  }
}

function renderCalendar(upcoming) {
  const monthLabel = document.querySelector("#calendarMonth");
  const grid = document.querySelector("#calendarGrid");
  if (!monthLabel || !grid) return;

  if (calendarState.viewYear === null || calendarState.viewMonth === null) {
    setCalendarView(getInitialCalendarDate(upcoming));
  }

  const year = calendarState.viewYear;
  const month = calendarState.viewMonth;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const monthPrefix = `${year}-${padNumber(month + 1)}-`;
  const today = new Date();
  const todayKey = getCalendarDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const eventCounts = new Map();

  upcoming.forEach((event) => {
    const dateKey = getEventDateKey(event);
    if (!dateKey.startsWith(monthPrefix)) return;

    const parts = parseDateKey(dateKey);
    if (!parts) return;

    eventCounts.set(parts.day, (eventCounts.get(parts.day) || 0) + 1);
  });

  monthLabel.textContent = `${year}.${String(month + 1).padStart(2, "0")}`;

  const cells = [];
  const weekdayOffset = firstDay.getDay();

  for (let i = 0; i < weekdayOffset; i += 1) {
    cells.push('<span class="calendar-cell muted" aria-hidden="true"></span>');
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const dateKey = getCalendarDateKey(year, month, day);
    const eventCount = eventCounts.get(day) || 0;
    const classes = ["calendar-cell"];

    if (eventCount) classes.push("active");
    if (calendarState.selectedDateKey === dateKey) classes.push("selected");
    if (todayKey === dateKey) classes.push("today");

    cells.push(`
      <button
        class="${classes.join(" ")}"
        type="button"
        data-date="${dateKey}"
        aria-pressed="${calendarState.selectedDateKey === dateKey ? "true" : "false"}"
        aria-label="${escapeHTML(`${year}年${month + 1}月${day}日${eventCount ? `，${eventCount} 个活动` : ""}`)}"
      >${day}</button>
    `);
  }

  grid.innerHTML = ["日", "一", "二", "三", "四", "五", "六"]
    .map((day) => `<b>${day}</b>`)
    .join("") + cells.join("");
}

function renderEventsView() {
  renderNextEvent(calendarState.upcoming, calendarState.selectedDateKey);
  renderEventList(calendarState.upcoming, calendarState.selectedDateKey);
  renderCalendar(calendarState.upcoming);
  updateCalendarSelection();
}

function shiftCalendarMonth(offset) {
  setCalendarView(new Date(calendarState.viewYear, calendarState.viewMonth + offset, 1));
  renderEventsView();
}

function selectCalendarDate(dateKey) {
  const parts = parseDateKey(dateKey);
  if (!parts) return;

  calendarState.selectedDateKey = calendarState.selectedDateKey === dateKey ? "" : dateKey;
  calendarState.viewYear = parts.year;
  calendarState.viewMonth = parts.month;
  renderEventsView();
}

function selectToday() {
  const today = new Date();

  calendarState.viewYear = today.getFullYear();
  calendarState.viewMonth = today.getMonth();
  calendarState.selectedDateKey = getCalendarDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  renderEventsView();
}

function bindCalendarControls() {
  const grid = document.querySelector("#calendarGrid");
  const prevMonth = document.querySelector("#prevMonth");
  const nextMonth = document.querySelector("#nextMonth");
  const todayButton = document.querySelector("#todayButton");
  const clearDateButton = document.querySelector("#clearDateButton");

  grid?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const cell = event.target.closest(".calendar-cell[data-date]");
    if (!cell) return;

    selectCalendarDate(cell.dataset.date || "");
  });

  prevMonth?.addEventListener("click", () => shiftCalendarMonth(-1));
  nextMonth?.addEventListener("click", () => shiftCalendarMonth(1));
  todayButton?.addEventListener("click", selectToday);
  clearDateButton?.addEventListener("click", () => {
    calendarState.selectedDateKey = "";
    renderEventsView();
  });
}

function bootEvents() {
  const upcoming = getUpcomingEvents();

  calendarState.upcoming = upcoming;
  setCalendarView(getInitialCalendarDate(upcoming));
  bindCalendarControls();
  renderEventsView();
}

bootEvents();
