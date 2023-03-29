// References:
//  https://github.com/d3/d3-hierarchy
//  https://observablehq.com/@d3/pack
//  https://github.com/UBC-InfoVis/447-materials/tree/23Jan/tutorials/7_D3_Tutorial_Advanced_Concepts

class BubbleChart {
    constructor(config_, data_, dispatch_) {
        this.config = {
            svgElementId: config_.svgElementId,
            width: config_.width,
            height: config_.height,
            margin: config_.margin,
            tooltipOffset: config_.tooltipOffset
        };
        this.data = data_;
        this.dispatch = dispatch_;
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
        vis.chart = vis.svg.append('g').attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Ref: - https://observablehq.com/@d3/color-schemes
        //      - https://www.learnui.design/tools/data-color-picker.html
        const colorPallette = ["#003f5c","2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600","#005c02","#327c2f","#14c990","#383838"];
        
        vis.colorMap = new Map();
        
        // Derive genre data
        const genreNASales = d3.rollups(vis.data, g => d3.sum(g, d => d.NA_Sales), d => d.Genre);
        const genreEUSales = d3.rollups(vis.data, g => d3.sum(g, d => d.EU_Sales), d => d.Genre);
        const genreJPSales = d3.rollups(vis.data, g => d3.sum(g, d => d.JP_Sales), d => d.Genre);
        genreNASales.forEach(g => {
            vis.colorMap.set(g[0], colorPallette[vis.colorMap.size]);
        });
        vis.colorMap.set('World', '#faf8f7');
        vis.colorMap.set('North America', '#edd1d1');
        vis.colorMap.set('Europe', '#d1e0ed');
        vis.colorMap.set('Japan', '#d1edd5');

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

        vis.selection = [];

        vis.tooltip = d3.select('#tooltip');

        this.updateVis();
    }

    updateVis() {
        const vis = this;

        this.renderVis();
    }

    renderVis() {
        const vis = this;

        const hierarchyData = vis.chart.selectAll('circle').data(vis.hierarchy);

        hierarchyData.join('circle')
                        .attr('class', d => {
                            switch(d.id) {
                                case 'World':
                                    return 'bubble-world';
                                case 'North America':
                                case 'Europe':
                                case 'Japan':
                                    return 'bubble-region';
                                default:
                                    return vis.selection.includes(d) ? 'bubble-selected' : 'bubble';
                            }
                        })
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y)
                        .attr('r', d => d.r)
                        .attr('fill', d => vis.colorMap.get(d.id))
                        .on('click', (e, d) => {
                            switch(d.id) {
                                case 'World':
                                case 'North America':
                                case 'Europe':
                                case 'Japan':
                                    vis.dispatch.call('reset-selection', e, d);
                                    break;
                                default:
                                    vis.dispatch.call('selection-change', e, d);
                            }
                        })
                        .on('mouseenter', (e, d) => {
                            if(!this.isInteractable(d)) {
                                return;
                            }
                            vis.tooltip.style('display', 'block')
                                .html(`<p><b>Genre:</b> ${d.id}</p> <p><b>Sales:</b> ${d3.format('$.0f')(Math.round(d.data.sales))} Million</p>`);

                        })
                        .on('mousemove', (e, d) => {
                            if(!this.isInteractable(d)) {
                                return;
                            }
                            vis.tooltip.style('left', (e.pageX + vis.config.tooltipOffset.x) + 'px')
                                        .style('top', (e.pageY - vis.config.tooltipOffset.y) + 'px');
                        })
                        .on('mouseleave', (e, d) => {
                            if(!this.isInteractable(d)) {
                                return;
                            }
                            vis.tooltip.style('display', 'none');
                        });

        // hierarchyData.join('text')
        //                 .attr('class', 'bubble-label')
        //                 .text(d => d.id)
        //                 .attr('x', d => d.x)
        //                 .attr('y', d => d.y);
    }

    isInteractable(d) {
        return !(d.id == 'World' || d.id == 'North America' || d.id == 'Europe' || d.id == 'Japan');
    }
}