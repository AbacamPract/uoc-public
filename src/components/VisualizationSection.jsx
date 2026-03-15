import React from 'react';
import TextComponent from './TextComponent';
import VisualizationComponent from './VisualizationComponent';

const VisualizationSection = ({ title, text, visualization }) => {
  return (
    <TextComponent>
      <div dangerouslySetInnerHTML={{ __html: text }} />
      <VisualizationComponent title={title} visualization={visualization} />
    </TextComponent>
  );
};

export default VisualizationSection;
