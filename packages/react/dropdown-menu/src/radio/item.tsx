import { forwardRef } from "react";
import type { RadioItemProps } from "../types";
import { useRadioGroupCtx } from "./useRadioGroupContext";
import { ItemIndicatorContext } from "../indicator/context";
import { Item } from "../item";

export const RadioItem = forwardRef<HTMLElement, RadioItemProps>(function RadioItem(
    { asChild, value, disabled, closeOnSelect = false, textValue, children, ...props },
    ref
) {
    const group = useRadioGroupCtx();
    const isDisabled = disabled || group.disabled;
    const checked = group.value === value;

    return (
        <ItemIndicatorContext.Provider value={{ checked, disabled: isDisabled }}>
            <Item
                {...props}
                ref={ref}
                asChild={asChild}
                disabled={isDisabled}
                closeOnSelect={closeOnSelect}
                textValue={textValue}
                role="menuitemradio"
                aria-checked={checked}
                data-state={checked ? "checked" : "unchecked"}
                onSelect={(e) => {
                    if (isDisabled) return;
                    group.setValue(value);
                    if (!closeOnSelect) e.preventDefault();
                }}
            >
                {children}
            </Item>
        </ItemIndicatorContext.Provider>
    );
});
