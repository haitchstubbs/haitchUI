import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@haitch/ui";

export function CarouselCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Carousel Card</CardTitle>
				<CardDescription>This is a card component that showcases a carousel.</CardDescription>
			</CardHeader>
			<CardContent className="relative flex flex-col items-center justify-center gap-4">
				{/** Carousel can't overflow card */}
				<div className="w-full max-w-[calc(100%-8rem)] ">
					<Carousel className="w-full max-w-full relative">
						<CarouselContent>
							{Array.from({ length: 5 }).map((_, index) => (
								<CarouselItem key={index}>
									<div className="p-1">
										<Card>
											<CardContent className="flex items-center justify-center w-full min-w-0 h-44">
												<span className="text-4xl font-semibold">{index + 1}</span>
											</CardContent>
										</Card>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>
			</CardContent>
		</Card>
	);
}
