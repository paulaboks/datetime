import { assertEquals } from "@std/assert";
import { DateTime, defaults } from "./mod.ts";

// 24 hour time and DD/MM/YYYY
defaults.locale = "en-GB";
// My timezone :3
defaults.timezone = "America/Sao_Paulo";

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

Deno.test("DateTime toString()", () => {
	const datetime = DateTime.from("2025-10-01T14:30:00");

	assertEquals(datetime.toString(), "2025-10-01T14:30:00-03:00");
});

Deno.test("DateTime [Symbol.toPrimitive]()", () => {
	const datetime = DateTime.from("2025-10-01T14:30:00");

	assertEquals(typeof Number(datetime), "number");
	assertEquals(typeof String(datetime), "string");
});

Deno.test("DateTime in JSON.stringify", () => {
	const datetime = DateTime.from("2025-10-01T14:30:00");

	assertEquals(JSON.stringify({ datetime }), `{"datetime":"2025-10-01T14:30:00-03:00"}`);
});

Deno.test("DateTime add time", () => {
	const datetime = DateTime.from("2025-10-01T14:30:00");
	datetime.hour += 6;

	assertEquals(datetime.toString(), "2025-10-01T20:30:00-03:00");
});

Deno.test("Weird old date issue", () => {
	const datetime = DateTime.from("1900-01-01T20:30:00");

	assertEquals(datetime.toString(), "1914-01-01T20:30:00-03:00");
});
