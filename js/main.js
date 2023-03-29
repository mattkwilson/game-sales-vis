
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
    const dispatch = d3.dispatch('selection-change', 'reset-selection');

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

    const bubbleChart = new BubbleChart(bubbleChartConfig, data, dispatch);

    dispatch.on('selection-change', element => {
        if(selectedElements.includes(element)) {
            selectedElements.splice(selectedElements.indexOf(element), 1);
        } else {
            selectedElements.push(element);
        }
        bubbleChart.selection = selectedElements;
        bubbleChart.updateVis();
    });

    dispatch.on('reset-selection', d => {
        selectedElements = [];
        bubbleChart.selection = selectedElements;
        bubbleChart.updateVis();
    });
});
   

