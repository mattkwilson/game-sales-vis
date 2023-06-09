class HistogramChart {
    /**
     * source: https://github.com/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-brushing-linking
     */

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _dispatcher, _defaultYearSelection, _data) {
        this.config = {
            parentElement: _config.svgElement,
            width:  _config.width,
            height: _config.height,
            margin: _config.margin
        }
        let groupByYear = d3.rollup(_data, v => v.length, d => d.Year);
        this.data = Array.from(groupByYear, function([key, value]) {
            return {Year: key, Count:value};
        }).filter(d => d.Year).sort((a, b) => a.Year > b.Year ? 1 : -1);
        this.dispatcher = _dispatcher;
        this.defaultYearSelection = _defaultYearSelection;
        this.initVis();
    }

    /**
     * Initialize scales/axes and append static chart elements
     */
    initVis() {
        let vis = this;

        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScaleContext = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScaleContext = d3.scaleLinear()
            .range([vis.height, 0])
            .nice();

        // Initialize axes
        vis.xAxisContext = d3.axisBottom(vis.xScaleContext)
            .tickSizeOuter(0)
            .tickFormat(d3.format(".0f"));
        vis.yAxisContext = d3.axisLeft(vis.yScaleContext)
            .tickSizeOuter(0)
            .ticks(2);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);


        // Append context group with x- and y-axes
        vis.context = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);


        vis.contextAreaPath = vis.context.append('path')
            .attr('class', 'chart-area');

        vis.xAxisContextG = vis.context.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisContextG = vis.context.append('g')
            .attr('class', 'axis y-axis');

        vis.brushG = vis.context.append('g')
            .attr('class', 'brush x-brush');


        // Initialize brush component
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on('end', function({selection}) {
                vis.brushed(selection);
            });

         // Append both axis titles
         vis.xAxisLabel = vis.context.append('text')
         .attr('class', 'title')
         .attr('y', -25)
         .attr('x', vis.width - 100)
         .attr('dy', '.71em')
         .style('text-anchor', 'middle');

        vis.svg.append('text')
            .attr('class', 'title')
            .attr('y', vis.height + 70)
            .attr('x', vis.width - 0)
            .attr('dy', '.71em')
            .text('Year');

        vis.svg.append('text')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 20)
            .attr('dy', '.71em')
            .text('Game Count');

        vis.svg.append('text')
            .attr('x', 0)
            .attr('y', vis.height + 70)
            .attr('dy', '.71em')
            .text('Select an area of the chart to filter by year range.');

        vis.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', vis.width / 2 - 120)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text('Video Game Releases');

        vis.updateVis();
    }

    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
        let vis = this;

        vis.xValue = d => d.Year;
        vis.yValue = d => d.Count;

        vis.area = d3.area()
            .x(d => vis.xScaleContext(vis.xValue(d)))
            .y1(d => vis.yScaleContext(vis.yValue(d)))
            .y0(vis.height);

        // Set the scale input domains
        vis.xScaleContext.domain(d3.extent(vis.data, vis.xValue));
        vis.yScaleContext.domain(d3.extent(vis.data, vis.yValue));

        vis.bisectDate = d3.bisector(vis.xValue).left;

        vis.renderVis();
    }

    /**
     * This function contains the D3 code for binding data to visual elements
     */
    renderVis() {
        let vis = this;
        vis.contextAreaPath
            .datum(vis.data)
            .attr('d', vis.area);

        // Update the axes
        vis.xAxisContextG.call(vis.xAxisContext);
        vis.yAxisContextG.call(vis.yAxisContext);

        // Update the brush and define a default position
        const defaultBrushSelection = [vis.xScaleContext(vis.defaultYearSelection.start),
            vis.xScaleContext(vis.defaultYearSelection.end)];
        vis.brushG
            .call(vis.brush)
            .call(vis.brush.move, defaultBrushSelection);
        vis.xAxisLabel.text('Selected Year Range: ' + vis.defaultYearSelection.start + '-' + vis.defaultYearSelection.end);
        
    }

    /**
     * React to brush events
     */
    brushed(selection) {
        let vis = this;
        // Check if the brush is still active or if it has been removed
        if (selection) {
            // Convert given pixel coordinates (range: [x0,x1]) into year

            let start = vis.xScaleContext.invert(selection[0]);
            let end = vis.xScaleContext.invert(selection[1]);
            vis.start = vis.xScaleContext.invert(selection[0]);
            vis.end = vis.xScaleContext.invert(selection[1]);
            // bug fix for invert not working as expected
            // Example: vis.xScaleContext.invert(vis.xScaleContext(1980)) gives 1980.0000000000002 instead of 1980
            if (end - start < 0.99){
                 start = Math.round(start);
                 end = Math.round(start) + 1;
                let brushSelection = [vis.xScaleContext(start), vis.xScaleContext(end)];
                vis.brushG
                    .call(vis.brush)
                    .call(vis.brush.move, brushSelection);
            }
            vis.xAxisLabel.text("Selected Year Range: " + Math.round(vis.start) + "-" + Math.round(vis.end));
            vis.dispatcher.call('yearRangeChanged', null, {start: start, end: end});
        } else {
            // no range selected, show all data (full time period)
            let start =vis.xScaleContext.domain()[0];
            let end = vis.xScaleContext.domain()[1];

            vis.xAxisLabel.text('Selected Year Range: ' + start + '-' + end);
            vis.dispatcher.call('yearRangeChanged', null, {start: start, end: end});
        }

    }
}