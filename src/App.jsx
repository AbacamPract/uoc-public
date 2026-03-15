import './App.css';
import VisualizationSection from './components/VisualizationSection';

import cartogramText from './assets/text-cartogram.html?raw';
import boxplotText from './assets/text-plotbox.html?raw';
import horizonChartText from './assets/text-horizon-graph.html?raw';

function App() {
  return (
    <div className="App">
      <h1>Visualización de Datos - PEC2</h1>
      
      <VisualizationSection title="Cartograma" text={cartogramText} visualization="cartogram" />

      <VisualizationSection title="Boxplot" text={boxplotText} visualization="boxplot" />

      <VisualizationSection title="Horizon Chart" text={horizonChartText} visualization="horizon-chart" />
    </div>
  );
}

export default App;
