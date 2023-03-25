
class BarChart {
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

        // TODO: Add code for initializing the visualization

        this.updateVis();
    }

    updateVis() {
        const vis = this;

        // TODO: Add code for updating the visualization

        this.renderVis();
    }

    renderVis() {
        const vis = this;

        // TODO: Add code for rendering the visualization
    }
}