import { cn } from "@/viewModels/utils/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <nav className="flex flex-wrap space-x-2  mx-auto justify-between  space-y-2 gap-3 mb-5">
      {steps.map((label, i) => (
        <div key={i} className="flex m-0 items-center ">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-3 m-0 font-bold",
              i === currentStep
                ? "border-primary bg-primary text-primary-foreground "
                : "border-foreground "
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "ml-2 ",
              i === currentStep ? "text-primary font-bold" : ""
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </nav>
  );
};

export default StepIndicator;
