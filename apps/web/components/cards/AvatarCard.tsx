import { Avatar, AvatarFallback, AvatarImage } from "@haitch/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@haitch/ui";

export function AvatarCard() {
    return  (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Profile Pictures & User Avatars</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-center">
                <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>HS</AvatarFallback>
                </Avatar>
            </CardContent>
        </Card>
    );
}