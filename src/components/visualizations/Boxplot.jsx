import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import rawData from '../../assets/data/boxplot_price_by_product_iran_war_2026.json';

const MARGIN = { top: 30, right: 30, bottom: 80, left: 60 };

const Boxplot = ({ width, height }) => {
  const axesRef = useRef(null);

  // 1. Procesamiento y cálculo de estadísticas
  const boxplotData = useMemo(() => {
    return rawData.map(group => {
      const values = group.y.sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const interQuantileRange = q3 - q1;
      const min = q1 - 1.5 * interQuantileRange;
      const max = q3 + 1.5 * interQuantileRange;
      
      const outliers = values.filter((d) => d < min || d > max);
      const whiskerMin = d3.min(values.filter((d) => d >= min));
      const whiskerMax = d3.max(values.filter((d) => d <= max));

      // Creamos la nube de puntos con un offset aleatorio (Jitter) para evitar solapamientos
      const points = values.map((val) => ({
        value: val,
        jitterOffset: (Math.random() - 0.5) * 0.5 // Distribuidos en el 50% del ancho de la caja
      }));

      return {
        x: group.x,
        stats: { q1, median, q3, whiskerMin, whiskerMax },
        outliers,
        points,
      };
    });
  }, []);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // 2. Escalas
  const maxVal = d3.max(boxplotData.flatMap(d => [...d.outliers, d.stats.whiskerMax]));
  const minVal = d3.min(boxplotData.flatMap(d => [...d.outliers, d.stats.whiskerMin]));

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([minVal * 0.98, maxVal * 1.02]).range([boundsHeight, 0]);
  }, [boxplotData, height]);

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsWidth])
      .domain(boxplotData.map((d) => d.x))
      .padding(0.4);
  }, [boxplotData, width]);

  // 3. Renderizado de ejes y rejilla
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll('*').remove();

    // Eje Y con rejilla
    const yAxisGenerator = d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d.toFixed(2)}€`);
    svgElement
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxisGenerator)
      .style('font-size', '14px');

    svgElement.selectAll('.y-axis .tick line')
      .attr('x2', boundsWidth)
      .attr('stroke-width', 0.5)
      .attr('stroke', '#ccc');
    svgElement.selectAll('.y-axis .domain').remove();


    // Eje X
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append('g')
      .attr('transform', `translate(0, ${boundsHeight})`)
      .call(xAxisGenerator)
      .selectAll('text')
      .style('font-size', '12px')
      .style('text-anchor', 'middle');
    
    svgElement.selectAll('.x-axis .domain, .x-axis .tick line').remove();

  }, [xScale, yScale, boundsHeight, boundsWidth]);

  // 4. Cajas y Outliers
  const allShapes = boxplotData.map((d, i) => {
    const { q1, median, q3, whiskerMin, whiskerMax } = d.stats;

    // Posiciones calculadas
    const yQ1 = yScale(q1);
    const yMedian = yScale(median);
    const yQ3 = yScale(q3);
    const yWhiskerMin = yScale(whiskerMin);
    const yWhiskerMax = yScale(whiskerMax);
    const boxX = xScale(d.x);
    const boxWidth = xScale.bandwidth();

    return (
      <g key={i}>
        {/* Bigotes */}
        <line
          x1={boxX + boxWidth / 2}
          x2={boxX + boxWidth / 2}
          y1={yWhiskerMax}
          y2={yQ3}
          stroke="#4F6272"
        />
        <line
          x1={boxX + boxWidth / 2}
          x2={boxX + boxWidth / 2}
          y1={yWhiskerMin}
          y2={yQ1}
          stroke="#4F6272"
        />

        {/* Caja */}
        <rect
          x={boxX}
          y={yQ3}
          width={boxWidth}
          height={yQ1 - yQ3}
          fill="#B7C3D0"
          stroke="#4F6272"
        />

        {/* Mediana */}
        <line
          x1={boxX}
          x2={boxX + boxWidth}
          y1={yMedian}
          y2={yMedian}
          stroke="#5f5e5e"
          strokeWidth={2}
        />

        {/* Nube de puntos (Todos los datos con Jitter) */}
        {d.points.map((pt, j) => (
          <circle
            key={j}
            cx={boxX + boxWidth / 2 + pt.jitterOffset * boxWidth}
            cy={yScale(pt.value)}
            r={1.5}
            fill="#a0aec0"
            fillOpacity={0.15}
          />
        ))}

        {/* Valores Extremos (Outliers) */}
        {d.outliers.map((outlier, j) => (
          <circle
            key={`outlier-${j}`}
            cx={boxX + boxWidth / 2}
            cy={yScale(outlier)}
            r={3}
            fill="#5f5e5e"
            fillOpacity={0.8}
          />
        ))}
      </g>
    );
  });

  return (
    <div style={{ fontFamily: 'sans-serif', position: 'relative' }}>
      <h3><strong>Visualización: Distribución del PVP del combustible en España desde enero de 2026</strong></h3> 
        <ul>
            <li><strong>Qué se representa:</strong> Visión general de la distribución de los precios del combustible.</li>
            <li><strong>Qué demuestra:</strong> Que los combustibles tienen distintos precios y que tienen distintos comportamiento.</li>
            <li><strong>Descubrimiento buscado: ¿Los combustibles se comportan igual?</strong> </li>
            <li><strong>Explicación de por qué esta técnica consigue el objetivo:</strong> 
                <ul>
                    <li>La altura de las cajas, el largo de los bigotes y los outliers muestran la variabilidad de los precios. </li>
                    <li>Los gasoleos tienen una variabilidad mayor que las gasolinas, y que el gasoleo premium es el que más variabilidad tiene.</li>
                    <li>La nueve de puntos nos ayuda ha entender como se distribuyen los datos.</li>
                </ul>
            </li>
            <li><strong>Fuente de datos:</strong> <a href="https://catalogodatos.cnmc.es/dataset/ds_14042_1/resource/e63f5db2-0433-4b72-8647-e5a4c74f1876" target="_blank">CNMC Data</a></li>
        </ul>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* La rejilla y los ejes se dibujan primero */}
          <g ref={axesRef} />
          {/* Luego las formas del gráfico */}
          {allShapes}
        </g>
      </svg>
    </div>
  );
};


// Componente contenedor para pasar las dimensiones
const BoxPlotContainer = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Boxplot width={1200} height={500} />
      </div>
    );
}


export default BoxPlotContainer;
