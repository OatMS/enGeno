//find new available key
var arr = this.getOriginalArray();
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

var data = [{
        n: "สมศรี",
        key: 1,
        m: 2,
        f: 3,
        s: "F",
        a: "ABCD",
                    },
    //mother
    {
        key: 2,
        n: "แม่",
        s: "F",
        cou: 3
                    },
    //father
    {
        key: 3,
        n: "พ่อ",
        s: "M",
        cou: 2
                    }
                        ];


//******************************************
//initial diagram
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
function attrFill(a) {
            if (a.show == true && a.attr && (a.index == 1 || a.index == 2 || a.index == 3 || a.index == 4)) {
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
//determine the geometry for each attribute shape in a male
var tlsq = go.Geometry.parse("F M1 1 l19 0 0 19 -19 0z");
        var trsq = go.Geometry.parse("F M20 1 l19 0 0 19 -19 0z");
        var brsq = go.Geometry.parse("F M20 20 l19 0 0 19 -19 0z");
        var blsq = go.Geometry.parse("F M1 20 l19 0 0 19 -19 0z");
        var slash = go.Geometry.parse("F M38 0 L40 0 40 2 2 40 0 40 0 38z");

//Template male node s:M
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
                    },
                    contextMenu: this.contextNode
                        //this.setRightClickedNode // define a context menu for each node
                },
                $(go.Panel, {
                        name: "ICON"
                    },
                    $(go.Panel, {
                            itemTemplate: $(go.Panel,
                                $(go.Shape, "Square", {
                                    width: 50,
                                    height: 50,
                                    strokeWidth: 2,
                                    fill: "white"
                                }, new go.Binding("strokeWidth", "", activeShow))),
                            position: new go.Point(-5, -5)
                        },
                        new go.Binding("itemArray", "active")
                    ),
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
                                    new go.Binding("stroke", "", ageTextColor)
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

 // determine the geometry for each attribute shape in a female;
var tlarc = go.Geometry.parse("F M20 20 B 180 90 20 20 19 19 z");
        var trarc = go.Geometry.parse("F M20 20 B 270 90 20 20 19 19 z");
        var brarc = go.Geometry.parse("F M20 20 B 0 90 20 20 19 19 z");
        var blarc = go.Geometry.parse("F M20 20 B 90 90 20 20 19 19 z");


        function femaleGeometry(a) {
            if (a.attr) {
                if (a.attr == 'S') return slash;
                if (a.index == 1) return tlarc;
                else if (a.index == 2) return trarc;
                else if (a.index == 3) return brarc;
                else if (a.index == 4) return blarc;
                else return tlsq;
            }

        }

//Template female node s:F
 this.diagram.nodeTemplateMap.add("F", // female
            $(go.Node, "Vertical", {
                    locationSpot: go.Spot.Center,
                    locationObjectName: "ICON"
                }, {
                    doubleClick: doubleClickNode,
                    click: function (e, node) {
                        clickNode(e, node)
                    },
                    contextMenu: this.contextNode
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


                    $(go.Panel, {
                            itemTemplate: $(go.Panel,
                                $(go.Shape, "Circle", {
                                    width: 50,
                                    height: 50,
                                    strokeWidth: 2,
                                    fill: "transparent"
                                }, new go.Binding("strokeWidth", "", activeShow))),
                            position: new go.Point(-5, -5)
                        },
                        new go.Binding("itemArray", "active")
                    ),
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
                                    new go.Binding("stroke", "", ageTextColor)
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
        function activeShow(active){
            if(active)
                return 2;
            else 
                return 0;
        }

//Template infant node s:I
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
                        name: "ICON",
                        margin:2
                    },
                    $(go.Shape, "Triangle", {
                        width: 40,
                        height: 40,
                        strokeWidth: 2,
                        fill: "white",
                        portId: ""
                    }),


                    $(go.Panel, {
                            itemTemplate: $(go.Panel,
                                $(go.Shape, "Triangle", {
                                    width: 50,
                                    height: 50,
                                    strokeWidth: 2,
                                    fill: "white"
                                }, new go.Binding("strokeWidth", "", activeShow))),
                            position: new go.Point(-5, -5)
                        },
                        new go.Binding("itemArray", "active")
                    ),
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
