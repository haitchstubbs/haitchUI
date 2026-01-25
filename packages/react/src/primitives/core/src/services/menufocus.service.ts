export class MenuFocus {
	static isPrintableKey(e: React.KeyboardEvent): boolean {
		return e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey;
	}
	static items(root: HTMLElement | null): HTMLElement[] {
		if (!root) return [];
		const all = Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'));

		return all.filter((el) => {
			const ariaDisabled = el.getAttribute("aria-disabled") === "true";
			const dataDisabled = el.hasAttribute("data-disabled");
			return !(ariaDisabled || dataDisabled);
		});
	}
	static first(root: HTMLElement | null) {
		const items = MenuFocus.items(root);
		items[0]?.focus();
	}
	static next(root: HTMLElement | null, dir: 1 | -1) {
		const items = MenuFocus.items(root);
		if (items.length === 0) return;

		const active = document.activeElement as HTMLElement | null;
		const idx = active ? items.indexOf(active) : -1;

		let nextIdx = idx;
		for (let i = 0; i < items.length; i++) {
			nextIdx = (nextIdx + dir + items.length) % items.length;
			const next = items[nextIdx];
			if (next) {
				next.focus();
				return;
			}
		}

		items[0]?.focus();
	}
	static home(root: HTMLElement | null) {
		const items = MenuFocus.items(root);
		items[0]?.focus();
	}
	static end(root: HTMLElement | null) {
		const items = MenuFocus.items(root);
		items[items.length - 1]?.focus();
	}
	static typeahead(el: HTMLElement): string {
		return (el.textContent ?? "").trim().toLowerCase();
	}
	static focusTypeAhead(root: HTMLElement | null, query: string) {
		const items = MenuFocus.items(root);
		if (items.length === 0) return;

		const q = query.trim().toLowerCase();
		if (!q) return;

		const active = document.activeElement as HTMLElement | null;
		const startIdx = active ? items.indexOf(active) : -1;

		const ordered = startIdx >= 0 ? [...items.slice(startIdx + 1), ...items.slice(0, startIdx + 1)] : items;

		for (const el of ordered) {
			const txt = MenuFocus.typeahead(el);
			if (txt.startsWith(q)) {
				el.focus();
				return;
			}
		}
	}

	static listboxItems(root: HTMLElement | null): HTMLElement[] {
		if (!root) return [];
		const all = Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'));

		return all.filter((el) => {
			const ariaDisabled = el.getAttribute("aria-disabled") === "true";
			const dataDisabled = el.hasAttribute("data-disabled");
			return !(ariaDisabled || dataDisabled);
		});
	}

	static listboxFirst(root: HTMLElement | null) {
		const items = MenuFocus.listboxItems(root);
		items[0]?.focus();
	}

	static listboxNext(root: HTMLElement | null, dir: 1 | -1) {
		const items = MenuFocus.listboxItems(root);
		if (items.length === 0) return;

		const active = document.activeElement as HTMLElement | null;
		const idx = active ? items.indexOf(active) : -1;

		let nextIdx = idx;
		for (let i = 0; i < items.length; i++) {
			nextIdx = (nextIdx + dir + items.length) % items.length;
			const next = items[nextIdx];
			if (next) {
				next.focus();
				return;
			}
		}

		items[0]?.focus();
	}

	static listboxHome(root: HTMLElement | null) {
		const items = MenuFocus.listboxItems(root);
		items[0]?.focus();
	}

	static listboxEnd(root: HTMLElement | null) {
		const items = MenuFocus.listboxItems(root);
		items[items.length - 1]?.focus();
	}

	static listboxTypeahead(el: HTMLElement): string {
		// Prefer explicit data-text-value (Select.Item sets this), fallback to textContent
		return (el.getAttribute("data-text-value") ?? el.textContent ?? "").trim().toLowerCase();
	}

	static listboxFocusTypeAhead(root: HTMLElement | null, query: string) {
		const items = MenuFocus.listboxItems(root);
		if (items.length === 0) return;

		const q = query.trim().toLowerCase();
		if (!q) return;

		const active = document.activeElement as HTMLElement | null;
		const startIdx = active ? items.indexOf(active) : -1;

		const ordered = startIdx >= 0 ? [...items.slice(startIdx + 1), ...items.slice(0, startIdx + 1)] : items;

		for (const el of ordered) {
			const txt = MenuFocus.listboxTypeahead(el);
			if (txt.startsWith(q)) {
				el.focus();
				return;
			}
		}
	}
}
