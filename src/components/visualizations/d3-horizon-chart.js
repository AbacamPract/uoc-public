import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisTop } from 'd3-axis';
import { extent } from 'd3-array';

export function horizon() {
  let colors = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#fee090", "#fdae61", "#f46d43", "#d73027"];
  let numBands = colors.length >> 1;
  let width = 1000;
  let height = 30;
  let offsetX = 0;
  let step = 1;
  let spacing = 0;
  let mode = "offset";
  let axis = null;
  let title = null;
  let extentValue = null;
  let xScale = null;
  let yScale = scaleLinear().range([0, height]);
  let canvas = null;

  function chart(selection) {
    selection.each(function(data) {
      const nodeSelection = select(this);
      const totalStep = step + spacing;
      
      canvas = nodeSelection.select("canvas");
      if (canvas.empty()) {
        canvas = nodeSelection.append("canvas");
        nodeSelection.append("span").attr("class", "title");
        nodeSelection.append("span").attr("class", "value");
      }
      
      canvas.attr("width", width).attr("height", height);
      nodeSelection.select(".title").text(title);

      const context = canvas.node().getContext("2d");
      const dataExtent = extentValue || extent(data);
      const maxVal = Math.max(-dataExtent[0], dataExtent[1]);
      
      yScale.domain([0, maxVal]);
      axis = axisTop(xScale).ticks(5);
      
      context.clearRect(0, 0, width, height);

      const startIdx = ~~Math.max(0, -(offsetX / totalStep));
      const endIdx = ~~Math.min(data.length, startIdx + width / totalStep);

      if (startIdx > data.length) return;

      let hasNegative = false;
      for (let i = 0; i < numBands; i++) {
        context.fillStyle = colors[numBands + i];
        const bandY = (i + 1 - numBands) * height;
        yScale.range([numBands * height + bandY, bandY]);

        for (let j = startIdx; j < endIdx; j++) {
          const val = data[j];
          if (val <= 0) {
            hasNegative = true;
          } else if (val !== undefined) {
            context.fillRect(offsetX + j * totalStep, yScale(val), step, yScale(0) - yScale(val));
          }
        }
      }

      if (hasNegative) {
        context.save();
        if (mode === "offset") {
          context.translate(0, height);
          context.scale(1, -1);
        }
        for (let i = 0; i < numBands; i++) {
          context.fillStyle = colors[numBands - 1 - i];
          const bandY = (i + 1 - numBands) * height;
          yScale.range([numBands * height + bandY, bandY]);

          for (let j = startIdx; j < endIdx; j++) {
            const val = data[j];
            if (val < 0) {
              context.fillRect(offsetX + j * totalStep, yScale(-val), step, yScale(0) - yScale(-val));
            }
          }
        }
        context.restore();
      }
    });
  }

  chart.axis = function(x) {
    if (!arguments.length) return axis;
    axis = x;
    return chart;
  };

  chart.canvas = function(x) {
    if (!arguments.length) return canvas;
    canvas = x;
    return chart;
  };

  chart.colors = function(x) {
    if (!arguments.length) return colors;
    colors = x;
    numBands = colors.length >> 1;
    return chart;
  };

  chart.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return chart;
  };

  chart.bands = function(x) {
    if (!arguments.length) return numBands;
    numBands = x;
    const mid = colors.length >> 1;
    const start = mid - numBands;
    const end = mid + numBands;
    colors = colors.slice(start, end);
    return chart;
  };

  chart.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return chart;
  };

  chart.step = function(x) {
    if (!arguments.length) return step;
    step = x;
    return chart;
  };

  chart.spacing = function(x) {
    if (!arguments.length) return spacing;
    spacing = x;
    return chart;
  };

  chart.title = function(x) {
    if (!arguments.length) return title;
    title = x;
    return chart;
  };

  chart.mode = function(x) {
    if (!arguments.length) return mode;
    mode = x;
    return chart;
  };

  chart.extent = function(x) {
    if (!arguments.length) return extentValue;
    extentValue = x;
    return chart;
  };

  chart.offsetX = function(x) {
    if (!arguments.length) return offsetX;
    offsetX = x;
    return chart;
  };
  
  chart.indexExtent = function() {
      const totalStep = step + spacing;
      const start = -offsetX / totalStep;
      const end = start + width / totalStep;
      return [start, end];
  }

  return chart;
}