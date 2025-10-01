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

	#get_parts() {
		const formatter = DateTime.#get_formatter(this.#zone);
		const parts = formatter.formatToParts(this.#date);
		return Object.fromEntries(parts.map((p) => [p.type, p.value]));
	}

	get year(): number {
		return parseInt(this.#get_parts().year, 10);
	}

	get month(): number {
		return parseInt(this.#get_parts().month, 10) - 1;
	}

	get day(): number {
		return parseInt(this.#get_parts().day, 10);
	}

	get hour(): number {
		return parseInt(this.#get_parts().hour, 10);
	}

	get minute(): number {
		return parseInt(this.#get_parts().minute, 10);
	}

	get second(): number {
		return parseInt(this.#get_parts().second, 10);
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
