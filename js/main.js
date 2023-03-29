
 // EXAMPLE
 const bubbleChartConfig = {
    svgElement: 'bubble-map-vis',
    width: 500,
    height: 200,
    margin: { left: 10, right: 10, top: 10, bottom: 10 }
};

const barChartConfig = {
    svgElement: '#bar-chart-vis',
    width: 800,
    height: 200,
    margin: {top: 25, right: 20, bottom: 20, left: 35}
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
    const barChart = new StackedBarChart(barChartConfig, data);

    d3.select('#Platforms').on('click', d => {
    barChart.config.selection = "Platforms";        
    barChart.updateVis();
      });
    d3.select('#Publisher').on('click', d => {
        barChart.config.selection = "Publisher";        
        barChart.updateVis();
          });
    d3.select('#Genre').on('click', d => {
            barChart.config.selection = "Genre";        
            barChart.updateVis();
              });

    }); 

