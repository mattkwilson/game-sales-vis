
class StackedBarChart {
    constructor(config_, data_, dispatch_) {
        this.config = {
            svgElement: config_.svgElement,
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

        // Append both axis titles
        vis.xAxisLabel = vis.chart.append('text')
            .attr('class', 'title')
            .attr('y', vis.height + 30)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end');

        vis.svg.append('text')
            .attr('class', 'title')
            .attr('x', 10)
            .attr('y', 30)
            .attr('dy', '.71em')
            .text('Sales in Millions');

        vis.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', vis.width/2 + 50)
            .attr('y', 0)
            .attr('dy', '.71em')
            .text('Total Sales Stacked by Region')
            .style('text-anchor', 'middle');;

        // Initialize stack generator 
        vis.stack = d3.stack()
            .keys(['NorthAmerica', 'Europe', 'Japan'])
            .order(d3.stackOrderDescending);

        vis.selection = [];
        vis.tooltip = d3.select('#tooltip');

    // bar chart regional legend 
    vis.svg.append("text").attr("x", vis.width - 30).attr("y", vis.height - 155).text("Region").style("font-size", "17px").style("font-weight", "700").attr("alignment-baseline", "middle")
    vis.svg.append("circle").attr("cx",vis.width - 20).attr("cy", vis.height - 130).attr("r", 6).style("fill", "#edd1d1")
    vis.svg.append("circle").attr("cx",vis.width - 20).attr("cy",vis.height - 110).attr("r", 6).style("fill", "#d1e0ed")
    vis.svg.append("circle").attr("cx",vis.width - 20).attr("cy",vis.height - 90).attr("r", 6).style("fill", "#d1edd5")
    vis.svg.append("text").attr("x", vis.width - 8).attr("y", vis.height - 130).text("North America").style("font-size", "15px").attr("alignment-baseline","middle")
    vis.svg.append("text").attr("x", vis.width - 8).attr("y", vis.height - 110).text("Europe").style("font-size", "15px").attr("alignment-baseline","middle")
    vis.svg.append("text").attr("x", vis.width - 8).attr("y", vis.height - 90).text("Japan").style("font-size", "15px").attr("alignment-baseline","middle");

    }

    updateVis() {
        const vis = this;

        function mergeArrays(arr1, arr2, arr3) {
            var arr4 = [];
            for (var i = 0; i < arr1.length; i++) {
                var addArray = [arr1[i][0], arr1[i][1], arr2[i][1], arr3[i][1]]
                arr4.push(addArray);
            }
            return arr4;
        }

        const finalSales = mergeArrays(vis.EUSales, vis.JPSales, vis.NASales);
        finalSales.sort((a,b) => b[1] + b[2] + b[3] - a[1] - a[2] - a[3]);

        const rawData = [
            ...finalSales.map(d => {
                return {
                    id: d[0],
                    NorthAmerica: d[3],
                    Europe: d[1],
                    Japan: d[2]
                };
            })
        ];

        vis.xAxisLabel.text(vis.groupBy);
        vis.xScale.domain(finalSales.map(d => d[0]));
        vis.yScale.domain([0, d3.max(vis.WorldSales, d => d[1])]);
        
        // Call stack generator on the dataset
        vis.stackedData = vis.stack(rawData);
        vis.stackedData.forEach(element => {
            element.forEach(arr => {
                arr.region = element.key;
            });
        });

        this.renderVis();
    }

    renderVis() {

        const vis = this;

        vis.svg.on('click', (e, d) => {
            if(e.target.id == 'bar-chart-vis') {
                vis.dispatch.call('reset-selection', e, d);
            }
        });

        vis.chart.selectAll('.category')
            .data(vis.stackedData)
            .join('g')
            .attr('class', d => `category cat-${d.key}`)
            .selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('class', d => vis.selection.includes(d.data.id + d.region) ? 'bar-selected' : 'bar')
            .attr('x', d => vis.xScale(d.data.id))
            .attr('y', d => vis.yScale(d[1]))
            .attr('height', d => vis.yScale(d[0]) - vis.yScale(d[1]))
            .attr('width', vis.xScale.bandwidth())
            .on('click', (e, d) => vis.dispatch.call('selection-change', e, { id: d.data.id, parent: { id: d.region } }))
            .on('mouseenter', (e, d) => {
                vis.tooltip.style('display', 'block')
                    .style('left', (e.pageX) + 'px')
                    .style('top', (e.pageY) + 'px')
                    .html(`<p><b>Region:</b> ${d.region}</p> <p><b>Sales:</b> ${d3.format('$.2f')(Math.abs(d[0] - d[1]))} Million</p>`);

            })
            .on('mousemove', (e, d) => {
                vis.tooltip.style('left', (e.pageX + vis.config.tooltipOffset.x) + 'px')
                            .style('top', (e.pageY - vis.config.tooltipOffset.y) + 'px');
            })
            .on('mouseleave', (e, d) => {
                vis.tooltip.style('display', 'none');
            });

        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove())
    }
}