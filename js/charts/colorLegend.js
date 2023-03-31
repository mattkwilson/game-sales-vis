class ColorLegend {
    constructor(config_, data_) {
        this.config = {
            svgElement: config_.svgElement,
            width: config_.width,
            height: config_.height,
            margin: config_.margin
        };
        this.data = data_;
        this.initVis();
    }

    initVis() {
        const vis = this;

        // Setup bounds for chart
        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;
        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.svgElement)
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    }

    updateVis() {
        const vis = this;

        this.renderVis();
    }

    renderVis() {
        const vis = this;
        // create our color legend text
       vis.chart.selectAll('text')
        .data(vis.sales)
        .join("text")
        .attr("fill", d => vis.colorMap.get(d[0]))
        .attr("x", function(d, i){ 
        return 10;
        })
        .attr("y", function(d, i) { 
            return -5 + (15*i);
        })
        .text(function (d) {
            return d[0]
        });

        // add circles
        vis.chart.selectAll('circle')
        .data(vis.sales)
        .join("circle")
        .attr('r', 5)
        .attr('cx', 0)
        .attr('cy', (d, i) => -10 + (15*i))
        .attr('fill', d => vis.colorMap.get(d[0]));
    }
}