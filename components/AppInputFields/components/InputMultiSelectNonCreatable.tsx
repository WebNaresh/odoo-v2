"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import Select from "react-select";
import { InputFieldProps } from "../InputField";

const InputMultiSelectNonCreatable: React.FC<InputFieldProps> = (props) => {
  const {
    label,
    name,
    options,
    className,
    placeholder,
    disabled,
    Icon,
    required,
    description,
  } = props;
  const form = useFormContext();

  if (!form) {
    throw new Error(
      "InputMultiSelectNonCreatable must be used within a FormProvider"
    );
  }

  // Custom styles for react-select to match the design system
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "44px",
      border: state.isFocused
        ? "2px solid var(--primary)"
        : "2px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: state.isFocused
        ? "0 0 0 2px var(--ring)"
        : "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "&:hover": {
        borderColor: state.isFocused ? "var(--primary)" : "var(--input)",
      },
      paddingLeft: "40px",
      paddingRight: "12px",
      backgroundColor: "var(--background)",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "2px 0",
      paddingLeft: "0",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "var(--accent)",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      margin: "2px",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "var(--accent-foreground)",
      fontSize: "14px",
      fontWeight: "500",
      padding: "4px 6px",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "var(--accent-foreground)",
      borderRadius: "0 var(--radius) var(--radius) 0",
      "&:hover": {
        backgroundColor: "var(--destructive)",
        color: "var(--destructive-foreground)",
      },
    }),
    input: (provided: any) => ({
      ...provided,
      color: "var(--foreground)",
      fontSize: "14px",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "var(--muted-foreground)",
      fontSize: "14px",
      opacity: "0.5",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : state.isFocused
          ? "var(--accent)"
          : "transparent",
      color: state.isSelected
        ? "var(--primary-foreground)"
        : "var(--foreground)",
      "&:hover": {
        backgroundColor: state.isSelected ? "var(--primary)" : "var(--accent)",
      },
      fontSize: "14px",
      padding: "10px 12px",
      cursor: "pointer",
      position: "relative",
      "&:before": state.isSelected
        ? {
            content: "'✓'",
            position: "absolute",
            right: "12px",
            color: "var(--primary-foreground)",
            fontWeight: "bold",
          }
        : {},
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      zIndex: 50,
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "200px",
      padding: "4px",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "var(--muted-foreground)",
      "&:hover": {
        color: "var(--primary)",
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "var(--muted-foreground)",
      "&:hover": {
        color: "var(--destructive)",
      },
    }),
  };

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full max-w-[400px]",
            "group transition-all duration-300 ease-in-out",
            className
          )}
        >
          <FormLabel
            className={cn(
              "text-sm font-medium",
              "transition-colors duration-200",
              "group-hover:text-primary",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="flex items-start relative w-full">
              {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10 transition-colors group-hover:text-primary pointer-events-none">
                  <Icon size={20} />
                </div>
              )}
              <Select
                {...field}
                className="w-full"
                value={(() => {
                  const fieldValues = field.value || [];
                  console.log("🔄 Field values for display:", fieldValues);

                  // If fieldValues are already option objects, return them directly
                  if (Array.isArray(fieldValues) && fieldValues.length > 0) {
                    const firstItem = fieldValues[0];
                    if (
                      firstItem &&
                      typeof firstItem === "object" &&
                      "value" in firstItem &&
                      "label" in firstItem
                    ) {
                      console.log("🔄 Field values are already option objects");
                      return fieldValues;
                    }
                  }

                  // Convert values to option objects for display
                  if (!options || !Array.isArray(options)) {
                    console.log("🔄 No options available for conversion");
                    return [];
                  }

                  const selectedOptions = fieldValues
                    .map((value: any) => {
                      const option = options.find(
                        (opt: any) => opt.value === value
                      );
                      console.log(
                        `🔄 Finding option for value ${value}:`,
                        option
                      );
                      return option;
                    })
                    .filter(Boolean);

                  console.log(
                    "🔄 Selected options for display:",
                    selectedOptions
                  );
                  return selectedOptions;
                })()}
                placeholder={placeholder}
                isMulti={true}
                name={name}
                options={options}
                instanceId={`select-${name}`}
                onChange={(newValue: any) => {
                  console.log(
                    "🔄 React-select onChange called with:",
                    newValue
                  );
                  // Ensure we always pass an array for multi-select
                  const selectedValues = newValue || [];
                  console.log("🔄 Selected values:", selectedValues);

                  // Check if the field name suggests we need just IDs or full objects
                  // Fields ending with "Ids" expect just the values (strings)
                  // Other fields expect full objects with value and label
                  const expectsJustIds =
                    name.toLowerCase().includes("ids") ||
                    name.toLowerCase().includes("id");

                  if (expectsJustIds) {
                    // Extract just the values for fields that expect IDs
                    const extractedValues = selectedValues.map((item: any) => {
                      if (item && typeof item === "object" && "value" in item) {
                        return item.value;
                      }
                      return item;
                    });
                    console.log(
                      "🔄 Storing extracted values for ID field:",
                      extractedValues
                    );
                    field.onChange(extractedValues);
                  } else {
                    // Store the full option objects for fields that expect objects
                    console.log(
                      "🔄 Storing full option objects:",
                      selectedValues
                    );
                    field.onChange(selectedValues);
                  }
                }}
                styles={customStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                menuShouldScrollIntoView={false}
                isDisabled={disabled}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                isClearable={true}
                // Performance optimizations
                filterOption={(option: any, inputValue: string) => {
                  // Fast case-insensitive filtering
                  return option.label
                    .toLowerCase()
                    .includes(inputValue.toLowerCase());
                }}
                noOptionsMessage={({ inputValue }) =>
                  inputValue
                    ? `No services found matching "${inputValue}"`
                    : "No services available"
                }
                loadingMessage={() => "Loading services..."}
                // Improve performance for large lists
                maxMenuHeight={300}
                menuPlacement="auto"
                // Reduce re-renders
                blurInputOnSelect={false}
                captureMenuScroll={false}
              />
            </div>
          </FormControl>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          <FormMessage className="text-xs font-medium text-destructive mt-1 animate-in fade-in-50" />
        </FormItem>
      )}
    />
  );
};

export default InputMultiSelectNonCreatable;
