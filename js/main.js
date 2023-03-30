
 // EXAMPLE
 const bubbleChartConfig = {
    svgElement: 'bubble-map-vis',
    width: 500,
    height: 200,
    margin: { left: 10, right: 10, top: 10, bottom: 10 }
};

 const scatterPlotConfig = {
     svgElement: '#scatter-plot-vis',
     width: 400,
     height: 725,
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

    const bubbleChart = new BubbleChart(bubbleChartConfig, data);
    const scatterPlot = new ScatterPlot(scatterPlotConfig, data);
    const dispatcherYearRange = d3.dispatch('yearRangeChanged');
    const histogram = new FocusContextVis(histogramConfig, dispatcherYearRange, data);
    dispatcherYearRange.on('yearRangeChanged', selection => {
        scatterPlot.data = data.filter(d => d.Year >= selection.start && d.Year <= selection.end);
        scatterPlot.updateVis();
    });

});
