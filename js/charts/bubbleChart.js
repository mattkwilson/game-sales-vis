// References:
//  https://github.com/d3/d3-hierarchy
//  https://observablehq.com/@d3/pack
//  https://github.com/UBC-InfoVis/447-materials/tree/23Jan/tutorials/7_D3_Tutorial_Advanced_Concepts

class BubbleChart {
    constructor(config_, data_) {
        this.config = {
            svgElementId: config_.svgElementId,
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

        // Create chart area
        vis.svg = d3.select('#' + vis.config.svgElementId)
                        .attr('width', vis.config.width)
                        .attr('height', vis.config.height);
        vis.chart = vis.svg.append('g').attr('transform', `translate(${vis.config.margin.left}, 
                                                                        ${vis.config.margin.top})`);

        // Ref: https://observablehq.com/@d3/color-schemes
        const colorPallette = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"];
        vis.colorMap = new Map();
        
        // Derive genre data
        const genreNASales = d3.rollups(vis.data, g => d3.sum(g, d => d.NA_Sales), d => d.Genre);
        const genreEUSales = d3.rollups(vis.data, g => d3.sum(g, d => d.EU_Sales), d => d.Genre);
        const genreJPSales = d3.rollups(vis.data, g => d3.sum(g, d => d.JP_Sales), d => d.Genre);

        genreNASales.forEach(g => {
            vis.colorMap.set(g[0], colorPallette[vis.colorMap.size]);
        });

        const rawData = [
            {
                name: "World",
                parent: ""
            },
            {
                name: "North America",
                parent: "World"
            },
            {
                name: "Europe",
                parent: "World"
            },
            {
                name: "Japan",
                parent: "World"
            },
            ...genreNASales.map(d => { return {
                    name: d[0],
                    parent: "North America",
                    sales: d[1]
                };
            }),
            ...genreEUSales.map(d => { return {
                    name: d[0],
                    parent: "Europe",
                    sales: d[1]
                };
            }),
            ...genreJPSales.map(d => { return {
                    name: d[0],
                    parent: "Japan",
                    sales: d[1]
                };
            })
        ];

        vis.hierarchy = d3.stratify()
                            .id(d => d.name)
                            .parentId(d => d.parent)
                            (rawData)
                            .sum(d => d.sales);
        
        d3.pack().size([vis.width, vis.height])(vis.hierarchy);

        this.updateVis();
    }

    updateVis() {
        const vis = this;

        // TODO: Add code for updating the visualization

        this.renderVis();
    }

    renderVis() {
        const vis = this;

        vis.chart.selectAll('.bubble')
                        .data(vis.hierarchy)
                        .join('circle')
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y)
                        .attr('r', d => d.r)
                        .attr('fill', d => vis.colorMap.get(d.id))
                        .attr('opacity', d => d.id == "World" || d.id == "North America" || d.id == "Europe" || d.id == "Japan" ? 0.08 : 0.8);
    }
}