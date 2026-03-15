import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { getProjection, getPathGenerator, getScales, createNodes, runSimulation } from './d3-cartogram.js';

const Legend = ({ colorScale, maxVal }) => {
  if (!colorScale) return null;

  const legendWidth = 300;
  const legendHeight = 20;

  const gradientId = "color-gradient";

  return (
    <div style={{ position: 'absolute', bottom: '120px', right: '20px', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', boxShadow: '0 0 5px rgba(0,0,0,0.2)' }}>
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Incremento de precio </span>
      <svg width={legendWidth} height={legendHeight} style={{ marginTop: '5px' }}>
        <defs>
          <linearGradient id={gradientId}>
            {d3.range(0, 1.01, 0.1).map(i => (
              <stop key={i} offset={`${i * 100}%`} stopColor={colorScale(maxVal * i)} />
            ))}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={legendWidth} height={legendHeight} fill={`url(#${gradientId})`} stroke="#333" strokeWidth="0.5" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '5px' }}>
        <span>0</span>
        <span>{maxVal.toFixed(2)}</span>
      </div>
    </div>
  );
};


const Cartogram = () => {
  const [data, setData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    // CAMBIO TÉCNICO: Ruta compatible con GitHub Pages y Vite
    const jsonPath = `${import.meta.env.BASE_URL}data/cartogram_price_increase_iran_war_2026.json`;
    
    d3.json(jsonPath).then(topoData => {
      const geojson = topojson.feature(topoData, topoData.objects.provinces);
      setData(geojson);
      const firstProv = geojson.features.find(f => f.properties.datos_gasolina);
      if (firstProv) setSelectedProduct(Object.keys(firstProv.properties.datos_gasolina)[0]);
    }).catch(err => console.error("Error al cargar datos:", err));
  }, []);

  const projection = useMemo(() => (data ? getProjection(data) : null), [data]);
  const path = useMemo(() => (projection ? getPathGenerator(projection) : null), [projection]);

  const { radiusScale, colorScale, maxVal } = useMemo(() => {
    if (!data || !selectedProduct) return { radiusScale: null, colorScale: null, maxVal: 0 };
    return getScales(data, selectedProduct);
  }, [data, selectedProduct]);


  const nodes = useMemo(() => {
    if (!data || !selectedProduct || !path || !radiusScale || !colorScale) return [];
    
    const initialNodes = createNodes(data, path, radiusScale, colorScale, selectedProduct);
    return runSimulation(initialNodes);

  }, [data, selectedProduct, path, radiusScale, colorScale]);

  if (!data || !path) return <p>Cargando mapa...</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', position: 'relative' }}>
      <h3><strong>Visualización: Incremento PVP por Provincia desde el 28 de febrero de 2026 (inicio guerra contra Irán)</strong></h3> 
        <ul>
            <li><strong>Qué se representa: </strong>Representa el incremento en los precios del combustible, desde el primer día de la guerra de EEUU, Israel e Irán.</li>
            <li><strong>Qué demuestra: </strong>Que los precios han aumentado significativamente en diferentes provincias.</li>
            <li><strong>Descubrimiento buscado: Qué provincias tienen mayores incrementos en los precios del combustible a día de hoy?</strong></li>
            <li><strong>Explicación de porqué esta técnica consigue el objetivo:</strong> 
                <ul>
                    <li>En el cartograma representamos el incremento de precios comparando el día de hoy con el 28/02/2026.</li>
                    <li>Con el mapa de dorling, el usuario reconoce el país y puede extraer patrones en el comportamiento del precio. </li>
                    <li>El tamaño y el color de cada burbuja está en función del incremento que ha sufrido el combustible desde la fecha de inicio de la guerra.</li>
                    <li>Permite cambiar de combustible.</li>
                    <li>Tiene etiquetas que te permiten ver los valores exactos.</li>
                </ul>
            </li>
            <li>
              <strong>Fórmula utilizada:</strong>
              <div style={{ fontStyle: 'italic', margin: '5px 0', fontFamily: 'monospace', fontSize: '14px' }}>
                (PVP
                <sub>2026-03-12</sub> - PVP
                <sub>2026-02-28</sub>) / PVP
                <sub>2026-02-28</sub>
              </div>
            </li>
            <li><strong>Fuente de datos:</strong> <a href="https://catalogodatos.cnmc.es/dataset/ds_14042_1/resource/e63f5db2-0433-4b72-8647-e5a4c74f1876" target="_blank">CNMC Data</a></li>
        </ul>
      <svg viewBox="0 0 800 600" style={{ width: '100%', height: 'auto' }}>
        <g className="base-map">
          {data.features.map((feature, i) => (
            <path
              key={`path-${i}`}
              d={path(feature)}
              fill="#eee"
              stroke="#bbb"
              strokeWidth="0.5"
            />
          ))}
        </g>
        
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill={node.color}
              stroke="#444"
              opacity={0.8}
            >
              <title>{`${node.name}: ${node.val} %`}</title>
            </circle>
            {node.r > 10 && (
              <text x={node.x} y={node.y} fontSize="8" textAnchor="middle" dy=".3em" fill="#000" style={{pointerEvents: 'none'}}>
                {node.name}
              </text>
            )}
          </g>
        ))}
      </svg>

      <Legend colorScale={colorScale} maxVal={maxVal} />

      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '5px', boxShadow: '0 0 5px rgba(0,0,0,0.2)' }}>
        {Object.keys(data.features[0].properties.datos_gasolina).map(p => (
          <button 
            key={p} 
            onClick={() => setSelectedProduct(p)}
            style={{ 
              padding: '8px 12px',
              margin: '0 5px',
              cursor: 'pointer',
              border: selectedProduct === p ? '2px solid #333' : '1px solid #ccc',
              borderRadius: '5px',
              background: selectedProduct === p ? '#ddd' : 'white',
              fontWeight: selectedProduct === p ? 'bold' : 'normal'
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Cartogram;