enGeno.prototype.addNode = function (data) {
    this.diagram.startTransaction('new node');
    this.array.push(data);
    this.pushObjInOriginalArray(data);
    this.diagram.model.addNodeData(data);
    part = this.diagram.findPartForData(data);
    this.diagram.commitTransaction('new node');

    this.setupDiagram();

}