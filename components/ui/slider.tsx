"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

function Slider({
  className,
  value,
  defaultValue = [0, 100],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue
  );

  const currentValue = value || internalValue;

  const handleChange = (index: number, newValue: number) => {
    const newValues = [...currentValue];
    newValues[index] = newValue;

    // Ensure values don't cross over
    if (index === 0 && (newValues[0] || 0) > (newValues[1] || 0)) {
      newValues[0] = newValues[1] || 0;
    }
    if (index === 1 && (newValues[1] || 0) < (newValues[0] || 0)) {
      newValues[1] = newValues[0] || 0;
    }

    setInternalValue(newValues);
    onValueChange?.(newValues);
  };

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute h-full bg-blue-600 rounded-full"
          style={{
            left: `${getPercentage(currentValue[0] || 0)}%`,
            width: `${
              getPercentage(currentValue[1] || 0) -
              getPercentage(currentValue[0] || 0)
            }%`,
          }}
        />
        {currentValue.map((val, index) => (
          <input
            key={index}
            type="range"
            min={min}
            max={max}
            step={step}
            value={val}
            onChange={(e) => handleChange(index, Number(e.target.value))}
            disabled={disabled}
            className="absolute top-0 h-1.5 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
            style={{
              zIndex: index + 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { Slider };
