
 // EXAMPLE
 const bubbleChartConfig = {
    svgElementId: 'bubble-chart-vis',
    width: 400,
    height: 400,
    margin: { left: 10, right: 10, top: 10, bottom: 10 },
    tooltipOffset: { x: 15, y: 50 }
};

const barChartConfig = {
    svgElement: '#bar-chart-vis',
    width: 800,
    height: 300,
    margin: {top: 30, right: 20, bottom: 50, left: 35},
    tooltipOffset: { x: 15, y: 50 }
};

const colorLegendConfig = {
    svgElement: '#color-legend-vis',
    width: 150,
    height: 240,
    margin: {top: 25, right: 10, bottom: 40, left: 15}
};

 const scatterPlotConfig = {
     svgElement: '#scatter-plot-vis',
     width: 700,
     height: 600,
     margin: {top: 40, right: 20, bottom: 60, left: 35},
     tooltipOffset: { x: 15, y: 50 }
 };

 const histogramConfig = {
     svgElement: '#histogram-chart-vis',
     width: 760,
     height: 40,
     margin: {top: 25, right: 20, bottom: 0, left: 35},
     contextMargin: {top: 25, right: 20, bottom: 0, left: 35}
 };

d3.csv('data/test_data.csv').then(data => {

    // Process the data
    data.forEach(e => {
        e.EU_Sales = +e.EU_Sales;
        e.Global_Sales = +e.Global_Sales;
        e.JP_Sales = +e.JP_Sales;
        e.NA_Sales = +e.NA_Sales;
        e.Other_Sales = +e.Other_Sales;
        e.Rating = +e.Rating;
        e.Votes = +e.Votes;
        e.Year = +e.Year;
    });
    console.log(data);

    let selectedElements = [];
    let groupBy = 'Genre';

    const dispatch = d3.dispatch('yearRangeChanged', 'selection-change', 'reset-selection');
    let computedData = computeRollUpData(data);
    // Ref: - https://observablehq.com/@d3/color-schemes
    //      - https://www.learnui.design/tools/data-color-picker.html
    const colorPallette = ["#003f5c","2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600","#005c02","#327c2f","#14c990","#383838"];
    const colorMap = new Map();

    const barChart = new StackedBarChart(barChartConfig, data, dispatch);
    const bubbleChart = new BubbleChart(bubbleChartConfig, data, dispatch);
    const colorLegend = new ColorLegend(colorLegendConfig, data, dispatch);
    const scatterPlot = new ScatterPlot(scatterPlotConfig, colorMap, groupBy, data);
    const histogram = new HistogramChart(histogramConfig, dispatch, data);

    // Region Color Legend
    d3.select('#region-legend').attr('width', colorLegendConfig.width).attr('height', '80px');
    d3.select('#region-legend').append("circle").attr("cx", 15).attr("cy", 20).attr("r", 6).style("fill", "#edd1d1")
    d3.select('#region-legend').append("circle").attr("cx", 15).attr("cy", 40).attr("r", 6).style("fill", "#d1e0ed")
    d3.select('#region-legend').append("circle").attr("cx", 15).attr("cy", 60).attr("r", 6).style("fill", "#d1edd5")
    // d3.select('#region-legend').append("text").attr("x", 10).attr("y", 18).text("Region").style("font-size", "16px").style("font-weight", "700").attr("alignment-baseline", "middle")
    d3.select('#region-legend').append("text").attr("x", 26).attr("y", 20).text("North America").style("font-size", "15px").attr("alignment-baseline", "middle")
    d3.select('#region-legend').append("text").attr("x", 26).attr("y", 40).text("Europe").style("font-size", "15px").attr("alignment-baseline", "middle")
    d3.select('#region-legend').append("text").attr("x", 26).attr("y", 60).text("Japan").style("font-size", "15px").attr("alignment-baseline", "middle")

    // -----

    updateData(groupBy);

    d3.select('#groupBySelect').on('change', e => {
        updateData(document.getElementById('groupBySelect').value);
        dispatch.call('reset-selection', e, null);
    });

    dispatch.on('selection-change', element => {
        const id = element.id + element.parent.id;
        if(selectedElements.includes(id)) {
            selectedElements.splice(selectedElements.indexOf(id), 1);
        } else {
            selectedElements.push(id);
        }
        bubbleChart.selection = selectedElements;
        bubbleChart.updateVis();
        barChart.selection = selectedElements;
        barChart.updateVis();
    });

    dispatch.on('reset-selection', d => {
        selectedElements = [];
        bubbleChart.selection = selectedElements;
        bubbleChart.updateVis();
        barChart.selection = selectedElements;
        barChart.updateVis();
    });

    dispatch.on('yearRangeChanged', selection => {
        let filteredData = data.filter(d => d.Year >= selection.start && d.Year <= selection.end);
        scatterPlot.data = filteredData
        computedData = computeRollUpData(filteredData);
        updateData(groupBy);
    });


    // Helpers

    function updateData(value) {
        groupBy = value;
        const key = value.toLowerCase();
        barChart.NASales = computedData[key + 'NASales'];
        barChart.EUSales = computedData[key + 'EUSales'];
        barChart.JPSales = computedData[key + 'JPSales'];
        barChart.WorldSales = computedData[key + 'WorldSales'];
        barChart.xValue = d => d[value];
        barChart.updateVis();

        updateColorMap(computedData[key + 'NASales']);
        colorLegend.colorMap = colorMap;
        colorLegend.sales = computedData[key + 'WorldSales'];
        colorLegend.updateVis();

        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = computedData[key + 'NASales'];
        bubbleChart.EUSales = computedData[key + 'EUSales'];
        bubbleChart.JPSales = computedData[key + 'JPSales'];
        bubbleChart.groupBy = value;
        bubbleChart.updateVis();

        updateScatterPlot();
    }

    function updateColorMap(salesData) {
        colorMap.clear();
        salesData.forEach(g => {
            colorMap.set(g[0], colorPallette[colorMap.size]);
        });
        colorMap.set('World', '#faf8f7');
        colorMap.set('NorthAmerica', '#edd1d1');
        colorMap.set('Europe', '#d1e0ed');
        colorMap.set('Japan', '#d1edd5');
    }

    function computeRollUpData(data) {
        let result = {};
        result.genreNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Genre);
        result.genreEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Genre);
        result.genreJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Genre);
        result.genreWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Genre);
        result.publisherNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Publisher);
        result.publisherEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Publisher);
        result.publisherJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Publisher);
        result.publisherWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Publisher);
        return result;
    }

    function updateScatterPlot() {
        scatterPlot.colorMap = colorMap;
        scatterPlot.groupby = groupBy;
        scatterPlot.updateVis();
    }
});
