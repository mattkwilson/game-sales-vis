
class StackedBarChart {
    constructor(config_, data_,) {
        this.config = {
            svgElement: config_.svgElement,
            width: config_.width,
            height: config_.height,
            margin: config_.margin,
            selection: config_.selection || "Genre",
        };
        this.data = data_;
        this.initVis();
    }

    initVis() {
        const vis = this;

         // Calculate inner chart size. Margin specifies the space around the actual chart.
         vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
         vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;
 
         // Initialize scales
         vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2)
            .paddingOuter(0.2);
 
         vis.yScale = d3.scaleLinear()
             .range([vis.height, 0]);
 
 
         // Initialize axes
         vis.xAxis = d3.axisBottom(vis.xScale)
             .ticks(12);
 
         vis.yAxis = d3.axisLeft(vis.yScale)
             .ticks(10);
 
         // Define size of SVG drawing area
         vis.svg = d3.select(vis.config.svgElement)
             .attr('width', vis.config.width)
             .attr('height', vis.config.height);
 
         vis.chart = vis.svg.append('g')
             .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
 
         vis.xAxisG = vis.chart.append('g')
             .attr('class', 'axis x-axis')
             .attr('transform', `translate(0,${vis.height})`);
 
         vis.yAxisG = vis.chart.append('g')
             .attr('class', 'axis y-axis');

         // Initialize stack generator and specify the categories or layers
        // that we want to show in the chart
        vis.stack = d3.stack()
        .keys(['NorthAmerica', 'Europe', 'Japan']);
 
 
         vis.updateVis();

        this.updateVis();
    }

    updateVis() {
        const vis = this;

    console.log(vis.data);


    var totalNASales = d3.rollups(vis.data, g => d3.sum(g, d => d.NA_Sales), d => d.Genre);
    var  totalEUSales = d3.rollups(vis.data, g => d3.sum(g, d => d.EU_Sales), d => d.Genre);
    var  totalJPSales = d3.rollups(vis.data, g => d3.sum(g, d => d.JP_Sales), d => d.Genre);
    var totalWorldSales = d3.rollups(vis.data, g => d3.sum(g, d => d.Global_Sales), d => d.Genre);
     vis.xValue = d => d.Genre;

 if (vis.config.selection == 'Platforms') {
     totalNASales = d3.rollups(vis.data, g => d3.sum(g, d => d.NA_Sales), d => d.Platforms);
     totalEUSales = d3.rollups(vis.data, g => d3.sum(g, d => d.EU_Sales), d => d.Platforms);
     totalJPSales = d3.rollups(vis.data, g => d3.sum(g, d => d.JP_Sales), d => d.Platforms);
     totalWorldSales = d3.rollups(vis.data, g => d3.sum(g, d => d.Global_Sales), d => d.Platforms);
     vis.xValue = d => d.Platforms;
 }

 if (vis.config.selection == 'Publisher') {
    totalNASales = d3.rollups(vis.data, g => d3.sum(g, d => d.NA_Sales), d => d.Publisher);
    totalEUSales = d3.rollups(vis.data, g => d3.sum(g, d => d.EU_Sales), d => d.Publisher);
    totalJPSales = d3.rollups(vis.data, g => d3.sum(g, d => d.JP_Sales), d => d.Publisher);
    totalWorldSales = d3.rollups(vis.data, g => d3.sum(g, d => d.Global_Sales), d => d.Publisher);
    vis.xValue = d => d.Publisher;
}

    function mergeArrays(arr1, arr2, arr3) {
        var arr4 = [];
        for ( var i = 0; i < arr1.length; i ++) {
             var addArray = [arr1[i][0], arr1[i][1], arr2[i][1], arr3[i][1]]
            arr4.push(addArray);
        }
        return arr4;
    }

    const finalSales = mergeArrays(totalEUSales, totalJPSales, totalNASales);


    const rawData = [
        ...finalSales.map(d => { return {
                Genre: d[0],
                NorthAmerica: d[3],
                Europe: d[1],
                Japan: d[2]
            };
        })
    ];

         // TODO: Add code for updating the visualization
        // Specify accessor functions
        vis.yValue = d => d.Global_Sales;

        vis.xScale.domain(vis.data.map(vis.xValue));
        vis.yScale.domain([0, d3.max(totalWorldSales, d => d[1])]);


    // Call stack generator on the dataset
    vis.stackedData = vis.stack(rawData);

        this.renderVis();
    }

    renderVis() {

        const vis = this;

        console.log(vis.stackedData);
        

        vis.chart.selectAll('.category')
        .data(vis.stackedData)
      .join('g')
        .attr('class', d => `category cat-${d.key}`)
      .selectAll('rect')
        .data(d => d)
      .join('rect')
        .attr('x', d => vis.xScale(d.data.Genre))
        .attr('y', d => vis.yScale(d[1]))
        .attr('height', d => vis.yScale(d[0]) - vis.yScale(d[1]))
        .attr('width', vis.xScale.bandwidth());

        


        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove())

        // TODO: Add code for rendering the visualization
    }
}