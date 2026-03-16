import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { horizon } from './d3-horizon-chart';
import rawData from '../../assets/data/Horizont_chart_price_evo_2026.json';

const HorizonChart = () => {
    const chartRef = useRef(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [provinces, setProvinces] = useState([]);

    const dataByProvince = useMemo(() => {
        if (!rawData) return new Map();
        
        const groupedData = d3.group(rawData, d => d.provincia, d => d.producto);

        const provincesList = Array.from(groupedData.keys());
        setProvinces(provincesList);
        if (!selectedProvince) {
            setSelectedProvince(provincesList[0]);
        }
        
        return groupedData;
    }, [rawData]);

    const filteredData = useMemo(() => {
        if (!selectedProvince || !dataByProvince.has(selectedProvince)) return [];

        const provinceData = dataByProvince.get(selectedProvince);
        const allSeries = [];

        for (const [product, values] of provinceData.entries()) {
            // Pasamos directamente el precio real sin restarle la media
            const seriesValues = values.map(d => [new Date(d.fecha).getTime(), d.precio]);
            
            allSeries.push({
                key: product,
                values: seriesValues
            });
        }
        return allSeries;
    }, [selectedProvince, dataByProvince]);

    useEffect(() => {
        if (!chartRef.current) return;
        
        d3.select(chartRef.current).selectAll('*').remove();

        if (!filteredData.length) return;

        const chartWidth = 1000;
        const chartHeight = 50;

        const container = d3.select(chartRef.current);

        container.selectAll('.horizon-row')
            .data(filteredData, d => d.key)
            .enter()
            .append('div')
            .attr('class', 'horizon-row')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('margin', '4px auto')
            .style('width', `${chartWidth}px`)
            .each(function(d) {
                const row = d3.select(this);
                const maxPrice = 2; // Límite de 2€ para que se generen correctamente las capas
                
                // Contenedor del Horizon Chart
                const chartContainer = row.append('div')
                    .style('position', 'relative')
                    .style('width', `${chartWidth}px`)
                    .style('height', `${chartHeight}px`)
                    .style('overflow', 'hidden')
                    .style('border-radius', '4px')
                    .style('box-shadow', '0 1px 3px rgba(0,0,0,0.2)');

                const chart = horizon()
                    .width(chartWidth)
                    .height(chartHeight)
                    .bands(4) // 4 bandas (0.50€ cada una al tener un límite de 2€)
                    .mode("offset")
                    .step(chartWidth / d.values.length) // Distribuye los datos en todo el ancho
                    .extent([0, maxPrice]) // Rango real para graficar la volatilidad
                    .title(d.key);
                
                chartContainer.datum(d.values.map(v => v[1])).call(chart);

                // Estilos para estructurar correctamente el canvas y el título
                chartContainer.select('canvas').style('display', 'block');
                chartContainer.select('.title')
                    .style('position', 'absolute')
                    .style('left', '10px')
                    .style('top', '50%')
                    .style('transform', 'translateY(-50%)')
                    .style('font-weight', 'bold')
                    .style('background', 'rgba(255, 255, 255, 0.7)')
                    .style('padding', '2px 6px')
                    .style('border-radius', '3px')
                    .style('font-size', '12px');
            });

        // Eje X (Fechas) en la parte inferior
        const xExtent = d3.extent(filteredData[0].values, d => d[0]);
        const xScale = d3.scaleTime()
            .domain(xExtent)
            .range([0, chartWidth]);

        const xAxisRow = container.append('div')
            .style('display', 'flex')
            .style('margin', '0 auto')
            .style('width', `${chartWidth}px`);

        const xAxisSvg = xAxisRow.append('svg')
            .attr('width', chartWidth)
            .attr('height', 30);

        xAxisSvg.append('g')
            .attr('transform', 'translate(0, 0)')
            .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%d/%m")))
            .selectAll('text')
            .style('font-size', '11px');

    }, [filteredData]);

    const legendColors = [
        { color: '#fee090', range: '0.00€ - 0.50€' },
        { color: '#fdae61', range: '0.50€ - 1.00€' },
        { color: '#f46d43', range: '1.00€ - 1.50€' },
        { color: '#d73027', range: '1.50€ - 2.00€' }
    ];
    
    return (
        <div style={{ fontFamily: 'sans-serif', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <h3><strong>Visualización: Evolución del precio de los combustibles en 2026</strong></h3>
            <ul>
                <li><strong>Qué se representa:</strong> Evolución de los precios de los combustibles.</li>
                <li><strong>Qué demuestra:</strong> La evolución de precio desde principio de año.</li>
                <li><strong>Descubrimiento buscado: ¿Cómo se han comportado los precios de los combustibles desde principios de año?</strong></li>
                <li><strong>Explicación de por qué esta técnica consigue el objetivo:</strong>
                    <ul>
                        <li>Permite comparar múltiples series temporales en un espacio compacto.</li>
                        <li>Resalta las tendencias y patrones de volatilidad a lo largo del tiempo.</li>
                    </ul>
                </li>
                <li><strong>Fuente de datos:</strong> <a href="https://catalogodatos.cnmc.es/dataset/ds_14042_1/resource/e63f5db2-0433-4b72-8647-e5a4c74f1876" target="_blank">CNMC Data</a></li>
            </ul>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="province-select">Selecciona una provincia: </label>
                <select id="province-select" onChange={(e) => setSelectedProvince(e.target.value)} value={selectedProvince || ''}>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', gap: '15px' }}>
                {legendColors.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                        <div style={{ width: '15px', height: '15px', backgroundColor: item.color, marginRight: '5px', borderRadius: '3px' }}></div>
                        <span>{item.range}</span>

                    
                    </div>
                ))}
                
            </div>

            <div ref={chartRef} className="horizon-chart"></div>


        </div>
    );
};

export default HorizonChart;
