import { cn } from "../../utils/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "secondary" | "destructive";
}

const Button = ({
  color = "primary",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-formsDesigns-focus focus:ring-offset-2 transition-colors duration-300",
        {
          'bg-primaryButton text-primaryButton-text hover:bg-primaryButton-hover': color === 'primary',
          'bg-secondaryButton text-secondaryButton-text hover:bg-secondaryButton-hover': color === 'secondary',
          'bg-destructiveButton text-destructiveButton-text hover:bg-destructiveButton-hover': color === 'destructive',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
