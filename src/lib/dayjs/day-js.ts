import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import objectSupport from "dayjs/plugin/objectSupport";
import duration from "dayjs/plugin/duration";
import dayOfYear from "dayjs/plugin/dayOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

require("dayjs/locale/fr");

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(objectSupport);
dayjs.extend(dayOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

dayjs.tz.setDefault("Europe/Paris");
dayjs.locale("fr");
dayjs().format();

export const dayJS = dayjs;
export { Dayjs } from "dayjs";