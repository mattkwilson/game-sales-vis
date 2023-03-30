
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
    margin: {top: 25, right: 20, bottom: 40, left: 35}
};

 const scatterPlotConfig = {
     svgElement: '#scatter-plot-vis',
     width: 400,
     height: 500,
     margin: {top: 25, right: 20, bottom: 20, left: 35}
 };

 const histogramConfig = {
     svgElement: '#histogram-chart-vis',
     width: 400,
     height: 725,
     margin: {top: 25, right: 20, bottom: 20, left: 35}
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

    const dispatch = d3.dispatch('selection-change', 'reset-selection');

    // const genreNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Genre);
    // const genreEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Genre);
    // const genreJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Genre);
    // const genreWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Genre);
    // const platformNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Platforms);
    // const platformEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Platforms);
    // const platformJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Platforms);
    // const platformWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Platforms);
    // const publisherNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Publisher);
    // const publisherEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Publisher);
    // const publisherJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Publisher);
    // const publisherWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Publisher);
    let computedData = computeRollUpData(data);
    // Ref: - https://observablehq.com/@d3/color-schemes
    //      - https://www.learnui.design/tools/data-color-picker.html
    const colorPallette = ["#003f5c","2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600","#005c02","#327c2f","#14c990","#383838"];
    const colorMap = new Map();


    const barChart = new StackedBarChart(barChartConfig, data, dispatch);
    const bubbleChart = new BubbleChart(bubbleChartConfig, data, dispatch);

    barChart.NASales = computedData.genreNASales;
    barChart.EUSales = computedData.genreEUSales;
    barChart.JPSales = computedData.genreJPSales;
    barChart.WorldSales = computedData.genreWorldSales;
    barChart.xValue = d => d.Genre;
    barChart.updateVis();

    updateColorMap(computedData.genreNASales);
    bubbleChart.colorMap = colorMap;
    bubbleChart.NASales = computedData.genreNASales;
    bubbleChart.EUSales = computedData.genreEUSales;
    bubbleChart.JPSales = computedData.genreJPSales;
    bubbleChart.updateVis();



    d3.select('#Platforms').on('click', (e, d) => {
        groupBy = "Platforms";
        barChart.NASales = computedData.platformNASales;
        barChart.EUSales = computedData.platformEUSales;
        barChart.JPSales = computedData.platformJPSales;
        barChart.WorldSales = computedData.platformWorldSales;
        barChart.xValue = d => d.Platforms;
        barChart.updateVis();

        updateColorMap(computedData.platformNASales);
        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = computedData.platformNASales;
        bubbleChart.EUSales = computedData.platformEUSales;
        bubbleChart.JPSales = computedData.platformJPSales;
        bubbleChart.updateVis();

        dispatch.call('reset-selection', e, d);
    });

    d3.select('#Publisher').on('click', (e, d) => {
        groupBy = "Publisher";
        barChart.NASales = computedData.publisherNASales;
        barChart.EUSales = computedData.publisherEUSales;
        barChart.JPSales = computedData.publisherJPSales;
        barChart.WorldSales = computedData.publisherWorldSales;
        barChart.xValue = d => d.Publisher;
        barChart.updateVis();

        updateColorMap(computedData.publisherNASales);
        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = computedData.publisherNASales;
        bubbleChart.EUSales = computedData.publisherEUSales;
        bubbleChart.JPSales = computedData.publisherJPSales;
        bubbleChart.updateVis();

        dispatch.call('reset-selection', e, d);
    });

    d3.select('#Genre').on('click', (e, d) => {
        groupBy = "Genre";
        barChart.NASales = computedData.genreNASales;
        barChart.EUSales = computedData.genreEUSales;
        barChart.JPSales = computedData.genreJPSales;
        barChart.WorldSales = computedData.genreWorldSales;
        barChart.xValue = d => d.Genre;
        barChart.updateVis();

        updateColorMap(computedData.genreNASales);
        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = computedData.genreNASales;
        bubbleChart.EUSales = computedData.genreEUSales;
        bubbleChart.JPSales = computedData.genreJPSales;
        bubbleChart.updateVis();

        dispatch.call('reset-selection', e, d);
    });

    dispatch.on('selection-change', element => {
        const id = element.id + element.parent.id;
        console.log(id);
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

    const scatterPlot = new ScatterPlot(scatterPlotConfig, data);
    const dispatcherYearRange = d3.dispatch('yearRangeChanged');
    const histogram = new FocusContextVis(histogramConfig, dispatcherYearRange, data);
    dispatcherYearRange.on('yearRangeChanged', selection => {
        let filteredData = data.filter(d => d.Year >= selection.start && d.Year <= selection.end);
        scatterPlot.data = filteredData
        scatterPlot.updateVis();
        computedData = computeRollUpData(filteredData);
        if (groupBy == "Genre"){
            bubbleChart.NASales = computedData.genreNASales;
            bubbleChart.EUSales = computedData.genreEUSales;
            bubbleChart.JPSales = computedData.genreJPSales;

            barChart.NASales = computedData.genreNASales;
            barChart.EUSales = computedData.genreEUSales;
            barChart.JPSales = computedData.genreJPSales;
            barChart.WorldSales = computedData.genreWorldSales;

        }else if (groupBy == "Publisher"){
            bubbleChart.NASales = computedData.publisherNASales;
            bubbleChart.EUSales = computedData.publisherEUSales;
            bubbleChart.JPSales = computedData.publisherJPSales;

            barChart.NASales = computedData.publisherNASales;
            barChart.EUSales = computedData.publisherEUSales;
            barChart.JPSales = computedData.publisherJPSales;
            barChart.WorldSales = computedData.publisherWorldSales;
        }else{
            bubbleChart.NASales = computedData.platformNASales;
            bubbleChart.EUSales = computedData.platformEUSales;
            bubbleChart.JPSales = computedData.platformJPSales;

            barChart.NASales = computedData.platformNASales;
            barChart.EUSales = computedData.platformEUSales;
            barChart.JPSales = computedData.platformJPSales;
            barChart.WorldSales = computedData.platformWorldSales;

        }
        bubbleChart.updateVis();
        barChart.updateVis();
    });


    // Helpers

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
        result.platformNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Platforms);
        result.platformEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Platforms);
        result.platformJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Platforms);
        result.platformWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Platforms);
        result.publisherNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Publisher);
        result.publisherEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Publisher);
        result.publisherJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Publisher);
        result.publisherWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Publisher);
        return result;
    }
});

