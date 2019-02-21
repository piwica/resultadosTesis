/**
 * Created by Piwica on 5/22/16.
 */

var node2neighbors = {};
var meter = document.querySelector("#progress"),
        canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d"),
        width = canvas.width,
        height = canvas.height;

var worker = new Worker("worker.js");

worker.onmessage = function (event) {
    switch (event.data.type) {
        case "tick":
            return ticked(event.data);
        case "end":
            return ended(event.data);
    }
};

function inicializarForceGraphD3(url) {
    d3.json(url, function (error, graph) {
        if (error)
            throw error;

        var nodeById = d3.map();

        graph.nodes.forEach(function (node) {
            nodeById.set(node.id, node);
        });
        graph.edges.forEach(function (link) {
            link.source = nodeById.get(link.source);
            link.target = nodeById.get(link.target);
        });

        worker.postMessage({
            nodes: graph.nodes,
            links: graph.edges
        });

    });
}

function ticked(data) {
    var progress = data.progress;

    meter.style.width = 100 * progress + "%";
}

function ended(data) {
    var nodes = data.nodes,
            links = data.links;

    meter.style.display = "none";

    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    links.forEach(drawLink);
    context.strokeStyle = "#aaa";
    context.stroke();

    context.beginPath();
    nodes.forEach(drawNode);
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();

    context.restore();
}

function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
}
