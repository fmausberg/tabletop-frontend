import { IoIosInformationCircleOutline } from "react-icons/io";
import { cn } from "../../utils/utils";

interface InformationTagProps {
  tooltipText: string;
  className?: string;
}

const InformationTag = ({ tooltipText, className }: InformationTagProps) => {
  return (
    <div className={cn("relative inline-block", className)}>
      <IoIosInformationCircleOutline className="text-textPrimary text-2xl hover:text-gray-600 transition-colors duration-200 cursor-pointer peer" />
      <div className="absolute hidden peer-hover:block right-0 top-full mt-2 w-64 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10">
        {tooltipText}
      </div>
    </div>
  );
};

export default InformationTag;
