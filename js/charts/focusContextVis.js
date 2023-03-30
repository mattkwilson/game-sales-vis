class FocusContextVis {
    /**
     * source: https://github.com/UBC-InfoVis/447-materials/tree/23Jan/d3-examples/d3-brushing-linking
     */

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.svgElement,
            width:  400,
            height: 400,
            contextHeight: 400,
            margin: {top: 10, right: 10, bottom: 100, left: 45},
            contextMargin: {top: 280, right: 10, bottom: 20, left: 45}
        }
        let groupByYear = d3.rollup(_data, v => v.length, d => d.Year);
        this.data = Array.from(groupByYear, function([key, value]) {
            return {Year: key, Count:value};
        }).filter(d => d.Year).sort((a, b) => a.Year > b.Year ? 1 : -1);
        this.dispatcher = _dispatcher;
        this.initVis();
    }

    /**
     * Initialize scales/axes and append static chart elements
     */
    initVis() {
        let vis = this;

        const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
        const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

        vis.xScaleContext = d3.scaleLinear()
            .range([0, vis.config.width]);

        vis.yScaleContext = d3.scaleLinear()
            .range([vis.config.contextHeight, 0])
            .nice();

        // Initialize axes
        vis.xAxisContext = d3.axisBottom(vis.xScaleContext).tickSizeOuter(0);
        vis.yAxisContext = d3.axisLeft(vis.yScaleContext).tickSizeOuter(0);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', containerWidth)
            .attr('height', containerHeight);


        // vis.tooltipTrackingArea = vis.focus.append('rect')
        //     .attr('width', vis.config.width)
        //     .attr('height', vis.config.height)
        //     .attr('fill', 'none')
        //     .attr('pointer-events', 'all');
        //
        // // Empty tooltip group (hidden by default)
        // vis.tooltip = vis.focus.append('g')
        //     .attr('class', 'tooltip')
        //     .style('display', 'none');
        //
        // vis.tooltip.append('circle')
        //     .attr('r', 4);
        //
        // vis.tooltip.append('text');


        // Append context group with x- and y-axes
        vis.context = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.contextMargin.left},0)`)//${vis.config.contextMargin.top})`)


        vis.contextAreaPath = vis.context.append('path')
            .attr('class', 'chart-area');

        vis.xAxisContextG = vis.context.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.config.contextHeight})`);

        vis.yAxisContextG = vis.context.append('g')
            .attr('class', 'axis y-axis');

        vis.brushG = vis.context.append('g')
            .attr('class', 'brush x-brush');


        // Initialize brush component
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.config.width, vis.config.contextHeight]])
            .on('brush', function({selection}) {
                if (selection) vis.brushed(selection);

            })
            .on('end', function({selection}) {
                if (!selection) vis.brushed(null);
            });
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
            .y0(vis.config.contextHeight);

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

        // vis.tooltipTrackingArea
        //     .on('mouseenter', () => {
        //         vis.tooltip.style('display', 'block');
        //     })
        //     .on('mouseleave', () => {
        //         vis.tooltip.style('display', 'none');
        //     })
        //     .on('mousemove', function(event) {
        //         // Get date that corresponds to current mouse x-coordinate
        //         const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
        //         const date = vis.xScaleFocus.invert(xPos);
        //
        //         // Find nearest data point
        //         const index = vis.bisectDate(vis.data, date, 1);
        //         const a = vis.data[index - 1];
        //         const b = vis.data[index];
        //         const d = b && (date - a.date > b.date - date) ? b : a;
        //
        //         // Update tooltip
        //         vis.tooltip.select('circle')
        //             .attr('transform', `translate(${vis.xScaleFocus(d.date)},${vis.yScaleFocus(d.close)})`);
        //
        //         vis.tooltip.select('text')
        //             .attr('transform', `translate(${vis.xScaleFocus(d.date)},${(vis.yScaleFocus(d.close) - 15)})`)
        //             .text(Math.round(d.close));
        //     });

        // Update the axes
        vis.xAxisContextG.call(vis.xAxisContext);
        vis.yAxisContextG.call(vis.yAxisContext);

        // Update the brush and define a default position
        const defaultBrushSelection = [vis.xScaleContext(2015), vis.xScaleContext.range()[1]];
        vis.brushG
            .call(vis.brush)
            .call(vis.brush.move, defaultBrushSelection);
    }

    /**
     * React to brush events
     */
    brushed(selection) {
        let vis = this;

        // Check if the brush is still active or if it has been removed
        if (selection) {
            // Convert given pixel coordinates (range: [x0,x1]) into year

            let start = vis.xScaleContext.invert(selection[0])
            let end = vis.xScaleContext.invert(selection[1])
            vis.dispatcher.call('yearRangeChanged', null, {start: start, end: end});
        } else {
            // no range selected, show all data (full time period)
            vis.dispatcher.call('yearRangeChanged', null, {start: vis.xScaleContext.domain()[0], end: vis.xScaleContext.domain()[1]});
        }
    }
}