import { forwardRef } from "react";
import type { CheckboxItemProps } from "../types";
import { useControllableState } from "../hooks/useControllableState";
import { ItemIndicatorContext } from "../indicator/context";
import { Item } from "../item";

export const CheckboxItem = forwardRef<HTMLElement, CheckboxItemProps>(function CheckboxItem(
    { asChild, checked, defaultChecked, onCheckedChange, disabled, closeOnSelect = false, textValue, children, ...props },
    ref
) {
    const [isChecked, setIsChecked] = useControllableState<boolean>({
        value: checked,
        defaultValue: defaultChecked ?? false,
        onChange: onCheckedChange,
    });

    return (
        <ItemIndicatorContext.Provider value={{ checked: !!isChecked, disabled }}>
            <Item
                {...props}
                ref={ref}
                asChild={asChild}
                disabled={disabled}
                closeOnSelect={closeOnSelect}
                textValue={textValue}
                role="menuitemcheckbox"
                aria-checked={!!isChecked}
                data-state={isChecked ? "checked" : "unchecked"}
                onSelect={(e) => {
                    if (disabled) return;
                    setIsChecked(!isChecked);
                    if (!closeOnSelect) e.preventDefault();
                }}
            >
                {children}
            </Item>
        </ItemIndicatorContext.Provider>
    );
});