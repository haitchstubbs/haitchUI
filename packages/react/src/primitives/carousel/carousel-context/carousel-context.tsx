import { createTypedContext } from "@/utils/createTypedContext";
import type { CarouselContextType } from "../types";

const { Context: CarouselContext, useContext: useCarouselContext } = createTypedContext<CarouselContextType, "CarouselContext">({
	name: "CarouselContext",
	errorMessage: (component) => `${component} must be used within Carousel.Root`,
});
export { CarouselContext, useCarouselContext };