
class ScatterPlot {
    constructor(config_, colorMap_, groupBy_, data_) {
        this.config = {
            svgElement: config_.svgElement,
            width: config_.width,
            height: config_.height,
            margin: config_.margin
        };
        this.data = data_;
        this.colorMap = colorMap_;
        this.groupby = groupBy_;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        // Initialize scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, 10]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(10)
            .tickSize(-vis.height - 10)
            .tickPadding(10);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(10)
            .tickSize(-vis.width - 10)
            .tickPadding(10)

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

        // Append both axis titles
        vis.chart.append('text')
            .attr('class', 'title')
            .attr('y', vis.height - 15)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Sales in Millions');

        vis.svg.append('text')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text('Rating')
            .attr("y", 5);

        vis.updateVis();
    }

    updateVis() {
        const vis = this;
        // Specify accessor functions
        vis.xValue = d => d.Global_Sales;
        vis.yValue = d => d.Rating;

        vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);

        this.renderVis();
    }

    renderVis() {
        const vis = this;
        // Add circles
        let circles = vis.chart.selectAll('.point')
            .data(vis.data)

        let circlesEnter = circles.enter()
            .append('circle')
            .attr('r', 5);

        circlesEnter.merge(circles)
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('class', "point")
            .attr('fill', d => vis.colorMap.get(d[vis.groupby]))
            // Tooltip event listeners
            .on('mouseover', (event, d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX) + 'px')
                    .style('top', (event.pageY) + 'px')
                    .html(`
              <div class='tooltip-title'>${d.Title}</div>
              <div class='tooltip-title'>${d.Rating} Rating</div>
              <div><strong>$${d.Global_Sales} Million</strong></div>
              <div>Released in ${d.Year}</div>
            `)
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });
        circles.exit().remove();

        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove())
    }
}