
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
        vis.chart.append('text')
            .attr('class', 'title')
            .attr('y', vis.height + 30)
            .attr('x', vis.width + 10)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Category');

        vis.svg.append('text')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 10)
            .attr('dy', '.71em')
            .text('Sales in Millions');

        // Initialize stack generator 
        vis.stack = d3.stack()
            .keys(['NorthAmerica', 'Europe', 'Japan']);

        vis.selection = [];
        vis.tooltip = d3.select('#tooltip');

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

        vis.xScale.domain(vis.data.map(vis.xValue));
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