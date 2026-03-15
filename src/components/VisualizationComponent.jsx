import React, { Suspense, useMemo } from 'react';

const Cartogram = React.lazy(() => import('./visualizations/Cartogram'));
const Boxplot = React.lazy(() => import('./visualizations/Boxplot'));
const HorizonChart = React.lazy(() => import('./visualizations/HorizonChart'));

const VisualizationComponent = ({ title, visualization }) => {
  const vizElement = useMemo(() => {
    switch (visualization) {
      case 'cartogram':
        return <Cartogram />;
      case 'boxplot':
        return <Boxplot />;
      case 'horizon-chart':
        return <HorizonChart />;
      default:
        return null;
    }
  }, [visualization]);

  return (
    <div>
      <h3>Ejemplo de {title}</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        <Suspense fallback={<div>Cargando visualización...</div>}>
          {vizElement}
        </Suspense>
      </div>
    </div>
  );
};

export default VisualizationComponent;
