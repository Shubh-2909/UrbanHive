import React from "react";

const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gray-200 p-6 rounded-lg">
        <h1 className="text-center">Loading...</h1>
      </div>
    </div>
  );
};

export default Loader;

export const Skeleton = ({ width = "unset", length = 3 }) => {
  const skeletions = Array.from({ length }, (v, idx) => (
    <div key={idx} className="skeleton-shape"></div>
  ));

  return (
    <div className="skeleton-loader" style={{ width }}>
      {skeletions}
    </div>
  );
};
