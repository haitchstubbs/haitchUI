"use client";

import * as React from "react";
import { type ColumnDef } from "@haitch-ui/react-data-table";

import { DataTable } from "../../../../components/ui/data-table";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { v4 } from "uuid";
type User = {
	id: string;
	name: string;
	email: string;
	role: "admin" | "member";
	status: "active" | "invited";
};

function generateRandomId() {
	return Math.random().toString(36).substring(2, 10);
}

function generateRandomName() {
	const firstNames = [
		"Alice",
		"Bob",
		"Charlie",
		"David",
		"Eva",
		"Frank",
		"Grace",
		"Hannah",
		"Ian",
		"Judy",
		"Kevin",
		"Laura",
		"Mike",
		"Nina",
		"Oscar",
		"Paula",
		"Quinn",
		"Rachel",
		"Steve",
		"Tina",
		"Uma",
		"Vince",
		"Wendy",
		"Xander",
		"Yara",
		"Zane",
	];
	const lastNames = [
		"Anderson",
		"Brown",
		"Clark",
		"Davis",
		"Evans",
		"Garcia",
		"Harris",
		"Johnson",
		"King",
		"Lee",
		"Martinez",
		"Nelson",
		"O'Connor",
		"Perez",
		"Roberts",
		"Smith",
		"Taylor",
		"Upton",
		"Vasquez",
		"White",
		"Young",
		"Zimmerman",
	];
	return firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
}

function generateEmailFromName(name: string) {
	const emailProviders = ["example.com", "mail.com", "test.org", "demo.net"];
	const provider = emailProviders[Math.floor(Math.random() * emailProviders.length)];
	const emailName = name.toLowerCase().replace(" ", ".");
	return `${emailName}@${provider}`;
}

function generateRandomRole() {
	return Math.random() < 0.3 ? "admin" : "member";
}

function generateRandomStatus() {
	return Math.random() < 0.7 ? "active" : "invited";
}

function getAvatarUrl(seed: string) {
	// SVG is recommended by DiceBear (scales well + lighter). :contentReference[oaicite:2]{index=2}
	const safeSeed = encodeURIComponent(seed);
	return `https://api.dicebear.com/7.x/thumbs/svg?seed=${safeSeed}`;
}

const initialData: User[] = Array.from({ length: 500 }, () => {
	{
		const name = generateRandomName();
		const id = v4();
		return {
			id: id,
			name: name,
			avatar: getAvatarUrl(id),
			email: generateEmailFromName(name),
			role: generateRandomRole(),
			status: generateRandomStatus(),
		};
	}
});

export function Primary() {
	const [data, setData] = React.useState<User[]>(initialData);

	const columns = React.useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: "avatar",
				header: "",
				cell: ({ row }) => (
					<Avatar>
						<AvatarImage src={row.getValue("avatar")} alt={row.getValue("name")} />
						<AvatarFallback>{(row.getValue("name") as string).charAt(0)}</AvatarFallback>
					</Avatar>
				),
			},
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
			},
			{
				accessorKey: "email",
				header: "Email",
				cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
			},
			{
				accessorKey: "role",
				header: "Role",
				cell: ({ row }) => {
					const role = row.getValue("role") as User["role"];
					return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>;
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const status = row.getValue("status") as User["status"];
					return <Badge variant={status === "active" ? "default" : "outline"}>{status}</Badge>;
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<div onClick={(e) => e.stopPropagation()}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								console.log("User:", row.original);
							}}
						>
							View
						</Button>
					</div>
				),
			},
		],
		[]
	);

	return (
		<div className="relative w-full">
			<DataTable
				columns={columns}
				data={data}
				getRowId={(row) => row.id}
				rowSelectable
				stickyHeader
				// Optional:
				// onSelectionChange={(selected) => console.log("Selected users:", selected)}
			/>
		</div>
	);
}
