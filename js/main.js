
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
    margin: {top: 60, right: 20, bottom: 50, left: 70},
    tooltipOffset: { x: 15, y: 50 }
};

const colorLegendConfig = {
    svgElement: '#color-legend-vis',
    width: 150,
    height: 175,
    margin: {top: 25, right: 10, bottom: 40, left: 15}
};

 const scatterPlotConfig = {
     svgElement: '#scatter-plot-vis',
     width: 700,
     height: 600,
     margin: {top: 80, right: 20, bottom: 60, left: 70},
     tooltipOffset: { x: 15, y: 20 },
     defaultMaxDomain: 40
 };

 const histogramConfig = {
     svgElement: '#histogram-chart-vis',
     width: 760,
     height: 120,
     margin: {top: 40, right: 30, bottom: 50, left: 50}
 };

 const defaultYearSelection = {
     start: 2015,
     end: 2022
 };

d3.csv('data/video_games.csv').then(data => {

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
    const colorPallette = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#bcbd22","#17becf"];
    const colorMap = new Map();

    const barChart = new StackedBarChart(barChartConfig, data, dispatch);
    const bubbleChart = new BubbleChart(bubbleChartConfig, data, dispatch);
    const colorLegend = new ColorLegend(colorLegendConfig, data, dispatch);
    const scatterPlot = new ScatterPlot(scatterPlotConfig, colorMap, groupBy, data);
    const histogram = new HistogramChart(histogramConfig, dispatch, defaultYearSelection, data);

    // Region Color Legend
    let legend = d3.select('#region-legend');
    legend.attr('width', colorLegendConfig.width).attr('height', '80px');
    legend.append("circle").attr("cx", 15).attr("cy", 20).attr("r", 6).style("fill", "#edd1d1")
    legend.append("circle").attr("cx", 15).attr("cy", 40).attr("r", 6).style("fill", "#d1e0ed")
    legend.append("circle").attr("cx", 15).attr("cy", 60).attr("r", 6).style("fill", "#d1edd5")
    legend.append("text").attr("x", 26).attr("y", 20).text("North America").style("font-size", "15px").attr("alignment-baseline", "middle")
    legend.append("text").attr("x", 26).attr("y", 40).text("Europe").style("font-size", "15px").attr("alignment-baseline", "middle")
    legend.append("text").attr("x", 26).attr("y", 60).text("Japan").style("font-size", "15px").attr("alignment-baseline", "middle")

    // -----

    updateData(groupBy);

     // Size Legend For bubble chart
     let sizeLegend = d3.select('#size-legend');
     sizeLegend.attr('width', '200px').attr('height', '80px');
     sizeLegend.append("circle").attr('id', 'circle-min').attr("cx", 45).attr("cy", 30).attr("r", bubbleChart.scaleMin.r).style("opacity", "0.8")
     sizeLegend.append("circle").attr('id', 'circle-max').attr("cx", 150).attr("cy", 30).attr("r", bubbleChart.scaleMax.r).style("opacity", "0.8")
     sizeLegend.append("text").attr('id','text-min').attr("x", 20).attr("y", 70).text(bubbleChart.scaleMin.sales + ' M').style("font-size", "15px")
     sizeLegend.append("text").attr('id','text-max').attr("x", 125).attr("y", 70).text(bubbleChart.scaleMax.sales + ' M').style("font-size", "15px")

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
        resetSelection();
    });

    dispatch.on('yearRangeChanged', selection => {
        let filteredData = data.filter(d => d.Year >= selection.start && d.Year <= selection.end);
        scatterPlot.data = filteredData
        computedData = computeRollUpData(filteredData);
        updateData(groupBy);
        resetSelection();
    });

    dispatch.call('yearRangeChanged', null, defaultYearSelection);

    // Helpers
    
    function resetSelection() {
        selectedElements = [];
        bubbleChart.selection = selectedElements;
        bubbleChart.updateVis();
        barChart.selection = selectedElements;
        barChart.updateVis();
    }

    function updateData(value) {
        groupBy = value;
        const key = value.toLowerCase();
        barChart.NASales = computedData[key + 'NASales'];
        barChart.EUSales = computedData[key + 'EUSales'];
        barChart.JPSales = computedData[key + 'JPSales'];
        barChart.WorldSales = computedData[key + 'WorldSales'];
        barChart.xValue = d => d[value];
        barChart.groupBy = value;
        barChart.updateVis();

        updateColorMap(groupBy);
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
        updateSizeLegend();
        
    }

    function updateColorMap(groupBy) {
        colorMap.clear();

        if(groupBy == 'Genre') {
            colorMap.set('Action', colorPallette[0]);
            colorMap.set('Misc', colorPallette[1]);
            colorMap.set('Platform', colorPallette[2]);
            colorMap.set('Puzzle', colorPallette[3]);
            colorMap.set('Racing', colorPallette[4]);
            colorMap.set('Role-Playing', colorPallette[5]);
            colorMap.set('Simulation', colorPallette[6]);
            colorMap.set('Sports', colorPallette[7]);
            colorMap.set('Strategy', colorPallette[8]);
        } else {
            colorMap.set('Activision', colorPallette[0]);
            colorMap.set('EA', colorPallette[1]);
            colorMap.set('Konami', colorPallette[2]);
            colorMap.set('Namco', colorPallette[3]);
            colorMap.set('Nintendo', colorPallette[4]);
            colorMap.set('Sega', colorPallette[5]);
            colorMap.set('Sony', colorPallette[6]);
            colorMap.set('THQ', colorPallette[7]);
            colorMap.set('Ubisoft', colorPallette[8]);
        }

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

    function updateSizeLegend() {
        d3.select("#text-min").text(bubbleChart.scaleMin.sales + ' M');
        d3.select('#text-max').text(bubbleChart.scaleMax.sales + ' M');
        d3.select("#circle-min").attr('r', bubbleChart.scaleMin.r);
        d3.select('#circle-max').attr('r', bubbleChart.scaleMax.r);
    }
});
