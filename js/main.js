
 // EXAMPLE
 const bubbleChartConfig = {
    svgElementId: 'bubble-chart-vis',
    width: 1000,
    height: 400,
    margin: { left: 10, right: 10, top: 10, bottom: 10 }
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
    });
    console.log(data);

    const bubbleChart = new BubbleChart(bubbleChartConfig, data);
});
