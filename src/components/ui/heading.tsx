import React from "react";

interface HeadingProps {
  children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ children }) => {
  return <h1 className="text-3xl font-bold mb-6">{children}</h1>;
};

export default Heading;