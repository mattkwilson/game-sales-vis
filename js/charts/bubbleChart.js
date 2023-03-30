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

        vis.selection = [];

        vis.tooltip = d3.select('#tooltip');
    }

    updateVis() {
        const vis = this;

        const rawData = [
            {
                name: "World",
                parent: ""
            },
            {
                name: "NorthAmerica",
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
            ...vis.NASales.map(d => { return {
                    name: d[0],
                    parent: "NorthAmerica",
                    sales: d[1]
                };
            }),
            ...vis.EUSales.map(d => { return {
                    name: d[0],
                    parent: "Europe",
                    sales: d[1]
                };
            }),
            ...vis.JPSales.map(d => { return {
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
                                case 'NorthAmerica':
                                case 'Europe':
                                case 'Japan':
                                    return 'bubble-region';
                                default:
                                    return vis.selection.includes(d.id + d.parent.id) ? 'bubble-selected' : 'bubble';
                            }
                        })
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y)
                        .attr('r', d => d.r)
                        .attr('fill', d => vis.colorMap.get(d.id))
                        .on('click', (e, d) => {
                            switch(d.id) {
                                case 'World':
                                case 'NorthAmerica':
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
        return !(d.id == 'World' || d.id == 'NorthAmerica' || d.id == 'Europe' || d.id == 'Japan');
    }
}