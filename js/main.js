var graph = new (function Graph() {
    // Dimensions of graph
    var width = 500,
        height = 500;
    // Scaling for sizes
    var mmSize;
    // List of word objects having the name and size
    var words;
    
    // D3 elements
    var svg, container;
    var fill = d3.scale.category20();
    
    this.init = function(_words) {
        words = _words;
        
        // Setup elements
        container = d3.select("#word-cloud")
        svg = container.append("svg");
        
        // Set dimensions to fit to containing div
        width = pxStringToInt(container.style("width"));
        height = pxStringToInt(container.style("height"));
        
        // If no words passed in, give template
        if (!words) {
            console.log("Nothing passed in, using Shakespear");
            words = "Shall I compare thee to a summer's day? Thou art more lovely and more temperate: Rough winds do shake the darling buds of May, And summer's lease hath all too short a date"
                .split(" ")
                .map(function(d) {
                    return {
                        text: d,
                        size: 10 + Math.random() * 100
                    };
                });
        }
        
        // Setup the scaled sizes
        mmSize = new MinMax(words, function(d) { return d.size; });
        
        // Setup the layout
        var layout = d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(function(d) {
                return -45 + mmSize.getScaledValue(d.size) * 90;
            })
            .font("Impact")
            .fontSize(getActualSize)
            .on("end", draw)
            .start();
    }
    
    function draw(words) {        
        svg .attr("width", width)
            .attr("height", height)
            .append("g")
                .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")")
                .selectAll("text")
                    .data(words)
                .enter().append("text")
                    .style("font-size", function(d) { return getActualSize(d) + "px"})
                    .style("font-family", "Impact")
                    .style("fill", function (d, i) {
                        return fill(i);
                    })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
    }
    
    function getActualSize(d) {
        return 20 + mmSize.getScaledValue(d.size) * 70;
    }
})();

var testWords = [{
    text: "misha",
    size: "20"
},
{
    text: "dan",
    size: "10"
},
{
    text: "jack",
    size: "10"
}]
