
var clickCount=0;
  
var Form,editForm,infoForm;
var firstClick = true;

function openFile(event){
    alert(event.target.files[0]);
    var myDiagram = Genogram(event.target,"myDiagram");
}

function setupForm(){
   Form = document.getElementById("infoNode");
    editForm = document.getElementById("editForm");
    infoForm = document.getElementById("infoForm");
    Form.removeChild(editForm);
    Form.removeChild(infoForm);
}


function clickNode(ctrl,node){
    var node = node.part.adornedPart;
    if(!firstClick){
        Form.removeChild(editForm);
    }
    Form.appendChild(infoForm);
    firstClick=false;
    
     var nameText = document.getElementById("nameNode");
   nameText.value = node.data.n;
    
    
    
    var link = node.findTreeParentLink() ;
    if(link!== null){
     
    }
  if (!ctrl) {
    selectedNode =[];
      
  }
    selectedNode.push(node);
   
}



function clickDiagram(){
    
}


function getSelectedNode(){
    return selectedNode;
}

function resetClick(){
    selectedNode=[];
}	

function doubleClickNode(e,b){
    var node = b.part.adornedPart;
    prompt("Name : ",node.data.n);
}



function editNode(e,b){
    var node = b.part.adornedPart;
    if(!firstClick){
        Form.removeChild(infoForm);
    }
    Form.appendChild(editForm);
    
      e = window.event;
    
    
    var nameText = document.getElementById("nameNode");
   nameText.value = node.data.n;
    var attribute= document.getElementsByName("Attribute");
    
    for(var i =0;i<attribute.length ; i++){
        attribute[i].checked = false;
    }
   
    for(var i =0;i<=node.data.a.length ; i++){
        var checkbox = document.getElementById(node.data.a[i]);
        
        checkbox.checked = true;
    }
    
   var node =  b.part.adornedPart.data;
   var newName = prompt("Name : ",b.part.adornedPart.data.n);
    
    
      myDiagram.model.startTransaction("modified Node")
      myDiagram.model.setDataProperty(node, "n", newName);
      myDiagram.model.commitTransaction("modified Node");
 
    
    
    
}