import type { AvatarContextProps } from "../types";
import { createTypedContext } from "@/utils/createTypedContext/createTypedContext";


const { Context: AvatarContext, useContext: useAvatarContext } =
  createTypedContext<AvatarContextProps, "Avatar">({
    name: "Avatar",
    errorMessage: (component) => `${component} must be used within Avatar.Root`,
  });

export { AvatarContext, useAvatarContext };