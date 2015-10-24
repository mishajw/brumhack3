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
    var fill;
    
    this.init = function(_words) {
        words = _words;
        
        displayGraph();
        
        // Setup elements
        container = d3.select("#word-cloud")
        svg = container.append("svg");
        fill = d3.scale.category20();
        
        // Show the graph
        container.style("diplay", "block");
        
        // Set dimensions to fit to containing div
        width = pxStringToInt(container.style("width"));
        height = pxStringToInt(container.style("height"));
        
        // If no words passed in, give template
        if (!words) {
            console.log("Nothing passed in");
            words = Array(404).join("error ").split(" ")
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
        var base = 20.0;
        var scale = 90.0;
        var idealAmount = 50.0;
        var relativeSale = 1; // parseFloat(idealAmount / words.length);
        
        var size = base +
            (parseFloat(mmSize.getScaledValue(d.size)) * scale * relativeSale);
        
        return size;
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

function displayGraph() {
    $("#word-cloud").show();
    $("#setup-container").hide();
}

function initGraphWithData() {
    $.ajax({
        url: "/get",
        dataType: "json",
        success: function(resp) {
            var data = $.parseJSON(resp.responseText)
            
            console.log("Got from server: " + data);
            
            graph.init(data);
        },
        error: function(error) {
            console.log("Got error: " + error);
            graph.init();
        }
    })
}
