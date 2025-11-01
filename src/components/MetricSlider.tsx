import { Slider } from "@/components/ui/slider";

interface MetricSliderProps {
  metric: string;
  value: number;
  onChange: (value: number) => void;
  isInverse?: boolean;
}

export const MetricSlider = ({ metric, value, onChange, isInverse }: MetricSliderProps) => {
  const displayValue = isInverse ? 100 - value : value;

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{metric}</span>
        <span className="font-semibold text-primary">{Math.round(displayValue)}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={0}
        max={100}
        step={1}
        className="cursor-pointer"
      />
    </div>
  );
};
