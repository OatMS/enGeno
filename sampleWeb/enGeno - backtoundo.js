//var selectedNode = [];
var $ = go.GraphObject.make;


//---------------Layout----------------------------


// A custom layout that shows the two families related to a person's parents
function GenogramLayout() {
    go.LayeredDigraphLayout.call(this);
    this.initializeOption = go.LayeredDigraphLayout.InitDepthFirstOut;
}
go.Diagram.inherit(GenogramLayout, go.LayeredDigraphLayout);


/** @override */
GenogramLayout.prototype.makeNetwork = function (coll) {
    // generate LayoutEdges for each parent-child Link
    var net = this.createNetwork();
    if (coll instanceof go.Diagram) {
        this.add(net, coll.nodes, true);
        this.add(net, coll.links, true);
    } else if (coll instanceof go.Group) {
        this.add(net, coll.memberParts, false);
    } else if (coll.iterator) {
        this.add(net, coll.iterator, false);
    }
    return net;
};

// internal method for creating LayeredDigraphNetwork where husband/wife pairs are represented
// by a single LayeredDigraphVertex corresponding to the label Node on the marriage Link
GenogramLayout.prototype.add = function (net, coll, nonmemberonly) {
    // consider all Nodes in the given collection
    var it = coll.iterator;
    while (it.next()) {
        var node = it.value;
        if (!(node instanceof go.Node)) continue;
        if (!node.isLayoutPositioned || !node.isVisible()) continue;
        if (nonmemberonly && node.containingGroup !== null) continue;
        // if it's an unmarried Node, or if it's a Link Label Node, create a LayoutVertex for it
        if (node.isLinkLabel) {
            // get marriage Link
            var link = node.labeledLink;
            var spouseA = link.fromNode;
            var spouseB = link.toNode;
            // create vertex representing both husband and wife
            var vertex = net.addNode(node);
            // now define the vertex size to be big enough to hold both spouses
            vertex.width = spouseA.actualBounds.width + 30 + spouseB.actualBounds.width;
            vertex.height = Math.max(spouseA.actualBounds.height, spouseB.actualBounds.height);
            vertex.focus = new go.Point(spouseA.actualBounds.width + 30 / 2, vertex.height / 2);
        } else {
            // don't add a vertex for any married person!
            // instead, code above adds label node for marriage link
            // assume a marriage Link has a label Node
            if (!node.linksConnected.any(function (l) {
                    return l.isLabeledLink;
                })) {
                var vertex = net.addNode(node);
            }
        }
    }
    // now do all Links
    it.reset();
    while (it.next()) {
        var link = it.value;
        if (!(link instanceof go.Link)) continue;
        if (!link.isLayoutPositioned || !link.isVisible()) continue;
        if (nonmemberonly && link.containingGroup !== null) continue;
        // if it's a parent-child link, add a LayoutEdge for it
        if (!link.isLabeledLink) {
            console.log(link.isLabeledLink);
            var parent = net.findVertex(link.fromNode); // should be a label node
            var child = net.findVertex(link.toNode);
            if (child !== null) { // an unmarried child
                net.linkVertexes(parent, child, link);
            } else { // a married child
                link.toNode.linksConnected.each(function (l) {
                    if (!l.isLabeledLink) return; // if it has no label node, it's a parent-child link
                    // found the Marriage Link, now get its label Node
                    var mlab = l.labelNodes.first();
                    // parent-child link should connect with the label node,
                    // so the LayoutEdge should connect with the LayoutVertex representing the label node
                    var mlabvert = net.findVertex(mlab);
                    if (mlabvert !== null) {
                        net.linkVertexes(parent, mlabvert, link);
                    }
                });
            }
        }
    }
};

/** @override */
GenogramLayout.prototype.assignLayers = function () {
    go.LayeredDigraphLayout.prototype.assignLayers.call(this);
    var horiz = this.direction == 0.0 || this.direction == 180.0;
    // for every vertex, record the maximum vertex width or height for the vertex's layer
    var maxsizes = [];
    this.network.vertexes.each(function (v) {
        var lay = v.layer;
        var max = maxsizes[lay];
        if (max === undefined) max = 0;
        var sz = (horiz ? v.width : v.height);
        if (sz > max) maxsizes[lay] = sz;
    });
    // now make sure every vertex has the maximum width or height according to which layer it is in,
    // and aligned on the left (if horizontal) or the top (if vertical)
    this.network.vertexes.each(function (v) {
        var lay = v.layer;
        var max = maxsizes[lay];
        if (horiz) {
            v.focus = new go.Point(0, v.height / 2);
            v.width = max;
        } else {
            v.focus = new go.Point(v.width / 2, 0);
            v.height = max;
        }
    });
    // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
    // (other than the ones that are the widest or tallest in their respective layer).
};

/** @override */
GenogramLayout.prototype.commitNodes = function () {
    go.LayeredDigraphLayout.prototype.commitNodes.call(this);
    // position regular nodes
    this.network.vertexes.each(function (v) {
        if (v.node !== null && !v.node.isLinkLabel) {
            v.node.position = new go.Point(v.x, v.y);
        }
    });
    // position the spouses of each marriage vertex
    var layout = this;
    this.network.vertexes.each(function (v) {
        if (v.node === null) return;
        if (!v.node.isLinkLabel) return;
        var labnode = v.node;
        var lablink = labnode.labeledLink;
        // In case the spouses are not actually moved, we need to have the marriage link
        // position the label node, because LayoutVertex.commit() was called above on these vertexes.
        // Alternatively we could override LayoutVetex.commit to be a no-op for label node vertexes.
        lablink.invalidateRoute();
        var spouseA = lablink.fromNode;
        var spouseB = lablink.toNode;
        // prefer fathers on the left, mothers on the right
        if (spouseA.data.s === "F") { // sex is female
            var temp = spouseA;
            spouseA = spouseB;
            spouseB = temp;
        }
        // see if the parents are on the desired sides, to avoid a link crossing
        var aParentsNode = layout.findParentsMarriageLabelNode(spouseA);
        var bParentsNode = layout.findParentsMarriageLabelNode(spouseB);
        if (aParentsNode !== null && bParentsNode !== null && aParentsNode.position.x > bParentsNode.position.x) {
            // swap the spouses
            var temp = spouseA;
            spouseA = spouseB;
            spouseB = temp;
        }
        spouseA.position = new go.Point(v.x, v.y);
        spouseB.position = new go.Point(v.x + spouseA.actualBounds.width + 30, v.y);
        if (spouseA.opacity === 0) {
            var pos = new go.Point(v.centerX - spouseA.actualBounds.width / 2, v.y);
            spouseA.position = pos;
            spouseB.position = pos;
        } else if (spouseB.opacity === 0) {
            var pos = new go.Point(v.centerX - spouseB.actualBounds.width / 2, v.y);
            spouseA.position = pos;
            spouseB.position = pos;
        }
    });
};

//หาว่ามี Married node ไหม จาก nodeInTo เพราะอันเดิมคือ ต้อง link กันทั้งสองคน
GenogramLayout.prototype.findParentsMarriageLabelNode = function (node) {
    var it = node.findNodesInto();
    while (it.next()) {
        var n = it.value;
        if (n.isLinkLabel) return n;
    }

    return null;
};




//------------------------------------API----------------------


//

var enGeno = class {


    constructor(data, div) {


        var diagram;
        this.contextNode;
        var nodeOnRightClicked;
       this.setContextNode();
        var originArray = setOriginalArray(data);
        
        
        function setOriginalArray(data) {

            originArray = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].m && typeof data[i].m == "string") data[i].m = parseInt(data[i].m);
                if (data[i].f && typeof data[i].f == "string") {
                    data[i].f = parseInt(data[i].f);
                } else if (data[i].cou && typeof data[i].cou == "object") {
                    for (var c = 0; c < data[i].cou.length; c++) {
                        data[i].cou[c] = parseInt(data[i].cou[c]);
                    }
                }

                originArray[""+data[i].key] = JSON.parse(JSON.stringify(data[i]));

            }

            //originArray.splice(0, 1);
            return originArray;


        }

        this.pushObjInOriginalArray = function (obj) {
            originArray[""+obj.key] = JSON.parse(JSON.stringify(obj));
        }
        this.getOriginalArray = function () {
            var arr = JSON.parse(JSON.stringify(originArray));
            //     console.log("inget origin = "+JSON.stringify(arr));
            return arr;
        }

        this.setPropertyArray = function (key, pro, value) {
            for (var i = 0; i < originArray.length; i++) {
                if (originArray[i].key == key) {
                    originArray[i][pro] = value;
                }
            }
        }

        this.addSpouseArray = function (key, value) {

                //หาkeyที่จะเพิ่มแฟน
                    if (originArray[""+key].cou && typeof originArray[""+key].cou == "object") {
                        var can = true;
                        //ตรวจว่ามี key ที่จะเพิ่มหรือยัง
                        for (var j = 0; j < originArray[""+key].cou.length; j++) {
                            if (key == originArray[""+key].cou[j]) {
                                can = false;
                                break;
                            }

                        }
                        if (can) {
                            originArray[""+key].cou.push(value);
                        }
                    } else if (originArray[""+key].cou && typeof originArray[""+key].cou == "number") {
                        var temp = originArray[""+key].cou;
                        originArray[""+key].cou = [temp, value];

                    } else {
                        originArray[""+key].cou = value;
                    }
            console.log("addSpouseArray key="+key);
            console.log("Now origin array = "+JSON.stringify(originArray));
        }





        this.diagram =
            $(go.Diagram, {
                initialAutoScale: go.Diagram.Uniform,
                initialContentAlignment: go.Spot.Center,
                "undoManager.isEnabled": true,
                // when a node is selected, draw a big yellow circle behind it
                nodeSelectionAdornmentTemplate: $(go.Adornment, "Auto", {
                        layerName: "Grid"
                    }, // the predefined layer that is behind everything else
                    $(go.Shape, "Circle", {
                        fill: "yellow",
                        stroke: null
                    }),
                    $(go.Placeholder)
                ),
                click: clickDiagram,
                layout: // use a custom layout, defined below
                    $(GenogramLayout, {
                    direction: 90,
                    layerSpacing: 30,
                    columnSpacing: 10
                })
            });

        //click Listener **candelete**
        this.diagram.addDiagramListener("ObjectSingleClicked",
            function (e) {

            });



        this.diagram.allowDrop = true;

        this.diagram.div = document.getElementById("myDiagram");


        


        // determine the color for each attribute shape
        function attrFill(a) {
            if (a.show == true && a.attr && (a.index == 1||a.index == 2||a.index == 3||a.index == 4)) {
                switch (a.attr) {
                    case "A":
                        return "#0000FE";
                    case "B":
                        return "#FF00FF";
                    case "C":
                        return "#FE0000";
                    case "D":
                        return "#C00000";
                    case "E":
                        return "#C00000";
                    case "F":
                        return "#FFC000";
                    case "G":
                        return "#01FF00";
                    case "H":
                        return "#800080";
                    case "I":
                        return "#939FBB";
                    case "J":
                        return "#01FFFF";
                    case "K":
                        return "#359AFF";
                    case "L":
                        return "#FFFF00";
                    case "S":
                        return "red";
                    default:
                        return "transparent";
                }
            } else {
                return "transparent";
            }
        }
        
        function infantFill(a){
             if (a.show == true && a.attr) {
                 if(a.attr == "S")return "red";
                 else  return "transparent";
             }else {
                return "transparent";
            }
        }

        // determine the geometry for each attribute shape in a male;
        // except for the slash these are all squares at each of the four corners of the overall square
        var tlsq = go.Geometry.parse("F M1 1 l19 0 0 19 -19 0z");
        var trsq = go.Geometry.parse("F M20 1 l19 0 0 19 -19 0z");
        var brsq = go.Geometry.parse("F M20 20 l19 0 0 19 -19 0z");
        var blsq = go.Geometry.parse("F M1 20 l19 0 0 19 -19 0z");
        var slash = go.Geometry.parse("F M38 0 L40 0 40 2 2 40 0 40 0 38z");



        function maleGeometry(a) {
            //   console.log("attr : "+a[attr]+" ,index : "+a.index);
            if (a.attr) {
                if (a.attr == 'S') return slash;
                if (a.index == 1) return tlsq;
                else if (a.index == 2) return trsq;
                else if (a.index == 3) return brsq;
                else if (a.index == 4) return blsq;
                else return tlsq;
            }



            console.log(JSON.stringify(a));

        }
        
         function infantGeometry(a){
             if (a.attr) {
               if (a.attr == 'S') return slash;
              
                else return brsq;
            }
         }

        // determine the geometry for each attribute shape in a female;
        // except for the slash these are all pie shapes at each of the four quadrants of the overall circle
        var tlarc = go.Geometry.parse("F M20 20 B 180 90 20 20 19 19 z");
        var trarc = go.Geometry.parse("F M20 20 B 270 90 20 20 19 19 z");
        var brarc = go.Geometry.parse("F M20 20 B 0 90 20 20 19 19 z");
        var blarc = go.Geometry.parse("F M20 20 B 90 90 20 20 19 19 z");





        function femaleGeometry(a) {
            //   console.log("attr : "+a[attr]+" ,index : "+a.index);
            if (a.attr) {
                if (a.attr == 'S') return slash;
                if (a.index == 1) return tlarc;
                else if (a.index == 2) return trarc;
                else if (a.index == 3) return brarc;
                else if (a.index == 4) return blarc;
                else return tlsq;
            }



            console.log(JSON.stringify(a));

        }

        function ageFill(a) {
            if (a.show)
                return "#FFFFFF";
            else
                return "transparent";
        }

        function ageText(a) {
            if (a.year) {
                return a.year;
            }
        }

        function ageTextColor(a) {
            if (a.show)
                return "black";
            else
                return "transparent";

        }
this.diagram.nodeTemplateMap.add("I", // male
            $(go.Node, "Vertical", {
                    locationSpot: go.Spot.Center,
                    locationObjectName: "ICON"
                }, {
                    doubleClick: function (e, node) {
                        doubleClickNode(e, node);
                    },
                    click: function (e, node) {
                            clickNode(e, node)
                        }
                       
                },
                $(go.Panel, {
                        name: "ICON"
                    },
                    $(go.Shape, "Triangle", {
                        width: 40,
                        height: 40,
                        strokeWidth: 2,
                        fill: "white",
                        portId: ""
                    }),
                    $(go.Panel, { // for each attribute show a Shape at a particular place in the overall square
                            itemTemplate: $(go.Panel,
                                $(go.Shape, {
                                        stroke: null,
                                        strokeWidth: 0
                                    },
                                    new go.Binding("fill", "", infantFill),
                                    new go.Binding("geometry", "", infantGeometry))
                            ),
                            margin: 1,
                    position: new go.Point(-5, 5)
                        },
                        new go.Binding("itemArray", "aobj")
                    )
                ),
                $(go.TextBlock, {
                        textAlign: "center",
                        maxSize: new go.Size(80, NaN)
                    },
                    new go.Binding("text", "n"))


            ));

        // two different node templates, one for each sex,
        // named by the category value in the node data object
        this.diagram.nodeTemplateMap.add("M", // male
            $(go.Node, "Vertical", {
                    locationSpot: go.Spot.Center,
                    locationObjectName: "ICON"
                }, {
                    doubleClick: function (e, node) {
                        doubleClickNode(e, node);
                    },
                    click: function (e, node) {
                            clickNode(e, node)
                        }
            //,contextMenu:this.contextNode
                        //this.setRightClickedNode // define a context menu for each node
                },
                $(go.Panel, {
                        name: "ICON"
                    },
                    $(go.Shape, "Square", {
                        width: 40,
                        height: 40,
                        strokeWidth: 2,
                        fill: "white",
                        portId: ""
                    }),
                    $(go.Panel, { // for each attribute show a Shape at a particular place in the overall square
                            itemTemplate: $(go.Panel,
                                $(go.Shape, {
                                        stroke: null,
                                        strokeWidth: 0
                                    },
                                    new go.Binding("fill", "", attrFill),
                                    new go.Binding("geometry", "", maleGeometry))
                            ),
                            margin: 1
                        },
                        new go.Binding("itemArray", "aobj")
                    ),


                    $(go.Panel, {
                            itemTemplate: $(go.Panel,
                                $(go.Shape, "Circle", {
                                    width: 20,
                                    height: 20,
                                    stroke: null,
                                    strokeWidth: 0,
                                    fill: "white"
                                }, new go.Binding("fill", "", ageFill)),
                                $(go.TextBlock, {
                                        textAlign: "center",
                                        maxSize: new go.Size(80, NaN),
                                        position: new go.Point(3, 5)

                                    },
                                    new go.Binding("text", "", ageText),
                                    new go.Binding("color", "", ageTextColor)
                                )),
                            position: new go.Point(10, 10)
                        },
                        new go.Binding("itemArray", "age")
                    )
                ),
                $(go.TextBlock, {
                        textAlign: "center",
                        maxSize: new go.Size(80, NaN)
                    },
                    new go.Binding("text", "n"))


            ));


        this.diagram.nodeTemplateMap.add("F", // female
            $(go.Node, "Vertical", {
                    locationSpot: go.Spot.Center,
                    locationObjectName: "ICON"
                }, {
                    doubleClick: doubleClickNode,
                    click: function (e, node) {
                            clickNode(e, node)
                        }
               // ,contextMenu:this.contextNode
                        // ,rightCl: this.setRightClickedNode
                },

                $(go.Panel, {
                        name: "ICON"
                    },
                    $(go.Shape, "Circle", {
                        width: 40,
                        height: 40,
                        strokeWidth: 2,
                        fill: "white",
                        portId: ""
                    }),
                    $(go.Panel, { // for each attribute show a Shape at a particular place in the overall circle
                            itemTemplate: $(go.Panel,
                                $(go.Shape, {
                                        stroke: null,
                                        strokeWidth: 0
                                    },
                                    new go.Binding("fill", "", attrFill),
                                    new go.Binding("geometry", "", femaleGeometry))
                            ),
                            margin: 1
                        },
                        new go.Binding("itemArray", "aobj")
                    ),


                    $(go.Panel, {
                            itemTemplate: $(go.Panel,
                                $(go.Shape, "Circle", {
                                    width: 20,
                                    height: 20,
                                    stroke: null,
                                    strokeWidth: 0,
                                    fill: "white"
                                }, new go.Binding("fill", "", ageFill)),
                                $(go.TextBlock, {
                                        textAlign: "center",
                                        maxSize: new go.Size(80, NaN),
                                        position: new go.Point(3, 5)

                                    },
                                    new go.Binding("text", "", ageText),
                                    new go.Binding("color", "", ageTextColor)
                                )),
                            position: new go.Point(10, 10)
                        },
                        new go.Binding("itemArray", "age")
                    )
                ),
                $(go.TextBlock, {
                        textAlign: "center",
                        maxSize: new go.Size(80, NaN)
                    },
                    new go.Binding("text", "n"))
            ));



        // the representation of each label node -- nothing shows on a Marriage L ink
        this.diagram.nodeTemplateMap.add("LinkLabel",
            $(go.Node, {
                selectable: false,
                width: 1,
                height: 1,
                fromEndSegmentLength: 20
            }));


        // Define a bunch of small Shapes that can be used as values for Shape.pathPattern

        var PathPatterns = new go.Map('string', go.Shape);


        // Conversion functions that make use of the PathPatterns store of pattern Shapes
        function convertPathPatternToShape(name) {
            if (!name) return null;
            return PathPatterns.getValue(name);
        }

        function convertPathPatternToColor(name) {
            var pattobj = convertPathPatternToShape(name);
            return (pattobj !== null) ? pattobj.stroke : "transparent";
        }




        function definePathPattern(name, geostr, color, width, cap) {
            if (typeof name !== 'string' || typeof geostr !== 'string') throw new Error("invalid name or geometry string argument: " + name + " " + geostr);
            if (color === undefined) color = "black";
            if (width === undefined) width = 1;
            if (cap === undefined) cap = "square";
            PathPatterns.add(name,
                $(go.Shape, {
                    geometryString: geostr,
                    fill: "transparent",
                    stroke: color,
                    strokeWidth: width,
                    strokeCap: cap
                }));
            //console.log('addPattern :' + name);
        }

        definePathPattern("Single", "M0 0 L1 0");
        definePathPattern("Double", "M0 0 L1 0 M0 3 L1 3");
        definePathPattern("Triple", "M0 0 L1 0 M0 3 L1 3 M0 6 L1 6");
        definePathPattern("DashR", "M0 0 M3 0 L6 0", "red");
        definePathPattern("DoubleDashR", "M0 0 M3 0 L6 0 M3 3 L6 3", "red");
        definePathPattern("TripleDashR", "M0 0 M3 0 L6 0 M3 3 L6 3 M3 6 L6 6", "red");
        definePathPattern("Dash", "M0 0 M3 0 L6 0");
        definePathPattern("DoubleDash", "M0 0 M3 0 L6 0 M3 3 L6 3");
        //definePathPattern("TripleDash", "M0 0 M3 0 L6 0 M3 3 L6 3 M3 6 L6 6");
        definePathPattern("Dot", "M0 0 M4 0 L4.1 0", "black", 2, "round");
        definePathPattern("DoubleDot", "M0 0 M4 0 L4.1 0 M4 3 L4.1 3", "black", 2, "round");
        definePathPattern("SingleG", "M0 0 L1 0", "green");
        definePathPattern("DoubleG", "M0 0 L1 0 M0 3 L1 3", "green");
        definePathPattern("SingleR", "M0 0 L1 0", "red");
        definePathPattern("TripleR", "M0 0 L1 0 M0 3 L1 3 M0 6 L1 6", "red");
        definePathPattern("ZigzagB", "M0 3 L1 0 3 6 4 3", "blue");
        definePathPattern("ZigzagR", "M0 3 L1 0 3 6 4 3", "red");
        definePathPattern("BigZigzagR", "M0 4 L2 0 6 8 8 4", "red");
        definePathPattern("DoubleZigzagB", "M0 3 L1 0 3 6 4 3 M0 9 L1 6 3 12 4 9", "blue");
        definePathPattern("CrossG", "M0 0 M3 0 M1 0 L1 8", "green");
        definePathPattern("CrossR", "M0 0 M3 0 M1 0 L1 8", "red");
        //definePathPattern("Railroad", "M0 2 L3 2 M0 6 L3 6 M1 0 L1 8");  // also == Double & Cross
        definePathPattern("BackSlash", "M0 3 L2 6 M1 0 L5 6 M4 0 L6 3");
        definePathPattern("Slash", "M0 3 L2 0 M1 6 L5 0 M4 6 L6 3");
        definePathPattern("Coil", "M0 0 C2.5 0  5 2.5  5 5  C5 7.5  5 10  2.5 10  C0 10  0 7.5  0 5  C0 2.5  2.5 0  5 0");
        definePathPattern("Square", "M0 0 M1 0 L7 0 7 6 1 6z");
        definePathPattern("Circle", "M0 3 A3 3 0 1 0 6 4  A3 3 0 1 0 0 3");
        definePathPattern("BigCircle", "M0 5 A5 5 0 1 0 10 5  A5 5 0 1 0 0 5");
        definePathPattern("Triangle", "M0 0 L4 4 0 8z");
        definePathPattern("Diamond", "M0 4 L4 0 8 4 4 8z");
        definePathPattern("Dentil", "M0 0 L2 0  2 6  6 6  6 0  8 0");
        definePathPattern("Greek", "M0 0 L1 0  1 3  0 3  M0 6 L4 6  4 0  8 0  M8 3 L7 3  7 6  8 6");
        definePathPattern("Seed", "M0 0 A9 9 0 0 0 12 0  A9 9 180 0 0 0 0");
        definePathPattern("SemiCircle", "M0 0 A4 4 0 0 1 8 0");
        definePathPattern("BlindHem", "M0 4 L2 4  4 0  6 4  8 4");
        definePathPattern("Zipper", "M0 4 L1 4 1 0 8 0 8 4 9 4  M0 6 L3 6 3 2 6 2 6 6 9 6");
        //definePathPattern("Zipper2", "M0 4 L1 4 1 0 8 0 8 4 9 4  M0 7 L3 7 3 3 6 3 6 7 9 7");
        definePathPattern("Herringbone", "M0 2 L2 4 0 6  M2 0 L4 2  M4 6 L2 8");
        definePathPattern("Sawtooth", "M0 3 L4 0 2 6 6 3");


        this.diagram.linkTemplate = // for parent-child relationships
            $(go.Link, {
                    routing: go.Link.Orthogonal,
                    curviness: 10,
                    layerName: "Background",
                    selectable: false,
                    fromSpot: go.Spot.Bottom,
                    toSpot: go.Spot.Top
                },
                $(go.Shape, {
                    strokeWidth: 2
                })
            );

        this.diagram.linkTemplateMap.add("Marriage", // for marriage relationships
            $(go.Link, {
                    selectable: false
                },
                $(go.Shape, {
                    strokeWidth: 2,
                    stroke: "darkgreen"
                })
            ));

        this.diagram.linkTemplateMap.add("relationship", // for marriage relationships
            $(go.Link, go.Link.Bezier, // slightly curved, by default
                {
                    isVisible: true,
                    layerName: "Background",
                    routing: go.Link.Normal,
                }, // users can reshape the link route

                $(go.Shape, {
                    geometryString: "M0 0 L1 0  1 3  0 3  M0 6 L4 6  4 0  8 0  M8 3 L7 3  7 6  8 6",
                    fill: "transparent",
                    stroke: "black"
                })
                /*
                  $(go.Shape, // the link's path shape
                      {
                          isPanelMain: true,
                          stroke: "transparent"
                      },
                      new go.Binding("stroke", "patt", function (f) {
                          return (f === "") ? "black" : "transparent";
                      }),
                      new go.Binding("pathPattern", "patt", convertPathPatternToShape))
                      */
                ,
                $(go.Shape, // the link's path shape
                    {
                        isPanelMain: true,
                        stroke: "transparent",
                        strokeWidth: 3
                    },
                    new go.Binding("pathPattern", "patt2", convertPathPatternToShape)),
                $(go.Shape, // the "to" arrowhead
                    {
                        toArrow: "",
                        fill: null,
                        scale: 1.2
                    },
                    new go.Binding("toArrow"),
                    new go.Binding("stroke", "patt", convertPathPatternToColor)),
                $(go.TextBlock, // show the path object name
                    {
                        segmentOffset: new go.Point(0, 12)
                    },
                    new go.Binding("text", "patt")),
                $(go.TextBlock, // show the second path object name, if any
                    {
                        segmentOffset: new go.Point(0, -12)
                    },
                    new go.Binding("text", "patt2"))
            )


        );

        //  this.init();
        console.log("can initial");

    }




    setupDiagram(focusId) {
        var array = this.getOriginalArray();
        console.log("setupDi originArray  = " + JSON.stringify(this.getOriginalArray()));



        //********** change object ***********

        var newdata = array;
        for (var i = 0; i < newdata.length; i++) {
            //   console.log(JSON.stringify(newdata[i]));
            if (newdata[i] && newdata[i].a) {
                var str = newdata[i].a;
                newdata[i].aobj = [];
                for (var j = 0; j < str.length; j++) {
                    if (str[j] == 'S') {
                        array[i].aobj.push({
                            attr: str[j],
                            index: 17,
                            show: true
                        });
                    } else {


                        array[i].aobj.push({
                            attr: str[j],
                            index: j + 1,
                            show: true
                        });
                    }

                }
            }

            if (array[i].age) {
                var a = {
                    year: array[i].age,
                    show: true
                };
                array[i].age = [a];
            }

            //key must be integer
            if (newdata[i].m && typeof newdata[i].m == "string") array[i].m = parseInt(newdata[i].m);
            if (newdata[i].f && typeof newdata[i].m == "string") array[i].f = parseInt(newdata[i].f);
            if (newdata[i].cou && typeof newdata[i].cou == "string") {
                array[i].cou = parseInt(newdata[i].cou);
            } else if (newdata[i].cou && typeof newdata[i].cou == "object") {
                for (var c = 0; c < newdata[i].cou.length; c++) {
                    array[i].cou[c] = parseInt(newdata[i].cou[c]);
                }
            }
        }

      //  console.log(JSON.stringify(newdata));
       // console.log(array[1].n);
        this.diagram.model =
            go.GraphObject.make(go.GraphLinksModel, { // declare support for link label nodes
                linkLabelKeysProperty: "labelKeys",
                // this property determines which template is used
                nodeCategoryProperty: "s",
                // create all of the nodes for people
                nodeDataArray: array
            });

console.log("Arter setupDi originArray  = " + JSON.stringify(this.getOriginalArray()));



        var node = this.diagram.findNodeForKey(focusId);
        if (node !== null) {
            this.diagram.select(node);
            node.linksConnected.each(function (l) {
                if (!l.isLabeledLink) return;
                l.opacity = 0;
                var spouse = l.getOtherNode(node);
                spouse.opacity = 0;
                spouse.pickable = false;



            });
        }

        this.setupMarriages();
        this.setupParents();
        this.diagram.animationManager.isEnabled = false;


    };

    reDiagram(){
      this.setupMarriages();
      this.setupParents();
    };





    findMarriage(a, b) { // A and B are node keys
        // console.log("findMarriage");

        var nodeA = this.diagram.findNodeForKey(a);
        var nodeB = this.diagram.findNodeForKey(b);
        if (nodeA !== null && nodeB !== null) {
            var it = nodeA.findLinksBetween(nodeB); // in either direction
            while (it.next()) {
                var link = it.value;
                if (link.data.category == "Marriage") return link;
                // Link.data.category === "Marriage" means it's a marriage relationship
                //if (link.data !== null) return link;
            }
        }
        return null;
    }



    findMarriageArray(key) {


        console.log("Key to find = "+key);
        var arr = this.getOriginalArray();
        var arrCou = [];

        function hasNum(num) {
            for (var i = 0; i < arrCou.length; i++) {
                if (arrCou[i] == num && num != key)
                    return true;
            }
            return false;
        }

        //for everynode
        for (var i = 0; i < arr.length; i++) {
            //keyตัวเอง มี cou
            if (arr[i].key == key && arr[i].cou) {
                if (typeof arr[i].cou == "number"||typeof arr[i].cou == "string") {

                    if (!hasNum(arr[i].cou)) {
                        arrCou.push(parseInt(arr[i].cou));
                        console.log("in my key");
                        console.log("arrCou = " + arrCou[0]);
                    }
                } else if (typeof arr[i].cou == "object") {
                    for (var j = 0; j < arr[i].cou.length; j++) {
                        if (!hasNum(arr[i].cou[j])) arrCou.push(parseInt(arr[i].cou[j]));
                    }
                }

                console.log(typeof arr[i].cou);
            }
            //โหลดอื่นที่มี cou
            else if (arr[i].cou) {
                if (arr[i].cou == key && (typeof arr[i].cou == "number"||typeof arr[i].cou == "string")) {
                    if (!hasNum(arr[i].key)) arrCou.push(arr[i].key);
                } else if (typeof arr[i].cou == "object") {
                    for (var j = 0; j < arr[i].cou.length; j++) {
                        if (arr[i].cou[j] == key) {
                            if (!hasNum(arr[i].key)) arrCou.push(parseInt(arr[i].key))
                        };
                    }
                }
            }
        }
        for (var i = 0; i < arrCou.length; i++) {
               arrCou[i] = parseInt(arrCou[i]);
            }
        return arrCou;
    }


    // now process the node data to determine marriages
    setupMarriages() {
        // console.log("setupMarriages");
        var model = this.diagram.model;
        var nodeDataArray = model.nodeDataArray;
        for (var i = 0; i < nodeDataArray.length; i++) { //เอาทุกโหนดมา
            var data = nodeDataArray[i];
            var key = data.key; //เก็บคีย์โหนดไว้
            var uxs = data.cou; //เก็บคีย์แฟนเอาไว้
        //    console.log('key :' + key + " uxs" + uxs);
            if (uxs !== undefined) { //ถ้ามีคีย์แฟน
                if (typeof uxs === "number") uxs = [uxs]; // และคีย์แฟนเป็นเลข ก็ให้เก็บเข้า array
                for (var j = 0; j < uxs.length; j++) { //วนสำหรับแฟนทุกคน
                    var wife = uxs[j]; // เอาคีย์แฟนแต่ละคนใช้ในชื่อของตัวแปล wife

                    if (key === wife) { //ถ้า set เป็นแฟนกับตัวเองให้ไม่ต้องทำไร
                        // or warn no reflexive marriages
                        continue;
                    }
                    var link = this.findMarriage(key, wife); //หาลิงค์การแต่งงานของทั้งสองคนออกมา
                    if (link === null) { //ถ้าหาไม่ได้ค่อยเพิ่มลิงค์ หาเจอไม่ต้องทำไร
                        // add a label node for the marriage link
                        var mlab = {
                            s: "LinkLabel"
                        };
                        model.addNodeData(mlab);
                        // add the marriage link itself, also referring to the label node
                        var mdata = {
                            from: key,
                            to: wife,
                            labelKeys: [mlab.key], //label ว่ามันจะไปอยู่ชั้นไหนดี
                            category: "Marriage"
                        };
                 //       console.log('marry: ' + key + " and " + wife);
                        model.addLinkData(mdata);

                    }
                }
            }

        }



    }

    //process parent-child relationships once all marriages are known


    setupParents() {
        // console.log("setupParent");
        var model = this.diagram.model;
        var nodeDataArray = model.nodeDataArray;
        for (var i = 0; i < nodeDataArray.length; i++) {
            var data = nodeDataArray[i];
            var key = data.key;
            var mother = data.m;
            var father = data.f;
            if (mother !== undefined && father !== undefined) {
                var link = this.findMarriage(mother, father);
                if (link === null) {
                    // or warn no known mother or no known father or no known marriage between them
                    if (window.console) window.console.log("unknown marriage: " + mother + " & " + father);
                    continue;
                }
                var mdata = link.data;
                var mlabkey = mdata.labelKeys[0];
                var cdata = {
                    from: mlabkey,
                    to: key
                };
                this.diagram.model.addLinkData(cdata);
            }

        }


    };





    init() {
        this.setupDiagram(1);
    };


}



//***********************
enGeno.prototype.copyJSON = function(obj){
  return JSON.parse(JSON.stringify(obj));
}

//Now can editNode
enGeno.prototype.editNodeData = function (node, obj) {

    //เปลี่ยน/เพิ่มเติม data ในโหนดที่ส่งเข้ามาเป็นพารามิเตอร์
    this.diagram.model.startTransaction("modified Node");
    node = this.diagram.model.findNodeDataForKey(node.data.key);
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            //  console.log("keynode : "+node.data.key);

            console.log(prop + " : " + obj[prop]);
            if (prop == "a") {
                obj[a] = reRankAttr(obj[a]);
            }

            this.diagram.model.setDataProperty(node, prop, obj[prop]);
        }
    }


    this.diagram.model.commitTransaction("modified Node");
    console.log("edit");
}



enGeno.prototype.changeNodeData = function (node, obj) {
    this.diagram.model.startTransaction("modified Node");
    node = this.diagram.model.findNodeDataForKey(node["key"]);

    this.diagram.model.commitTransaction("modified Node");
}

//on righr click have a function
enGeno.prototype.setContextNode = function () {

   /* this.contextNode = $(go.Adornment, "Vertical", // that has one button
        $("ContextMenuButton",
            $(go.TextBlock, "add daughter"), {
                click: this.addChild
            }
        ),
        $("ContextMenuButton",
            $(go.TextBlock, "add son"), {
                click: this.addChild
            }
        ),
        $("ContextMenuButton",
            $(go.TextBlock, "add spouse"), {
                click: this.addSpouse
            }
        ),
        $("ContextMenuButton",
            $(go.TextBlock, "Edit Node"), {
                click: this.editNode
            }
        )

        // more ContextMenuButtons would go here
    );*/
    
    this.contextNode = $(go.Adornment, "Vertical", // that has one button
        $("ContextMenuButton",
            $(go.TextBlock, "add daughter"), {
                click: (function(e, obj){
                    contextFunction(e, obj);
                })
            }
        ));
        
        function contextFunction(e, obj){
            addSon(obj);
        }

}


enGeno.prototype.addNode = function (data) {
    this.diagram.startTransaction('new node');
    if (data) {
        var data = {
            key: 5,
            n: "NewNode",
            s: F,
            m: 2,
            f: 3,
            a: [B, H]
        };
    }
    this.array.push(data);
    this.pushObjInOriginalArray(data);
    this.diagram.model.addNodeData(data);
    part = this.diagram.findPartForData(data);
    // part.location = this.diagram.toolManager.contextMenuTool.mouseDownPoint;
    this.diagram.commitTransaction('new node');

    this.setupDiagram();

}


enGeno.prototype.addChild = function (node, gender, data, couKey) {

    // take a button panel in an Adornment, get its Adornment, and then get its adorned Node


    //find node form key
    var arrCou = this.findMarriageArray(node.data.key);
    console.log("arrCou[0]1111111111111111111");
    console.log(arrCou[0]);
    var keyCou;
    if (couKey && this.getOriginalArray()["couKey"]) {
        keyCou = couKey;
    } else if (arrCou.length > 0 && !couKey) {
        keyCou = arrCou[0];
    } else if (arrCou.length <= 0) {
        keyCou = this.addSpouse(node);
    //  keyCou =this.genKey();
    }


    var newnode = {
        key:this.genKey(),
        n: "newNode"
    };
    if (gender == "M" || gender == "m")
        newnode["s"] = "M";
    else if (gender == "F" || gender == "f")
        newnode["s"] = "F";


    if (node.data.s == "F") {
        newnode["m"] = node.data.key;
        newnode["f"] = keyCou;

    } else if (node.data.s == "M") {
        newnode["f"] = node.data.key;
        newnode["m"] = keyCou;

    }

    // have the Model add the node data
    if (data != 'undefine') {
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                newnode[prop] = data[prop];
            }
        }
    }

    this.pushObjInOriginalArray(newnode);
    //this.pushChangedArrayIntoHistory();
   //******RUN this.setupDiagram();

/*
    this.diagram.startTransaction("add child");
    this.diagram.model.addNodeData(this.copyJson(newnode));
    var link = this.findMarriage(keyCou,newnode.key); ;

    if(link==null){
  //  var keyCou = this.addSpouse(node);
      link = this.findMarriage(keyCou,newnode.key);
    }
    if (link === null) {
        // or warn no known mother or no known father or no known marriage between them
        if (window.console) window.console.log("unknown marriage: " + mother + " & " + father);
        continue;
    }
    var mdata = link.data;
    console.log(JSON.stringify(mdata) );
    var mlabkey = mdata.labelKeys[0];
    var cdata = {
        from: mlabkey,
        to: newnode.key
    };

    this.diagram.model.addLinkData(cdata);
    this.diagram.commitTransaction("add child");

*/
    this.diagram.startTransaction("add child");

            var data = newnode;
            var key = newnode.key;
            var mother = newnode.m;
            var father = newnode.f;

    this.diagram.model.addNodeData(this.copyJSON(newnode));
    var link = this.findMarriage(keyCou,newnode.key); ;
            if (mother !== undefined && father !== undefined) {
                var link = this.findMarriage(mother, father);

                var mdata = link.data;
                console.log(link.data.key);
                var mlabkey = mdata.labelKeys[0];
                console.log(link.data.labelKeys[0]);
                var cdata = {
                    from: mlabkey,
                    to: key
                };
                this.diagram.model.addLinkData(cdata);
            }

    this.diagram.commitTransaction("add child");

}




enGeno.prototype.addSon = function (node, data) {
    this.addChild(node, "M", data);
    console.log("11111112");
}

enGeno.prototype.addDaughter = function (node, data) {
    this.addChild(node, "F", data);
}

enGeno.prototype.addSpouse = function (node, data) {

 console.log("Before origin array = "+JSON.stringify(this.getOriginalArray()));

    // var node = b.part.adornedPart;
    var data = data;
    var key = this.genKey();
    if (data != null) {
        newnode = data;
    }
    var newnode = {
        "key": key,
        n: "Spouse",
        cou: node.data.key
    };
    if (node.data.s == "M" || node.s == "m") {

        newnode.s = "F";

    } else if (node.data.s == "F" || node.s == "f") {

        newnode.s = "M";

    }
    this.addSpouseArray(this.copyJSON(node.data.key), key);
    this.pushObjInOriginalArray(newnode);



    this.diagram.startTransaction("add Spouse");
   this.diagram.model.addNodeData(this.copyJSON(newnode));
   var mlab = {
       s: "LinkLabel"
   };
   this.diagram.model.addNodeData(mlab);
   // add the marriage link itself, also referring to the label node
   var mdata = {
       from: node.data.key,
       to: key,
       labelKeys: [mlab.key], //label ว่ามันจะไปอยู่ชั้นไหนดี
       category: "Marriage"
   };
//       console.log('marry: ' + key + " and " + wife);
   this.diagram.model.addLinkData(mdata)
   this.diagram.commitTransaction("add Spouse");




// this.setupDiagram();
//  this.reDiagram();
    console.log("Add Node Spouse");
    return key;

}

enGeno.prototype.getSelectedNodes = function () {

    //  console.log("number : " + this.diagram.selection.count);

    //return Array of Node
    var part = this.diagram.selection.iterator;
    //this.selectedNodes= part;
    //do sth for every Node
    var arrNode = [];
    while (part.next()) {
        //print Node
        var node = part.value;
        //  console.log("Key: " + node.data.key + ", Name : " + node.data.n);
        // var newnode = this.setFormatNode(node);
        arrNode.push(node);
        // this.selectedNodes.push(node);

    }

    //this.diagram.selection.iterator.value;
    return arrNode;
}


enGeno.prototype.findNode = function (data) {

    if (typeof data == 'number') {
        var foundNode = this.diagram.findNodeForKey(data);
        if (foundNode != null)

            return foundNode.data;
    } else if (typeof data == 'object') {
        var foundNode = this.diagram.findNodeForData(data);
        //console.log("foundNode key : "+foundNode.data.key);
        return foundNode.data;
    } else
        return null;
}

enGeno.prototype.removeNode = function (node) {
    var nodeRemove = this.diagram.model.findNodeDataForKey(node.data.key);
    this.diagram.commandHandler.deleteSelection();
    /*
    var key = node.data.key;
    this.diagram.startTransaction("deleteNode");
   
   var it = node.linksConnected;
    while(it.next()){
        var child = it.value;
        console.log(it.value);
        this.diagram.model.removeLinkData(child);
    }
    var it = node.findLinksOutOf();
    while(it.next()){
        var child = it.value;
        console.log(it.value);
        this.diagram.model.removeLinkData(it.value);
    }
    this.diagram.model.removeNodeData(node);
    this.diagram.commitTransaction("deleteNode");*/

}

enGeno.prototype.getDataNodeToNewArray = function (node) {
    var dataArray = this.diagram.model.nodeDataArray;
  //  console.log(JSON.stringify(dataArray));
    var newArr = [];
    for(var i=0 ; i<dataArray.length ; i++){
      //check if key>0 is mydata
      var node = dataArray[i];
      if(node.key >=0){
        var obj = {};
        for (var prop in node) {
          if(prop != "__gohashid" && prop != "aobj" && prop != "age"){
            obj[prop] = node[prop];
          }else if (prop == "age") {
            obj["age"] = node[prop][0]["year"];
          }
          newArr[""+obj.key] = this.copyJSON(obj);
        }
      }
    }
    console.log(JSON.stringify(newArr));
    return JSON.parse(JSON.stringify(newArr));
}
enGeno.prototype.reRankAttr = function (a) {

    for (var j = 0; j < a.length; j++) {
        if (a[j] == 'S') {
            node.a.push({
                attr: str[j],
                index: 17
            });
        } else {
            a[j].index = j + 1;
        }
    }
    return a;
}

//**************** Filter ********************
enGeno.prototype.filter = function (str) {
    var model = this.diagram.model;

    this.diagram.startTransaction("changed color");
    //for each Node in diagram

    for (var i = 0; i < model.nodeDataArray.length; i++) {
        var data = model.nodeDataArray[i];
        if (data.aobj) { //if has attribute a
            for (var j = 0; j < data.a.length; j++) {
                var a = data.aobj[j].attr; //for each attribute of Node
                var has;
                for (var k = 0; k < str.length; k++) {
                    if (a == str[k]) {
                        has = true;
                        break;
                    } else has = false;
                }
                if (has || !str) { //if same mean user want to see this attribute
                    model.setDataProperty(data.aobj[j], "show", true);
                } else {
                    model.setDataProperty(data.aobj[j], "show", false);
                }
            }
        }
    }
    this.diagram.commitTransaction("changed color");
    console.log(JSON.stringify(model.nodeDataArray));

}


enGeno.prototype.setFormatNode = function (node) {
    var newNode = new Object;
    Object.assign(newNode, node);

    var newNode = Object.create(node.data);
    console.log(JSON.stringify(newNode));
    if (newNode.a) {
        var tempA = newNode.a;
        var str = "";
        for (var i = 0; i < tempA.length; i++) {
            str += tempA[i].attr;
        }
        newNode.a = str;
        console.log(JSON.stringify(node.data));
    }
    return newNode;

}


enGeno.prototype.genKey = function () {
    var arr = this.getOriginalArray();
    console.log(arr.length);
    var key = 0;
    var can = false;
    while (!can) {
        can = true;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].key == key) {
                can = false;
                key++;
            }
        }

    }

    return key;
}


enGeno.prototype.searchByKeyWord = function (keyword) {

        var arrResult = [];
        var arr = this.getOriginalArray();
        for (var i = 0; i < arr.length; i++) {
            var comment = "" + arr[i].comment;
            var reg = new RegExp(keyword, "gi");
            var n = comment.search(reg);
            var strAttr;
            var found=false;

            if (keyword =="ซึมเศร้า")strAttr="A";
            else if(keyword == "โรคอ้วน" ) strAttr="ฺB";
            else if(keyword == "มะเร็ง") strAttr="C";
            else if(keyword == "หัวใจ") strAttr="D";
            else if(keyword == "ความดันสูง") strAttr="E";
            else if(keyword == "เอดส์" || keyword == "HIV"|| keyword == "hiv") strAttr="F";
            else if(keyword == "ตับอักเสบ") strAttr="G";
            else if(keyword == "เบาหวาน") strAttr="H";
            else if(keyword == "ไขข้อ") strAttr="I";
            else if(keyword == "ออทิสติก") strAttr="J";
            else if(keyword == "อัลไซเมอร์") strAttr="K";
            else if(keyword == "โรคติดต่อทางเพศสัมพันธ์") strAttr="L";
            else if(keyword == "เสียชีวิต"||keyword == "ตาย") strAttr="S";

            if(strAttr){
                var index = arr.indexOf(strAttr);
                if(index>=0)found=true;
            }


            if (n >= 0 || found) {
                arrResult.push({
                    key: arr[i].key,
                    pos: n
                });
            }
        }

        if (arrResult.length > 0) {
            for (i = 0; i < arrResult.length; i++) {
                this.diagram.findNodeForKey(arrResult[i].key).isSelected = true;
            }
        }

        return arrResult;
    }
    //********** make img****************
enGeno.prototype.makeImage = function (para1, para2) {
   
    var db = this.diagram.documentBounds.copy();
    var boundswidth = db.width;
    var boundsheight = db.height;
    if (!para1 && !para2) {
        var img = this.diagram.makeImage({
            scale: 1,
            type: "image/png",
            size: new go.Size(boundswidth + 100, boundsheight + 100),
            background: "transparent"
        });
        console.log('in 1');
    } else if (para1 && !para2) {
        var scale = para1;
        var img = this.diagram.makeImage({
            scale: scale,
            type: "image/png",
            size: new go.Size(boundswidth * scale + 100, boundsheight * scale + 100),
            background: "transparent"
        });
    } else {
        var scale1 = para1 / boundswidth;
        var scale2 = para2 / boundsheight;
        var img = this.diagram.makeImage({
            scale: (scale1 < scale2) ? scale1 : scale2,
            type: "image/png",
            size: new go.Size(para1 + 100, para2 + 100),
            background: "transparent"
        });
        console.log('in 2');
    }

    // img.className  = "images";
    return img;
}


//********** load function******************
enGeno.prototype.load = function () {
    var JsonData = [
        {
            key: 1,
            n: "Eve",
            s: "M",
            m: 2,
            a: "BHS"
    }, {
            key: 5,
            n: "eve2",
            s: "M",
            m: 2,
            a: "BHS"
    },
        {
            key: 2,
            n: 'Mom',
            s: 'F',
            cou: 3,
            a: "CGK"
    },
        {
            key: 3,
            n: "Dad",
            s: 'M',
            a: "AELS"
    },
        {
            key: 4,
            n: "Ever",
            s: "F",
            m: 2,
            f: 3,
            a: "BH",
            comment: "Hello"
    }
];
    this.setOriginalArray(JsonData);
    this.setupDiagram();
}



enGeno.prototype.setupRelationship = function () {
    // console.log("setupMarriages");
    var model = this.diagram.model;
    // add a label node for the marriage link
    var arrow = "OpenTriangle";
    /*
    function addLinks(patt1a, patt1b, patt2a, patt2b, patt3a, patt3b) {
      var arrow = "OpenTriangle";

      model.addLinkData({ from: 1, to: 5, patt: patt1a, patt2: patt1b, toArrow: arrow });

      if (patt2a) {
        model.addLinkData({ from: 1, to:5, patt: patt2a, patt2: patt2b, toArrow: arrow });

        if (patt3a) {

          model.addLinkData({ from: 1, to: 5, patt: patt3a, patt2: patt3b, toArrow: arrow });
        }
      }
    }
    */


    // add the marriage link itself, also referring to the label node
    var mdata = {
        from: 7,
        to: 14,
        category: "relationship",
        patt: "BigZigzagR",
        toArrow: arrow

    };
    model.addLinkData(mdata);

    var it = this.diagram.nodeDataArray;
    while (it.next()) {
        if (it.value instanceof go.Node) {
            console.log(it.value.data.position);
        }
    }



}



//************** Open Form File ***************
enGeno.prototype.export = function(filepath){

  var arr = this.getDataNodeToNewArray();
	var txtFile = [];
  //for every node
  for(var i=0 ;i<arr.length;i++){
    //every attribute in each node
    var node = arr[i];
    var str ="";
    var size = Object.keys(node).length;
    var num=1;
    for(var attr in node){
      var value="";
    //  console.log(typeof node[""+attr]);
      if(typeof node[""+attr] =="object"){
        for(var j=0;j<node[""+attr].length;j++){
          value += node[""+attr][j];
        }
      }else {
        value=node[""+attr]
      }
      str+= ""+attr+":"+value;

      if(num<size) str+=",";
      num++;
    }
      if(i<arr.length-1) str +='\r\n';
    txtFile.push(str);
  }
  console.log(txtFile);

    var file=null;
    var data  = new File(txtFile, {type: 'plain/text'});
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (file !== null) {
      window.URL.revokeObjectURL(file);
    }
    file = window.URL.createObjectURL(data);
    return file;

}






//******************************
/*
function openFile(event) {
    var data=[];
   var text;

    var input = event.target[0];
    alert(input);
    var data=[];

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      var lines = text.split("\r\n");

    for(var line = 0; line < lines.length; line++){

     data.push(readByLine(lines[line]));

    }
         //alert(JSON.stringify(data));
        init(data);

    function readByLine(line){
        var attribute = line.split(',');
        var obj ={};
        for(var item = 0; item < attribute.length; item++){
            var buddle = attribute[item].split(':');
            var key = buddle[0];
            var value = buddle[1]

            //if Attribute a
            if(key == 'a'){
                value = value.split('');
            }

            obj[key] = value;
        }
        return obj;

    }


    };
    reader.readAsText(input.files[0]);


    return data;

  };
*/
//*************************
