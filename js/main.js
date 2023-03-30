
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
    });
    console.log(data);

    let selectedElements = [];
    let groupBy = 'Genre';

    const dispatch = d3.dispatch('selection-change', 'reset-selection');

    const genreNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Genre);
    const genreEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Genre);
    const genreJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Genre);
    const genreWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Genre);
    const platformNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Platforms);
    const platformEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Platforms);
    const platformJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Platforms);
    const platformWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Platforms);
    const publisherNASales = d3.rollups(data, g => d3.sum(g, d => d.NA_Sales), d => d.Publisher);
    const publisherEUSales = d3.rollups(data, g => d3.sum(g, d => d.EU_Sales), d => d.Publisher);
    const publisherJPSales = d3.rollups(data, g => d3.sum(g, d => d.JP_Sales), d => d.Publisher);
    const publisherWorldSales = d3.rollups(data, g => d3.sum(g, d => d.Global_Sales), d => d.Publisher);

    // Ref: - https://observablehq.com/@d3/color-schemes
    //      - https://www.learnui.design/tools/data-color-picker.html
    const colorPallette = ["#003f5c","2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600","#005c02","#327c2f","#14c990","#383838"];
    const colorMap = new Map();

    
    const barChart = new StackedBarChart(barChartConfig, data, dispatch);
    const bubbleChart = new BubbleChart(bubbleChartConfig, data, dispatch);

    barChart.NASales = genreNASales;
    barChart.EUSales = genreEUSales;
    barChart.JPSales = genreJPSales;
    barChart.WorldSales = genreWorldSales;
    barChart.xValue = d => d.Genre;     
    barChart.updateVis();

    updateColorMap(genreNASales);
    bubbleChart.colorMap = colorMap;
    bubbleChart.NASales = genreNASales;
    bubbleChart.EUSales = genreEUSales;
    bubbleChart.JPSales = genreJPSales;
    bubbleChart.updateVis();



    d3.select('#Platforms').on('click', (e, d) => {
        groupBy = "Platforms";   
        barChart.NASales = platformNASales;
        barChart.EUSales = platformEUSales;
        barChart.JPSales = platformJPSales;
        barChart.WorldSales = platformWorldSales;
        barChart.xValue = d => d.Platforms;
        barChart.updateVis();

        updateColorMap(platformNASales);
        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = platformNASales;
        bubbleChart.EUSales = platformEUSales;
        bubbleChart.JPSales = platformJPSales;
        bubbleChart.updateVis();

        dispatch.call('reset-selection', e, d);
    });

    d3.select('#Publisher').on('click', (e, d) => {
        groupBy = "Publisher";     
        barChart.NASales = publisherNASales;
        barChart.EUSales = publisherEUSales;
        barChart.JPSales = publisherJPSales;
        barChart.WorldSales = publisherWorldSales;
        barChart.xValue = d => d.Publisher;   
        barChart.updateVis();

        updateColorMap(publisherNASales);
        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = publisherNASales;
        bubbleChart.EUSales = publisherEUSales;
        bubbleChart.JPSales = publisherJPSales;
        bubbleChart.updateVis();

        dispatch.call('reset-selection', e, d);
    });

    d3.select('#Genre').on('click', (e, d) => {
        groupBy = "Genre";   
        barChart.NASales = genreNASales;
        barChart.EUSales = genreEUSales;
        barChart.JPSales = genreJPSales;
        barChart.WorldSales = genreWorldSales;
        barChart.xValue = d => d.Genre;     
        barChart.updateVis();

        updateColorMap(genreNASales);
        bubbleChart.colorMap = colorMap;
        bubbleChart.NASales = genreNASales;
        bubbleChart.EUSales = genreEUSales;
        bubbleChart.JPSales = genreJPSales;
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
});
   
