import { assertEquals } from "@std/assert";
import { DateTime, defaults } from "./mod.ts";

// 24 hour time and DD/MM/YYYY
defaults.locale = "en-GB";

Deno.test("Creating a DateTime from Date", () => {
	const date = new Date("2025-10-01T14:30:00");
	const datetime = new DateTime(date);

	assertEquals(datetime.year, 2025);
	assertEquals(datetime.month, 9);
	assertEquals(datetime.day, 1);
	assertEquals(datetime.hour, 14);
	assertEquals(datetime.minute, 30);
	assertEquals(datetime.second, 0);
});

Deno.test("Creating a DateTime from a datetime string", () => {
	const datetime = DateTime.from("2025-10-01T14:30:00");

	assertEquals(datetime.year, 2025);
	assertEquals(datetime.month, 9);
	assertEquals(datetime.day, 1);
	assertEquals(datetime.hour, 14);
	assertEquals(datetime.minute, 30);
	assertEquals(datetime.second, 0);
});

Deno.test("Creating a DateTime from a date string", () => {
	const datetime = DateTime.from("2025-10-01");

	assertEquals(datetime.year, 2025);
	assertEquals(datetime.month, 9);
	assertEquals(datetime.day, 1);
});

Deno.test("Formatting DateTime", () => {
	const datetime = DateTime.from("2025-10-01T14:30:00");

	assertEquals(datetime.format("yyyy-MM-dd"), "2025-10-01");
	assertEquals(datetime.format("dd/MM/yyyy"), "01/10/2025");
	assertEquals(datetime.format("dd/MM/yyyy HH:mm:ss"), "01/10/2025 14:30:00");
});
