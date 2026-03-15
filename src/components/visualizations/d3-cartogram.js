import * as d3 from 'd3';

const WIDTH = 600;
const HEIGHT = 600;

export function getProjection(data) {
  return d3.geoIdentity().reflectY(true).fitSize([WIDTH, HEIGHT], data);
}

export function getPathGenerator(projection) {
  return d3.geoPath(projection);
}

export function getScales(data, selectedProduct) {
  const fixedMaxVal = 35; // Valor máximo fijo para la escala
  const radiusScale = d3.scaleSqrt().domain([0, fixedMaxVal]).range([2, 25]);
  const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, fixedMaxVal]);
  return { radiusScale, colorScale, maxVal: fixedMaxVal };
}

export function createNodes(data, path, radiusScale, colorScale, selectedProduct) {
  const items = data.features.map(f => {
    const [x, y] = path.centroid(f);
    return {
      x,
      y,
      xOrig: x,
      yOrig: y,
      r: radiusScale(f.properties.datos_gasolina[selectedProduct] || 0),
      color: colorScale(f.properties.datos_gasolina[selectedProduct] || 0),
      name: f.properties.name,
      val: f.properties.datos_gasolina[selectedProduct] || 0
    };
  });
  return items;
}

export function runSimulation(nodes) {
  const simulation = d3.forceSimulation(nodes)
    .force("x", d3.forceX(d => d.xOrig).strength(0.2))
    .force("y", d3.forceY(d => d.yOrig).strength(0.2))
    .force("collide", d3.forceCollide(d => d.r + 1))
    .stop();

  for (let i = 0; i < 100; ++i) simulation.tick();

  return simulation.nodes();
}
