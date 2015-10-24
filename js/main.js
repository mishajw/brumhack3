var d3 = require("d3"),
    cloud = require("d3-cloud");

var fill = d3.scale.category20();

var layout = cloud()
    .size([500, 500])
    .words([""])