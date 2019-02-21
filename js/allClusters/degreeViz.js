/**
 * Created by Piwica on 5/4/16.
 */
/**
 * Created by Piwica on 4/23/16.
 */
// these are just some preliminary settings
var attribute;
var inicializarDegree = function(jsonUrl, C, cargartabla, attr) {
    $('#node-category').find('option').not(':first').remove();
    attribute = attr;
    $('#graph-container').html("");
    var g = {
        nodes: [],
        edges: []
    };

    sigma.renderers.def = sigma.renderers.canvas;

    var cs = [];

    // Generate the colors:
    for (i = 0; i < C; i++)
        cs.push({
            id: i + "",
            color: '#' + (
                    Math.floor(Math.random() * 16777215).toString(16) + '000000'
                    ).substr(0, 6)
        });

// Create new Sigma instance in graph-container div (use your div name here)
    var s = new sigma({
        graph: g,
        renderer: {
            container: $('#graph-container')[0],
            type: 'canvas'
        },
        settings: {
            dragNodeStickiness: 0.01,
            minNodeSize: 2,
            maxNodeSize: 24,
            minEdgeSize: 1,
            maxEdgeSize: 10,
            edgeLabelSize: 'proportional',
            edgeLabelThreshold: 50,
            labelSize:'proportional',
            labelThreshold: 8,
            labelSizeRatio: '0.6',
            nodeHoverBorderSize: 2,
            defaultNodeHoverBorderColor: '#fff',
            nodeActiveBorderSize: 2,
            nodeActiveOuterBorderSize: 3,
            defaultNodeActiveBorderColor: '#fff',
            defaultNodeActiveOuterBorderColor: 'rgb(236, 81, 72)',
            enableEdgeHovering: true,
            edgeHoverExtremities: true
        }
    });
// first you load a json with (important!) s parameter to refer to the sigma instance

    var parser = sigma.parsers.json(
            jsonUrl,
            s,
            function() {
                // this below adds x, y attributes as well as size = degree of the node
                var i,
                        nodes = s.graph.nodes(),
                        len = nodes.length;

                for (i = 0; i < len; i++) {
                    nodes[i].x = Math.random();
                    nodes[i].y = Math.random();
                    nodes[i].size = s.graph.degree(nodes[i].id);
                    nodes[i].label = nodes[i]["fsn"];
                    nodes[i].data = {"ConceptId": nodes[i].id, "FSN": nodes[i]["fsn"], "Jerarquia": nodes[i]["categoria"]};
                    nodes[i].color = cs[nodes[i][attribute]].color;

                    if (cargartabla) {
                        $("<tr><td>" + nodes[i].id + "</td><td>" + nodes[i]["fsn"] + "</td><td>" + nodes[i][attribute] + "</td><td>" + s.graph.degree(nodes[i].id) + "</td><td>" + nodes[i]["betweenness"] + "</td><td>" + nodes[i]["closeness"] + "</td><td>" + nodes[i]["evector"] + "</td></tr>").appendTo("#datatable");
                    }
                }

                var edges = s.graph.edges(),
                        len = edges.length;

                for (i = 0; i < len; i++) {
                    edges[i].color = edges[i]["type"] === "SHAREPROBLEM" ? '#BDC3C7' : '#3498DB';
                    edges[i].size = edges[i]["count"] === "None" ? 1 : edges[i]["count"];
                    edges[i].label = edges[i].size;
                    edges[i].data = {"source": edges[i].source, "target": edges[i].target};
                    edges[i].weight = edges[i].size;
                }

                // Initialize the Filter API
                filter = sigma.plugins.filter(s);

                updatePane(s.graph, filter);

                function applyMinDegreeFilter(e) {
                    var v = e.target.value;
                    _.$('min-degree-val').textContent = v;

                    filter
                            .undo('min-degree')
                            .nodesBy(
                                    function(n, options) {
                                        return this.graph.degree(n.id) >= options.minDegreeVal;
                                    },
                                    {
                                        minDegreeVal: +v
                                    },
                            'min-degree'
                                    )
                            .apply();
                }

                function applyCategoryFilter(e) {
                    var c = e.target[e.target.selectedIndex].value;
                    filter
                            .undo('node-category')
                            .nodesBy(
                                    function(n, options) {
                                        return !c.length || n[attribute] === c;
                                    },
                                    {
                                        property: attribute
                                    },
                            'node-category'
                                    )
                            .apply();
                }

                _.$('min-degree').addEventListener("input", applyMinDegreeFilter);  // for Chrome and FF
                _.$('min-degree').addEventListener("change", applyMinDegreeFilter); // for IE10+, that sucks
                _.$('node-category').addEventListener("change", applyCategoryFilter);


                //Create table
                if (cargartabla) {
                    $('#datatable').dataTable();
                    $('#datatable tbody').on("click", "tr", function() {
                        console.log($(this).find("td:first").html());
                        console.log(activeState);
                        activeState.addNodes($(this).find("td:first").html());
                        s.refresh();

                    });
                }

                sigma.plugins.killActiveState();

                // Instanciate the ActiveState plugin:
                var activeState = sigma.plugins.activeState(s);

// Initialize the dragNodes plugin:
                var dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);

// Initialize the Select plugin:
                var select = sigma.plugins.select(s, activeState, s.renderers[0]);
                select.init(); // take the current active nodes into account

// Initialize the Keyboard plugin:
                var keyboard = sigma.plugins.keyboard(s, s.renderers[0]);

// Bind the Keyboard plugin to the Select plugin:
                select.bindKeyboard(keyboard);

                if (sigma.plugins.keyboard) {
                    document.getElementsByClassName('contenedorKBD')[0].style.display = 'block';
                }


                dragListener.bind('startdrag', function(event) {
                    console.log(event);
                });
                dragListener.bind('drag', function(event) {
                    console.log(event);
                });
                dragListener.bind('drop', function(event) {
                    console.log(event);
                });
                dragListener.bind('dragend', function(event) {
                    console.log(event);
                });

//                // Configure the ForceLink algorithm:
//                var fa = sigma.layouts.configForceLink(s, {
//                    worker: true,
//                    autoStop: true,
//                    background: true,
//                    scaleRatio: 10,
//                    gravity: 3,
//                    easing: 'cubicInOut'
//                });
//
//                // Bind the events:
//                fa.bind('start stop', function(e) {
//                    console.log(e.type);
//                    document.getElementById('layout-notification').style.visibility = '';
//                    if (e.type == 'start') {
//                        document.getElementById('layout-notification').style.visibility = 'visible';
//                    }
//                });
//                // Start the ForceLink algorithm:
//                sigma.layouts.startForceLink();
//
//                s.refresh();

                // Configure the Fruchterman-Reingold algorithm:
                var frListener = sigma.layouts.fruchtermanReingold.configure(s, {
                    iterations: 500,
                    easing: 'quadraticInOut',
                    duration: 800
                });

// Bind the events:
                frListener.bind('start stop interpolate', function(e) {
                    console.log(e.type);
                });

// Start the Fruchterman-Reingold algorithm:
                sigma.layouts.fruchtermanReingold.start(s);


            }
    );

}

var filter;
/**
 * DOM utility functions
 */
var _ = {
    $: function(id) {
        return document.getElementById(id);
    },
    all: function(selectors) {
        return document.querySelectorAll(selectors);
    },
    removeClass: function(selectors, cssClass) {
        var nodes = document.querySelectorAll(selectors);
        var l = nodes.length;
        for (i = 0; i < l; i++) {
            var el = nodes[i];
            // Bootstrap compatibility
            el.className = el.className.replace(cssClass, '');
        }
    },
    addClass: function(selectors, cssClass) {
        var nodes = document.querySelectorAll(selectors);
        var l = nodes.length;
        for (i = 0; i < l; i++) {
            var el = nodes[i];
            // Bootstrap compatibility
            if (-1 == el.className.indexOf(cssClass)) {
                el.className += ' ' + cssClass;
            }
        }
    },
    show: function(selectors) {
        this.removeClass(selectors, 'hidden');
    },
    hide: function(selectors) {
        this.addClass(selectors, 'hidden');
    },
    toggle: function(selectors, cssClass) {
        var cssClass = cssClass || "hidden";
        var nodes = document.querySelectorAll(selectors);
        var l = nodes.length;
        for (i = 0; i < l; i++) {
            var el = nodes[i];
            //el.style.display = (el.style.display != 'none' ? 'none' : '' );
            // Bootstrap compatibility
            if (-1 !== el.className.indexOf(cssClass)) {
                el.className = el.className.replace(cssClass, '');
            } else {
                el.className += ' ' + cssClass;
            }
        }
    }
};
function updatePane(graph, filter) {
    // get max degree
    var maxDegree = 0,
            categories = {};
    // read nodes
    graph.nodes().forEach(function(n) {
        maxDegree = Math.max(maxDegree, graph.degree(n.id));
        categories[n[attribute]] = true;
    })
    // min degree
    _.$('min-degree').max = maxDegree;
    _.$('max-degree-value').textContent = maxDegree;
    // node category
    var nodecategoryElt = _.$('node-category');
    Object.keys(categories).forEach(function(c) {
        var optionElt = document.createElement("option");
        optionElt.text = c;
        nodecategoryElt.add(optionElt);
    });
    // reset button
    _.$('reset-btn').addEventListener("click", function(e) {
        _.$('min-degree').value = 0;
        _.$('min-degree-val').textContent = '0';
        _.$('node-category').selectedIndex = 0;
        filter.undo().apply();
        _.$('dump').textContent = '';
        _.hide('#dump');
    });
}
