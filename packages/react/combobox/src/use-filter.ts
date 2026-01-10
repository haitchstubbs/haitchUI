"use client";

import * as React from "react";

type FilterOptions = Intl.CollatorOptions & {
	locale?: Intl.LocalesArgument;
	multiple?: boolean;
	value?: any;
};

function defaultItemToString(itemValue: any) {
	if (itemValue == null) return "";
	return typeof itemValue === "string" ? itemValue : String(itemValue);
}

function equals(collator: Intl.Collator, a: string, b: string) {
	return collator.compare(a, b) === 0;
}

export function useFilter(options: FilterOptions = {}) {
	const { locale, multiple = false, value, ...collatorOptions } = options;

	// Best-effort stable memoization. Callers should pass a stable options object.
	const collatorOptionsKey = JSON.stringify(collatorOptions);
	const collator = React.useMemo(() => new Intl.Collator(locale, collatorOptions), [locale, collatorOptionsKey]);

	const normalizeQuery = React.useCallback((query: string) => query.trim(), []);

	const matchesSelection = React.useCallback(
		(query: string, itemToString?: (itemValue: any) => string) => {
			if (multiple) return false;
			if (value === undefined) return false;
			const toString = itemToString ?? defaultItemToString;
			const selection = toString(value);
			return selection !== "" && equals(collator, query, selection);
		},
		[collator, multiple, value]
	);

	const contains = React.useCallback(
		(itemValue: any, query: string, itemToString?: (itemValue: any) => string) => {
			const q = normalizeQuery(query);
			if (q === "" || matchesSelection(q, itemToString)) return true;

			const toString = itemToString ?? defaultItemToString;
			const text = toString(itemValue);
			if (q.length > text.length) return false;

			for (let i = 0; i <= text.length - q.length; i++) {
				const part = text.slice(i, i + q.length);
				if (equals(collator, part, q)) return true;
			}
			return false;
		},
		[collator, matchesSelection, normalizeQuery]
	);

	const startsWith = React.useCallback(
		(itemValue: any, query: string, itemToString?: (itemValue: any) => string) => {
			const q = normalizeQuery(query);
			if (q === "" || matchesSelection(q, itemToString)) return true;

			const toString = itemToString ?? defaultItemToString;
			const text = toString(itemValue);
			if (q.length > text.length) return false;
			return equals(collator, text.slice(0, q.length), q);
		},
		[collator, matchesSelection, normalizeQuery]
	);

	const endsWith = React.useCallback(
		(itemValue: any, query: string, itemToString?: (itemValue: any) => string) => {
			const q = normalizeQuery(query);
			if (q === "" || matchesSelection(q, itemToString)) return true;

			const toString = itemToString ?? defaultItemToString;
			const text = toString(itemValue);
			if (q.length > text.length) return false;
			return equals(collator, text.slice(text.length - q.length), q);
		},
		[collator, matchesSelection, normalizeQuery]
	);

	return { contains, startsWith, endsWith } as const;
}

