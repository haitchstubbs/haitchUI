import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { firstChildTreeItem } from "./firstChildTreeItem.js";

function el(tag = "div") {
  return document.createElement(tag);
}

function append<T extends HTMLElement>(parent: HTMLElement, child: T): T {
  parent.appendChild(child);
  return child;
}

function createTreeRoot() {
  const root = el("div");
  root.setAttribute("role", "tree");
  document.body.appendChild(root);
  return root;
}

function createGroup(id: string, opts?: { hidden?: boolean; ariaHidden?: boolean }) {
  const group = el("div");
  group.setAttribute("role", "group");
  group.setAttribute("id", id);
  if (opts?.hidden) group.hidden = true;
  if (opts?.ariaHidden) group.setAttribute("aria-hidden", "true");
  return group;
}

function createTreeItem(opts?: {
  dataTreeitem?: boolean;
  ariaDisabled?: boolean;
  dataDisabled?: boolean;
  text?: string;
}) {
  const item = el("div");
  item.setAttribute("role", "treeitem");
  if (opts?.dataTreeitem ?? true) item.setAttribute("data-treeitem", "true");
  if (opts?.ariaDisabled) item.setAttribute("aria-disabled", "true");
  if (opts?.dataDisabled) item.setAttribute("data-disabled", "true");
  if (opts?.text) item.textContent = opts.text;
  return item;
}

function createController(groupId: string) {
  const controller = el("div");
  controller.setAttribute("role", "treeitem");
  controller.setAttribute("data-treeitem", "true");
  controller.setAttribute("aria-controls", groupId);
  return controller;
}

describe("firstChildTreeItem", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns null when element is null", () => {
    expect(firstChildTreeItem(null)).toBeNull();
  });

  it("returns null when there is no aria-controls attribute", () => {
    const node = el("div");
    expect(firstChildTreeItem(node)).toBeNull();
  });

  it("returns null when aria-controls is empty", () => {
    const node = el("div");
    node.setAttribute("aria-controls", "");
    expect(firstChildTreeItem(node)).toBeNull();
  });

  it("returns null when the controlled group does not exist", () => {
    const node = el("div");
    node.setAttribute("aria-controls", "missing");
    expect(firstChildTreeItem(node)).toBeNull();
  });

  it("returns null when there are no child tree items", () => {
    const root = createTreeRoot();
    append(root, createGroup("group1"));
    const controller = append(root, createController("group1"));

    expect(firstChildTreeItem(controller)).toBeNull();
  });

  it("returns null when the controlled group itself is hidden", () => {
    const root = createTreeRoot();
    append(root, createGroup("group1", { hidden: true }));
    const controller = append(root, createController("group1"));

    expect(firstChildTreeItem(controller)).toBeNull();
  });

  it("returns null when the controlled group itself is aria-hidden", () => {
    const root = createTreeRoot();
    append(root, createGroup("group1", { ariaHidden: true }));
    const controller = append(root, createController("group1"));

    expect(firstChildTreeItem(controller)).toBeNull();
  });

  it("returns the first visible and enabled child tree item (skips aria-disabled and data-disabled)", () => {
    const root = createTreeRoot();
    const controller = append(root, createController("group1"));
    const group = append(root, createGroup("group1"));

    const child1 = append(group, createTreeItem({ text: "disabled-aria", ariaDisabled: true }));
    const child2 = append(group, createTreeItem({ text: "disabled-data", dataDisabled: true }));
    const child3 = append(group, createTreeItem({ text: "enabled" }));

    expect(firstChildTreeItem(controller)).toBe(child3);

    // sanity: ensure our setup is what we think it is
    expect(child1.getAttribute("aria-disabled")).toBe("true");
    expect(child2.hasAttribute("data-disabled")).toBe(true);
  });

  it("ignores children that are missing data-treeitem='true'", () => {
    const root = createTreeRoot();
    const controller = append(root, createController("group1"));
    const group = append(root, createGroup("group1"));

    const missingData = createTreeItem({ text: "missing-data" });
    missingData.removeAttribute("data-treeitem"); // make it invalid for selector
    append(group, missingData);

    const realChild = append(group, createTreeItem({ text: "real" }));

    expect(firstChildTreeItem(controller)).toBe(realChild);
  });

  it("ignores children inside nested hidden groups", () => {
    const root = createTreeRoot();
    const controller = append(root, createController("group1"));
    const group = append(root, createGroup("group1"));

    const nestedHidden = append(group, createGroup("nested", { hidden: true }));
    append(nestedHidden, createTreeItem({ text: "hiddenChild" }));

    const visibleChild = append(group, createTreeItem({ text: "visibleChild" }));

    expect(firstChildTreeItem(controller)).toBe(visibleChild);
  });

  it("ignores children inside nested aria-hidden groups", () => {
    const root = createTreeRoot();
    const controller = append(root, createController("group1"));
    const group = append(root, createGroup("group1"));

    const nestedAriaHidden = append(group, createGroup("nested", { ariaHidden: true }));
    append(nestedAriaHidden, createTreeItem({ text: "hiddenChild" }));

    const visibleChild = append(group, createTreeItem({ text: "visibleChild" }));

    expect(firstChildTreeItem(controller)).toBe(visibleChild);
  });

  it("does not return treeitems outside the controlled group", () => {
    const root = createTreeRoot();
    const controller = append(root, createController("group1"));

    const group1 = append(root, createGroup("group1"));
    const group2 = append(root, createGroup("group2"));

    const outsideChild = append(group2, createTreeItem({ text: "outside" }));
    const insideChild = append(group1, createTreeItem({ text: "inside" }));

    expect(firstChildTreeItem(controller)).toBe(insideChild);
    expect(firstChildTreeItem(controller)).not.toBe(outsideChild);
  });

  it("returns null if all child tree items are disabled", () => {
    const root = createTreeRoot();
    const controller = append(root, createController("group1"));
    const group = append(root, createGroup("group1"));

    append(group, createTreeItem({ ariaDisabled: true, text: "child1" }));
    append(group, createTreeItem({ dataDisabled: true, text: "child2" }));

    expect(firstChildTreeItem(controller)).toBeNull();
  });
});
