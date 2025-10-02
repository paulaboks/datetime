const format_default: Intl.ResolvedDateTimeFormatOptions = Intl.DateTimeFormat().resolvedOptions();

export const defaults = {
	timezone: format_default.timeZone,
	locale: format_default.locale,
};

const date_string_regex = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

export class DateTime {
	#date: Date;
	#zone: string;

	constructor(date: Date, zone: string = defaults.timezone) {
		this.#date = date;
		this.#zone = zone;
	}

	static #get_formatter(zone: string) {
		return new Intl.DateTimeFormat(defaults.locale, {
			timeZone: zone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	}

	static from(date_string: string, zone: string = defaults.timezone): DateTime {
		const match = date_string.match(date_string_regex);
		if (!match) {
			throw new Error("Invalid datetime format. Use YYYY-MM-DDTHH:mm[:ss]");
		}

		const [_, year, month, day, hour = 0, minute = 0, second = 0] = match.map((m) =>
			typeof m === "string" ? Number(m) : m
		);

		const utc_date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

		const formatter = DateTime.#get_formatter(zone);
		const parts = formatter.formatToParts(utc_date);
		const map: Record<string, string> = {};
		for (const { type, value } of parts) {
			map[type] = value;
		}

		const local_year = parseInt(map.year, 10);
		const local_month = parseInt(map.month, 10);
		const local_day = parseInt(map.day, 10);
		const local_hour = parseInt(map.hour, 10);
		const local_minute = parseInt(map.minute, 10);
		const local_second = parseInt(map.second, 10);

		const local_time = Date.UTC(local_year, local_month - 1, local_day, local_hour, local_minute, local_second);
		const offset_ms = local_time - utc_date.getTime();

		const utc_timestamp = Date.UTC(year, month - 1, day, hour, minute, second) - offset_ms;

		return new DateTime(new Date(utc_timestamp), zone);
	}

	static now(zone: string = defaults.timezone): DateTime {
		return new DateTime(new Date(), zone);
	}

	toString(): string {
		const date_utc = new Date(this.#date.toLocaleString(defaults.locale, { timeZone: this.#zone }));
		const offsetMinutes = -date_utc.getTimezoneOffset();

		const sign = offsetMinutes >= 0 ? "+" : "-";
		const abs_offset = Math.abs(offsetMinutes);
		const offset_hour = String(Math.floor(abs_offset / 60)).padStart(2, "0");
		const offset_minute = String(abs_offset % 60).padStart(2, "0");
		const offset = `${sign}${offset_hour}:${offset_minute}`;
		return `${this.format("yyyy-MM-ddTHH:mm:ss")}${offset}`;
	}

	[Symbol.toPrimitive](hint: string): string | number {
		if (hint === "string") {
			return this.toString();
		}

		if (hint === "number") {
			return this.#date.getTime();
		}

		return this.toString();
	}

	toJSON(): string {
		return this.toString();
	}

	#get_parts() {
		const formatter = DateTime.#get_formatter(this.#zone);
		const parts = formatter.formatToParts(this.#date);
		return Object.fromEntries(parts.map((p) => [p.type, p.value]));
	}

	#set_part(part: "year" | "month" | "day" | "hour" | "minute" | "second", value: number) {
		const parts = this.#get_parts();

		const updated = {
			year: parseInt(parts.year, 10),
			month: parseInt(parts.month, 10) - 1,
			day: parseInt(parts.day, 10),
			hour: parseInt(parts.hour, 10),
			minute: parseInt(parts.minute, 10),
			second: parseInt(parts.second, 10),
			[part]: value,
		};

		const local_date = new Date(Date.UTC(
			updated.year,
			updated.month,
			updated.day,
			updated.hour,
			updated.minute,
			updated.second,
		));

		// Recalculate the correct UTC timestamp to reflect the target time in the configured zone
		const formatter = DateTime.#get_formatter(this.#zone);
		const formatted = formatter.formatToParts(local_date);
		const map: Record<string, string> = {};
		for (const { type, value } of formatted) {
			map[type] = value;
		}
		const local_time = Date.UTC(
			parseInt(map.year, 10),
			parseInt(map.month, 10) - 1,
			parseInt(map.day, 10),
			parseInt(map.hour, 10),
			parseInt(map.minute, 10),
			parseInt(map.second, 10),
		);
		const offset = local_time - local_date.getTime();

		this.#date = new Date(local_date.getTime() - offset);
	}

	get year(): number {
		return parseInt(this.#get_parts().year, 10);
	}

	set year(value: number) {
		this.#set_part("year", value);
	}

	get month(): number {
		return parseInt(this.#get_parts().month, 10) - 1;
	}

	set month(value: number) {
		this.#set_part("month", value);
	}

	get day(): number {
		return parseInt(this.#get_parts().day, 10);
	}

	set day(value: number) {
		this.#set_part("day", value);
	}

	get hour(): number {
		return parseInt(this.#get_parts().hour, 10);
	}

	set hour(value: number) {
		this.#set_part("hour", value);
	}

	get minute(): number {
		return parseInt(this.#get_parts().minute, 10);
	}

	set minute(value: number) {
		this.#set_part("minute", value);
	}

	get second(): number {
		return parseInt(this.#get_parts().second, 10);
	}

	set second(value: number) {
		this.#set_part("second", value);
	}

	format(format_string: string): string {
		const parts = this.#get_parts();

		const map: Record<string, string> = {
			yyyy: parts.year,
			MM: parts.month,
			dd: parts.day,
			HH: parts.hour,
			mm: parts.minute,
			ss: parts.second,
		};

		// Zero-pad numbers if necessary
		for (const key of ["MM", "dd", "HH", "mm", "ss"]) {
			if (map[key]) {
				map[key] = map[key].toString().padStart(2, "0");
			}
		}

		return format_string.replace(/yyyy|MM|dd|HH|mm|ss/g, (match) => map[match] || match);
	}
}
