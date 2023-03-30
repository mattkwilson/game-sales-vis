
 // EXAMPLE
 const bubbleChartConfig = {
    svgElementId: 'bubble-chart-vis',
    width: 500,
    height: 400,
    margin: { left: 10, right: 10, top: 10, bottom: 10 },
    tooltipOffset: { x: 15, y: 50 }
};

const barChartConfig = {
    svgElement: '#bar-chart-vis',
    width: 1000,
    height: 200,
    margin: {top: 25, right: 20, bottom: 40, left: 35},
    tooltipOffset: { x: 15, y: 50 }
};

const colorLegendConfig = {
    svgElement: '#color-legend-vis',
    width: 250,
    height: 200,
    margin: {top: 25, right: 10, bottom: 40, left: 15}
};

 const scatterPlotConfig = {
     svgElement: '#scatter-plot-vis',
     width: 445,
     height: 300,
     margin: {top: 25, right: 20, bottom: 20, left: 35}
 };

 const histogramConfig = {
     svgElement: '#histogram-chart-vis',
     width: 400,
     height: 20,
     margin: {top: 25, right: 20, bottom: 20, left: 35},
     contextMargin: {top: 25, right: 20, bottom: 20, left: 35}
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
        result.platformsNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Platforms);
        result.platformsEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Platforms);
        result.platformsJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Platforms);
        result.platformsWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Platforms);
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
