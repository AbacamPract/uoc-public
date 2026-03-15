import React from 'react';

const TextComponent = ({ title, children }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default TextComponent;
