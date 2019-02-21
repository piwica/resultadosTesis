/**
 * Created by Piwica on 5/22/16.
 */

var node2neighbors = {};
function inicializarForceGraphD3(url, C) {

    var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    /*force.linkStrength(function(link) {
     if (link.count < 5000)  return 0.1;
     return 1;
     });*/



    d3.json(url, function (error, graph) {
        if (error)
            throw error;

        var nodeById = d3.map();
        // Set the opacity range
        var vRadio = d3.scaleLinear().range([2, 10]);
        vRadio.domain([d3.min(graph.nodes, function (d) {
                return d.conteo;
            }),
            d3.max(graph.nodes, function (d) {
                return d.conteo;
            })]);

        graph.nodes.forEach(function (node) {
            //node.r = vRadio(node.conteo);
            nodeById.set(node.id, node);
        });

        graph.edges.forEach(function (link) {
            link.source = nodeById.get(link.source);
            link.target = nodeById.get(link.target);
        });

        var n = 1000;

        var simulation = d3.forceSimulation(graph.nodes)
                .force("charge", d3.forceManyBody().strength(5))
                .force("link", d3.forceLink(graph.edges).distance(30).strength(1).iterations(100).id(function (d) {
                    return d.id;
                }))
                .force("collide", d3.forceCollide().radius(function (d) {
                    return vRadio(d.conteo) + 7;
                }).iterations(2))
                .force("center", d3.forceCenter())
                .force("x", d3.forceX())
                .force("y", d3.forceY())
                .stop();
        for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            simulation.tick();
        }

        var vCluster = d3.scaleLinear().range([1, 20]);
        vCluster.domain([d3.min(graph.nodes, function (d) {
                d.multilevel=typeof d.multilevel=== "undefined"?-1:d.multilevel;
                d.label_propagation=typeof d.label_propagation=== "undefined"?-1:d.label_propagation;
                d.leading_vector=typeof d.leading_vector=== "undefined"?-1:d.leading_vector;
                console.log(d.multilevel*100 + d.label_propagation*10 + d.leading_vector);
                return d.multilevel*100 + d.label_propagation*10 + d.leading_vector;
            }),
            d3.max(graph.nodes, function (d) {
                return d.multilevel*100 + d.label_propagation*10 + d.leading_vector;
            })]);


        var colorNode = d3.scaleOrdinal(d3.schemeCategory20);


// Scale the opacity range of the data



        g.append("g")
                .selectAll("line")
                .data(graph.edges)
                .enter().append("line")
                .attr("class", function (d) {
                    return ["link", "node" + d.source.id, "node" + d.target.id].join(" ");
                })
//                .style("stroke", function (d) {
//                    return colorEdge(d.nivel_asistencia);
//                })
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
        ;

        var node = g.selectAll(".node")
                .data(graph.nodes)
                .enter().append("g")
                .attr("class", "node")
                .attr("fill", function (d) {
                    return colorNode(vCluster(d.multilevel*100 + d.label_propagation*10 + d.leading_vector));
                })
                .on("click", click)
                .on("dblclick", dblclick);

        node.append("circle")
                .attr("r", function (d) {
                    return vRadio(d.conteo);
                })
                .attr("cx", function (d) {
                    return d.x + vRadio(d.conteo);
                })
                .attr("cy", function (d) {
                    return d.y;
                });

        // add the text
        node.append("text")
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                })
                .attr("dy", ".35em")
                .style("stroke", "black")
                .style("font", function (d) {
                    if (vRadio(d.conteo) <= 8) {
                        return "11px sans-serif";
                    } else {
                        return "12px sans-serif";

                    }
                })
                .style("stroke-width", ".5px")
                .style("opacity", function (d) {
                    return vRadio(d.conteo) >=4  ? 1 : 0;
                })
                .text(function (d) {
                    return d.term;
                });




    });
}

function dblclick(d) {
    d3.select(this).select("text").transition()
            .duration(750)
            .style("opacity", "0");
}

function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
}

function click(n) {
    d3.select(this).select("text").transition()
            .duration(750)
            .style("font", "8px sans-serif")
            .style("opacity", "1");

}
