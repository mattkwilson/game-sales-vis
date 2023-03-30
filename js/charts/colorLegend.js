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

        const sales = vis.sales;

        this.renderVis();
    }

    renderVis() {
        const vis = this;

        // https://jsfiddle.net/k_sav/oa703n4j/ resource for legend
       vis.chart.selectAll('text')
      .data(vis.sales)
      .join("text")
      .attr("fill", d => vis.colorMap.get(d[0]))
      .attr("x", function(d, i){ 
        if (vis.sales.length <= 12) { if (i >= vis.sales.length/2) {
        return 5;
      } else {
        return 200}}
    else if (i > 6) {
        return 5;
    } else {
        return 200
    }})
      .attr("y", function(d, i){ if(vis.sales.length <= 12){ if (i >= vis.sales.length/2) { return -5 + (15*i)}
      else {
        return  -5 + 15*(i + vis.sales.length/2)
      }
    } else if (i > 6) {
        return -5 + (15*i)

    }
     else {
        return -5 + 15*(i + 6)
     }} )
      .text(function (d) {
           return d[0]
      })
    }
}