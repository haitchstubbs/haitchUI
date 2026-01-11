import * as React from "react";
import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@haitch-ui/ui";

import { runAccordionContract, runAccordionItemAndAsChildContract } from "../contracts/accordion";

function BasicAccordion(props?: Partial<React.ComponentProps<typeof Accordion>>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const parts = {
  root: () => {
    const el = document.querySelector("[data-accordion]") as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  itemCount: () => document.querySelectorAll("[data-accordion-item]").length,
  trigger: (name: string | RegExp) => screen.getByRole("button", { name }) as HTMLButtonElement,
  contentByText: (text: string | RegExp) => screen.getByText(text).closest("div") as HTMLElement,
};

describe("Accordion", () => {
  runAccordionContract("Accordion", (p) => <BasicAccordion {...p} />, parts);

  runAccordionItemAndAsChildContract("Accordion", () => (
    <div>
      {/* per-item disabled */}
      <Accordion type="single">
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Trigger asChild */}
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger asChild>
            <button data-testid="child-trigger">Child Trigger</button>
          </AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Content asChild */}
      <Accordion type="single" defaultValue={null}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Open</AccordionTrigger>
          <AccordionContent asChild>
            <div data-testid="child-content">Child Content</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ));
});
