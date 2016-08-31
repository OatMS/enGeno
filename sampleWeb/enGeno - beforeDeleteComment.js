//var selectedNode = [];
var $ = go.GraphObject.make;


//---------------Layout----------------------------


// A custom layout that shows the two families related to a person's parents
function GenogramLayout() {
    go.LayeredDigraphLayout.call(this);
    this.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn;
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

GenogramLayout.prototype.findParentsMarriageLabelNode = function (node) {
    var it = node.findNodesInto();
    while (it.next()) {
        var n = it.value;
        if (n.isLinkLabel) return n;
    }

    return null;
};



//------------------------------------API----------------------


var enGeno = class {


    constructor(data, div) {


        var diagram;
        var contextNode;
        var nodeOnRightClicked;
        //  this.setContextNode();
        var originArray = data;


        this.setOriginalArray = function (ori) {
            originArray = ori;
        }

        this.pushObjInOriginalArray = function (obj) {
            originArray.push(obj);
        }
        this.getOriginalArray = function () {
            var arr = JSON.parse(JSON.stringify(originArray));
            //     console.log("inget origin = "+JSON.stringify(arr));
            return arr;
        }

        this.setProopotyArray = function (key, pro, value) {
            for (var i = 0; i < originArray.length; i++) {
                if (originArray[i].key == key) {
                    originArray[i][pro] = value;
                }
            }
        }

        this.addSpouseArray = function (key, value) {
            for (var i = 0; i < originArray.length; i++) {
                if (originArray[i].key == key) {
                    if (typeof originArray[i].cou == "object") {
                        var can = true;
                        for (var j = 0; j < originArray[i].cou.length; j++) {
                            if (key == originArray[i].cou[j]) {
                                can = false;
                                break;
                            }

                        }
                        if (can) {
                            originArray[i].cou.push(value);
                        }
                    } else if (typeof originArray[i].cou == "number") {
                        var temp = originArray[i].cou;
                        originArray[i].cou = [temp, value];

                    } else {
                        originArray[i].cou = value;
                    }
                }
            }
        }

        this.deleteSpouseArray = function (key, value) {
            for (var i = 0; i < originArray.length; i++) {
                if (originArray[i].key == key) {
                    if (typeof originArray[i].cou == "object") {

                        var index = originArray[i].cou.indexOf(value);
                        if (index > -1) {
                            array.splice(index, 1);
                        } else if (typeof originArray[i].cou == "number") {
                            originArray[i].cou = '';

                        }
                    }
                }
            }
        }





        //if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
        /*
         this.diagram =
             $(go.Diagram, {
                 initialAutoScale: go.Diagram.Uniform,
                 initialContentAlignment: go.Spot.Center,
                 // when a node is selected, draw a big yellow circle behind it
                 nodeSelectionAdornmentTemplate:

                     $( go.Adornment, "Auto",  // the predefined layer that is behind everything else
                     $(go.Shape, "Circle", {
                         fill: "yellow",
                         stroke: null
                     }),
                     $(go.Placeholder)

                 ),

                 layout: // use a custom layout, defined below
                     $(GenogramLayout, {
                     direction: 90,
                     layerSpacing: 30,
                     columnSpacing: 10
                 })
             });
         */

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
            if (a.show == true) {
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

        // determine the geometry for each attribute shape in a male;
        // except for the slash these are all squares at each of the four corners of the overall square
        var tlsq = go.Geometry.parse("F M1 1 l19 0 0 19 -19 0z");
        var trsq = go.Geometry.parse("F M20 1 l19 0 0 19 -19 0z");
        var brsq = go.Geometry.parse("F M20 20 l19 0 0 19 -19 0z");
        var blsq = go.Geometry.parse("F M1 20 l19 0 0 19 -19 0z");
        var slash = go.Geometry.parse("F M38 0 L40 0 40 2 2 40 0 40 0 38z");



        function maleGeometry(a) {
            //   console.log("attr : "+a[attr]+" ,index : "+a.index);
            if (a.attr == 'S') return slash;
            if (a.index == 1) return tlsq;
            else if (a.index == 2) return trsq;
            else if (a.index == 3) return brsq;
            else if (a.index == 4) return blsq;



            console.log(JSON.stringify(a));

        }

        // determine the geometry for each attribute shape in a female;
        // except for the slash these are all pie shapes at each of the four quadrants of the overall circle
        var tlarc = go.Geometry.parse("F M20 20 B 180 90 20 20 19 19 z");
        var trarc = go.Geometry.parse("F M20 20 B 270 90 20 20 19 19 z");
        var brarc = go.Geometry.parse("F M20 20 B 0 90 20 20 19 19 z");
        var blarc = go.Geometry.parse("F M20 20 B 90 90 20 20 19 19 z");





        function femaleGeometry(a) {
            //   console.log("attr : "+a[attr]+" ,index : "+a.index);
            if (a.attr == 'S') return slash;
            if (a.index == 1) return tlarc;
            else if (a.index == 2) return trarc;
            else if (a.index == 3) return brarc;
            else if (a.index == 4) return blarc;



            console.log(JSON.stringify(a));

        }



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
                        //  ,contextMenu: this.setRightClickedNode // define a context menu for each node
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

        //  this.init();
        console.log("can initial");

    }




    setupDiagram(focusId) {
        var array = this.getOriginalArray();
        console.log("originArray  = " + JSON.stringify(this.getOriginalArray()));

        // console.log("on create data = "+JSON.stringify(this.array));
        /*
                console.log("SetupDiagram");
                //  var array = this.data;
                var array = [
                    {
                        key: 1,
                        n: "Eve",
                        s: "F",
                        m: 2,
                        a: "BHS"
                    },
                    {
                        key: 2,
                        n: 'Mom',
                        s: 'F',
                        cou: 3,
                        a: "CGK"
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
                        a: "BH"
                    },
                    {
                        key: 5,
                        n: 'Ever',
                        s: 'M',
                        cou: 4
                    }
        ];
        */
        //  var newdata = [];
        //var newdata = this.data;
        //  var newdata = array;
        /*
        for (var i=0; i<array.length; i++) {
            if(array[i].a != null){
            for (var j=0; j<array[i].a.length; j++) {
                 console.log("attr : "+array[i].a[j]+" ,index : "+j);
                array[i].a[j] = { attr:array[i].a[j] , index:j };
               
            }
                
               
            }
          
    }
    */

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
                    //   console.log(JSON.stringify(array[i]));

                }
            }
        }
        //this.data = newdata;
        //   console.log("data = "+JSON.stringify(array));



        console.log(array[1].n);
        this.diagram.model =
            go.GraphObject.make(go.GraphLinksModel, { // declare support for link label nodes
                linkLabelKeysProperty: "labelKeys",
                // this property determines which template is used
                nodeCategoryProperty: "s",
                // create all of the nodes for people
                nodeDataArray: array
            });




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

     haveKey(key){
         var arr = getOriginalArray();
         for(var i=0;i<arr.length;i++){
             if(arr[i].key == key)
                 return true;
         }
         
         return false;
     }

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
    
    //เหลือเช็คอาเรย์มันแอดเลขซ้ำค่า
    findMarriageArray(key){
        
        
        
        var arr = this.getOriginalArray();
        var arrCou =[];
        function hasNum(num){
            for(var i=0;i<arrCou.length;i++){
                if(arrCou[i] == num)
                    return true;
            }
            return false;
        }
        //for everynode
        for(var i=0;i<arr.length;i++){
            //keyตัวเอง มี cou
             if(arr[i].key == key && arr[i].cou){
                if(typeof arr[i].cou == "object"){ 
                    for(var j=0;j<arr[i].cou.length;j++){
                        if(!hasNum(arr[i].cou[j])){
                        arrCou.push(arr[i].cou[j]);
                        console.log("1.arr[i].key == key && arr[i].cou--"+arr[i].cou[j]);}
                    }
                }else if(typeof arr[i].cou =='number')
                     if(!hasNum(arr[i].cou)){
                    arrCou.push(arr[i].cou);
                 console.log("2.typeof arr[i].cou ==number--"+arr[i].cou);}
            }
            else if( arr[i].cou && typeof arr[i].cou =='object'){
                for(var j=0;j<arr[i].length;j++){
                    //marry formanother node
                    if(arr[i].cou[j] == key){
                         if(!hasNum(arr[i].key)){
                        arrCou.push(arr[i].key);
                        console.log("3.arr[i].cou[j] == key--"+arr[i].key);}
                    }
                }
            }
            else if(arr[i].cou && typeof arr[i].cou =='number' && arr[i].cou == key){
                 if(!hasNum(arr[i].key)){
                arrCou.push(arr[i].key);
                console.log("4.arr[i].cou && typeof arr[i].cou =='number' && arr[i].cou == key-"+arr[i].key);}
            }
            
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
            /*
            else if(mother !== undefined || father !== undefined){
                alert("Key :"+key);
              var parNode;
                if(mother!== undefined){
                 parNode = myDiagram.findNodeForKey(mother);
              }else{
                 parNode = myDiagram.findNodeForKey(father);
              }  
                  var link = parNode.findLinksConnected();
                
            var mdata = link.data;
            var mlabkey = mdata.labelKeys;
            var cdata = { from: mlabkey, to: key };
            myDiagram.model.addLinkData(cdata);
                
            }
            */
        }


    };



    init() {
        //  this.setContextNode();
        //  console.log("in function init");
        this.setupDiagram(1);

        //  console.log("can set Diagram");
        //  this.setupMarriages();
        //  console.log("can set married");
        //  this.setupParents();
        //  console.log("can set Parent");

    }



}



//***********************
/*
enGeno.prototype.setSelectedNode = function () {
    var selnode = this.diagram.selection;
    for (var node in selnode) {
        if (node instanceof go.Node) {
            this.selectedNode = [];
            this.selectedNode.push(node);
        }
    }
}

*/

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

    this.contextNode = $(go.Adornment, "Vertical", // that has one button
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
    );

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



/*111
//ตรวจว่าเป็นผญไหม-หาเส้นโยงคู่-เจอเส้นที่โยงแต่งงาน-เจอคีย์ผู้ชาย-ได้เส้นออกมา-เอาเส้นมาเพิ่มโหนด
enGeno.prototype.addChild = function (node, gender, data) {

    // take a button panel in an Adornment, get its Adornment, and then get its adorned Node

    //find node form key 
    var arrCou = this.findMarriageArray(node.data.key);
    


    var newnode = {
        n: "newNode"
    };
    if (gender == "M" || gender == "m")
        newnode = {
            n: "newNode",
            s: "M"
        };
    else if (gender == "F" || gender == "f")
        newnode = {
            n: "newNode",
            s: "F"
        };
    var keyCou;
    //   var node = b.part.adornedPart;
    var isMarried;
    node = this.diagram.findNodeForKey(node.data.key);
    var arrNode = [];
    while (isMarried == null) {
        //get all node that link with this Node
        node.findNodesOutOf().each(function (n) {
            arrNode.push(n.data.key);
            //  alert(n.data.key);
            //    n isMarried =  findMarriage(n.data.key, node.data.key);
            //  alert(isMarried.data.category);
            //    keyCou = n.data.key;
        });

        for (var n = 0; n < arrNode.length; n++) {
            console.log("node out of " + node.data.key + " is : " + arrNode[n]);
            isMarried = this.findMarriage(arrNode[n], node.data.key);
            // alert(isMarried.data.category);
            if (isMarried) {
                keyCou = arrNode[n];
                break;
            }
        }

        console.log("Don't have Married")
        if (isMarried == null) {
            var keyInto = [];
            node.findNodesInto().each(function (n) {
                keyInto.push(n.data.key);
            });
            //  var keyCou = keyInto[0].split(',');
            for (var i = 0; i < keyInto.length; i++) {

                isMarried = this.findMarriage(keyInto[i], node.data.key);
                if (isMarried !== null) break;

            }
            // var keyCou = keyInto[0];
            //  keyCou = keyCou[0];
            //  isMarried = this.findMarriage(keyCou, node.data.key);
            //alert(isMarried.data.category + " with :" + keyCou);
            //keyCou = n.data.key;

        }
        if (isMarried == null) {
            this.addSpouse(node);
        }
    }
    if (node.data.s == "F") {
        if (isMarried.data.category == "Marriage") {
            newnode["m"] = node.data.key;
            newnode["f"] = keyCou;

        }
    } else if (node.data.s == "M") {
        if (isMarried.data.category == "Marriage") {
            newnode["f"] = node.data.key;
            newnode["m"] = keyCou;

        }
    }

    // have the Model add the node data
    if (data != 'undefine') {
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                newnode[prop] = data[prop];
            }
        }
    }

    this.array.push(data);
    this.pushObjInOriginalArray(data);
    this.setupDiagram();

    /*1
    this.diagram.startTransaction("add node and link");
    this.diagram.model.addNodeData(newnode);
    var mdata = isMarried.data;
    var mlabkey = mdata.labelKeys[0];
    var cdata = {
        from: mlabkey,
        to: newnode.key
    };

    this.diagram.model.addLinkData(cdata);
    this.diagram.commitTransaction("add node and link");
    1*/



//}

enGeno.prototype.addChild = function (node, gender, data,couKey) {

    // take a button panel in an Adornment, get its Adornment, and then get its adorned Node
    

    //find node form key 
    var arrCou = this.findMarriageArray(node.data.key);
    var keyCou;
    if(couKey &&this.haveKey(couKey)){
        keyCou = couKey;
    }
    else if(arrCou.length>0 && !couKey){
        keyCou =arrCou[0];
    }
    else if(arrCou.length<=0){
        keyCou = this.addSpouse(node);
    }


    var newnode = {
        n: "newNode"
    };
    if (gender == "M" || gender == "m")
        newnode = {
            n: "newNode",
            s: "M"
        };
    else if (gender == "F" || gender == "f")
        newnode = {
            n: "newNode",
            s: "F"
        };
    
    
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
    this.setupDiagram();




}




enGeno.prototype.addSon = function (node, data) {
    this.addChild(node, "M", data);
}

enGeno.prototype.addDaughter = function (node, data) {
    this.addChild(node, "F", data);
}

enGeno.prototype.addSpouse = function (node, data) {
    
    
    
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
    this.addSpouseArray(node.data.key, key);
    this.pushObjInOriginalArray(newnode);

    this.diagram.startTransaction("add Spouse");
    this.diagram.model.addNodeData(this.copyJson(newnode));

    this.diagram.commitTransaction("add Spouse");



    /*
    //add new node to cou of this node
    var couKey = this.diagram.findNodeForData(newnode);
    if(couKey){
        this.diagram.startTransaction("add Spouse to node");
        this.diagram.model.setDataProperty(node, "cou", couKey.data.key);
        console.log("Key cou : "+couKey);
        this.diagram.commitTransaction("add Spouse to node");
        console.log(JSON.stringify(node.data));
    }
    */


    this.setupDiagram();
    //t this.setupMarriages();
    //t   this.setupParents();
    console.log("Add Node Spouse");
    return key;

    /*t
    var newKey = this.diagram.findNodeForData(newnode).data.key;
    console.log("newKey : " + newKey);

    var mlab = {
        s: "LinkLabel"
    };
    this.diagram.model.addNodeData(mlab);
    var mdata = {
        from: node.data.key,
        to: newKey,
        labelKeys: [mlab.key],
        category: "Marriage"
    };
    this.diagram.model.addLinkData(mdata);
                           
    //  var cdata = { from: node.data.key, to: newKey, labelKeys: [mlab.key], category: "Marriage",s: "LinkLabel" };
    //  this.diagram.model.addLinkData(cdata);
    this.diagram.commitTransaction("add Spouse and Marriage");
    console.log("Add Link Spouse");

    //check is set married link
    var marrLink = this.findMarriage(node.data.key, newKey);
    if (marrLink) {
        console.log(marrLink.data.category);
    }
    
   */
}

enGeno.prototype.getSelectedNode = function () {

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
    var nodeRemove = this.diagram.findNodeForData(node);
    this.diagram.startTransaction("deleteNode");
    this.diagram.remove(nodeRemove);
    this.diagram.commitTransaction("deleteNode");
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

enGeno.prototype.copyJson = function (data) {
    return JSON.parse(JSON.stringify(data));
}


enGeno.prototype.searchByKeyWord = function (keyword){
    
    var arrResult = [];
    var arr = this.getOriginalArray();
    for(var i=0; i<arr.length;i++){
        var comment = ""+arr[i].comment;
        var reg = new RegExp(keyword, "gi");
        var n = comment.search(reg);
        if(n>=0){
            arrResult.push({key:arr[i].key,pos:n});
        }
    }
    
    if(arrResult.length>0){
        for(i=0;i<arrResult.length;i++){
             this.diagram.findNodeForKey(arrResult[i].key).isSelected = true;
        }
    }
    
    return arrResult;
}
//********** make img****************
enGeno.prototype.makeImage =function(){
    this.diagram.makeImage({
        scale:1,
        type: "image/jpeg"
    });
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
            comment:"Hello"
    }
];
    this.setOriginalArray(JsonData);
    this.setupDiagram();
}





//************** Open Form File ***************









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