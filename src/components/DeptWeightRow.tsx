import { Slider } from "@/components/ui/slider";

interface DeptWeightRowProps {
  dept: string;
  weight: number;
  onChange: (value: number) => void;
}

export const DeptWeightRow = ({ dept, weight, onChange }: DeptWeightRowProps) => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{dept}</span>
        <span className="font-semibold text-muted-foreground">{Math.round(weight)}%</span>
      </div>
      <Slider
        value={[weight]}
        onValueChange={(vals) => onChange(vals[0])}
        min={0}
        max={100}
        step={1}
        className="cursor-pointer"
      />
    </div>
  );
};
