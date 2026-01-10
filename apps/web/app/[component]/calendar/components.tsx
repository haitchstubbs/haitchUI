"use client";

import * as React from "react";

import { Calendar } from "../../../components/ui/calendar";

export function CalendarDemo() {
	const [date, setDate] = React.useState<Date | undefined>(undefined);
	const [timeZone, setTimeZone] = React.useState<string | undefined>(undefined);

	React.useEffect(() => {
		setDate(new Date());
		setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
	}, []);

	return (
		<Calendar
			mode="single"
			selected={date}
			onSelect={setDate}
			timeZone={timeZone}
			className="rounded-md border shadow-sm"
			captionLayout="dropdown"
		/>
	);
}
