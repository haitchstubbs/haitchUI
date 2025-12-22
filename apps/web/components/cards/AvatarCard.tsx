import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";

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