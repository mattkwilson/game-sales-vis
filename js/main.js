
 // EXAMPLE
 const bubbleChartConfig = {
    svgElementId: 'bubble-chart-vis',
    width: 500,
    height: 400,
    margin: { left: 10, right: 10, top: 10, bottom: 10 },
    tooltipOffset: { x: 20, y: 10 }
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

    let selectedElements = [];
    const dispatch = d3.dispatch('selection-change', 'reset-selection');

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
