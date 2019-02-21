/**
 * Created by Piwica on 5/22/16.
 */

var node2neighbors = {};
function inicializarForceGraphD3(url, C){
    $(".dashboard_d3").html("");
    var width = 960,
        height = 700;

    var color = d3.scale.category10();

    var force = d3.layout.force()
        .linkDistance(80)
        .size([width, height]);

    /*force.linkStrength(function(link) {
        if (link.count < 5000)  return 0.1;
        return 1;
    });*/

    var svg = d3.select(".dashboard_d3").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json(url, function(error, graph) {
        if (error) throw error;

        var nodeById = d3.map();

        graph.nodes.forEach(function(node) {
            nodeById.set(node.id, node);
        });

        graph.edges.forEach(function(link) {
            link.source = nodeById.get(link.source);
            link.target = nodeById.get(link.target);
            link.count = link.count==="None"?1000:parseInt(link.count);
        });


        force
            .nodes(graph.nodes)
            .links(graph.edges)
            .start();

        // Set the opacity range
        var  vColor = d3.scale.linear().range([0.4, 1]);

// Scale the opacity range of the data
        vColor.domain([d3.min(graph.nodes, function(d) { return d.weight; }),
            d3.max(graph.nodes, function(d) { return d.weight; })]);


        // Set the opacity range
        var  vStroke = d3.scale.linear().range([0.2, 8]);

// Scale the opacity range of the data

        vStroke.domain([d3.min(graph.edges, function(d) { return d.count; }),
            d3.max(graph.edges, function(d) { return d.count; })]);


        var drag = force.drag()
            .on("dragstart", dragstart);

        var link = svg.selectAll(".link")
            .data(graph.edges)
            .enter().append("line")
            .attr("class", function(d){ return ["link", "node"+d.source.id, "node"+d.target.id].join(" "); })
            .style("stroke-width", function(d) { return vStroke(d.count); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .on("dblclick",  dblclick)
            .on("click", click)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .call(drag);

         node.append("circle")
             .attr("r", "5")
             .style("fill",  function(d){return color(d.multilevel);})
             .style("opacity", function(d){return vColor(d.weight);});

        // add the text
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .style("stroke", "black")
            .style("stroke-width", ".5px")
            .style("opacity", function(d){return vColor(d.weight)>0.5?1:0; })
            .text(function(d) { return d.fsn; });

        // Set up dictionary of neighbors
        for (var i =0; i < graph.nodes.length; i++){
            var name = graph.nodes[i].id;
            node2neighbors[name] = graph.edges.filter(function(d){
                return d.source.id == name || d.target.id == name;
            }).map(function(d){
                    return d.source.id == name ? d.target.id : d.source.id;
                });
        }

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")"; });
        });
    });
}

function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 5);
    d3.select(this).select("text").transition()
        .duration(750)
        .style("opacity", "0")

    d3.selectAll("line.node" + d.id).style("opacity", 0).classed("active", false);

}

function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
}

function click(n){
    d3.select(this).select("text").transition()
        .duration(750)
        .style("font", "20px sans-serif")
        .style("opacity", "1");
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16);


    d3.selectAll("line").style("opacity", 0);

    d3.selectAll("line.active").style("opacity", 1);

    d3.selectAll("line.node" + n.id).style("opacity", 1).classed("active", true);


}

function mouseover(){
    var font = d3.select(this).select("text").style("font");
    if (font.indexOf("10px")>-1){
    d3.select(this).select("text").transition()
        .style("font", "10px sans-serif")
        .style("opacity", "1");
    }
}

function mouseout(){
    var font = d3.select(this).select("text").style("font");
    if (font.indexOf("10px")>-1){
    d3.select(this).select("text").transition()
        .style("opacity", 0);
    }
}
