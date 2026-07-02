const fs = require("fs");
const path = require("path");

const eventsPath = path.resolve(process.cwd(), "scripts/events.js");
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
});

const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
const currentMonth = `${parts.year}-${parts.month}`;
const source = fs.readFileSync(eventsPath, "utf8");
const marker = /const calendarFallbackMonth = "\d{4}-\d{2}";/;

if (!marker.test(source)) {
  throw new Error("calendarFallbackMonth marker not found in events.js");
}

const next = source.replace(marker, `const calendarFallbackMonth = "${currentMonth}";`);

if (source === next) {
  console.log(`calendarFallbackMonth already ${currentMonth}`);
  process.exit(0);
}

fs.writeFileSync(eventsPath, next, "utf8");
console.log(`calendarFallbackMonth updated to ${currentMonth}`);
