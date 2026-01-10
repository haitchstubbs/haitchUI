import * as React from "react";

/**
 * Import *real* runtime components here (Next can compile TS/TSX).
 * These will be injected into the VM as globals.
 *
 * Add modules/exports as your templates need them.
 */

// ui components
import { Button } from "../../../components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../../components/ui/accordion";
import { Checkbox } from "../../../components/ui/checkbox";
import {
	CodeBlock,
	CodeBlockHeader,
	CodeBlockHeaderText,
	CodeBlockTitle,
	CodeBlockDescription,
	CodeBlockHeaderActions,
	CodeBlockContent,
	CodeBlockCode,
	CodeBlockActions,
	CodeBlockCopy,
	CodeBlockExpand,
} from "../../../components/ui/code-block";
import {
	IconAlertCircle,
	IconBrandTypescript,
	IconCheck,
	IconCircleCheck,
	IconCopy,
	IconGhost,
	IconGhost2,
	IconLayoutBottombarCollapse,
} from "@tabler/icons-react";
import { Separator } from "../../../components/ui/separator";

// common utils (shadcn templates often use this)
import { cn } from "../../../lib/util";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert";
import { cva, type VariantProps } from "class-variance-authority";

// If your templates use icons, add them too (example):
// import { IconBrandTypescript } from "@tabler/icons-react";

export type AllowedModuleKey = keyof typeof ALLOWLIST;

/**
 * Allowlist maps:
 *  - module specifier string (exactly what appears in import "...")
 *  - to an object of allowed exports for that module
 *
 * Supports named imports and default imports (use key "default").
 */
export const ALLOWLIST = {
	react: {
		default: React,
		React,
		useState: React.useState,
	},
	"@/lib/utils": {
		cn,
	},
	"@/components/ui/button": {
		Button,
	},
	"@/components/ui/accordion": {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
	},
	"@/components/ui/checkbox": {
		Checkbox,
	},
	"@/components/ui/code-block": {
		CodeBlock,
		CodeBlockHeader,
		CodeBlockHeaderText,
		CodeBlockTitle,
		CodeBlockDescription,
		CodeBlockHeaderActions,
		CodeBlockContent,
		CodeBlockCode,
		CodeBlockActions,
		CodeBlockCopy,
		CodeBlockExpand,
	},
	"@tabler/icons-react": {
		IconBrandTypescript,
		IconCopy,
		IconLayoutBottombarCollapse,
		IconAlertCircle,
		IconCircleCheck,
		IconGhost,
	},
	"@/components/ui/separator": {
		Separator,
	},
	"@/components/ui/alert-dialog": {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger,
	},
	"@/components/ui/alert": {
		Alert,
		AlertTitle,
		AlertDescription,
	},
	"class-variance-authority": {
		cva,
	},

	// Add more as needed:
	// "@/components/ui/card": { Card, CardHeader, CardContent },
	// "@tabler/icons-react": { IconCopy, IconBrandTypescript },
} as const satisfies Record<string, Record<string, unknown>>;

export type Allowlist = typeof ALLOWLIST;
