import { getFocusableWithin } from "./getFocusableWithin";

describe("getFocusableWithin", () => {
	it("returns only focusable, visible elements", () => {
		const root = document.createElement("div");
		root.innerHTML = `
			<button id="ok">OK</button>
			<button id="disabled" disabled>Disabled</button>
			<a id="link" href="#foo">Link</a>
			<input id="input" />
			<div id="tabbable" tabindex="0">Tabbable</div>
			<div id="neg" tabindex="-1">Nope</div>
			<div id="aria-hidden" tabindex="0" aria-hidden="true">Hidden</div>
		`;

		const hidden = document.createElement("button");
		hidden.id = "hidden";
		hidden.hidden = true;
		root.appendChild(hidden);

		const focusables = getFocusableWithin(root);
		const ids = focusables.map((el) => el.id);

		expect(ids).toEqual(["ok", "link", "input", "tabbable"]);
	});
});
