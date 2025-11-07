
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const FullPageSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-[100]">
       <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-light"></div>
    </div>
  );
};

export default Spinner;
   