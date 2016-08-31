<!DOCTYPE html>
<?php 
$_SESSION["importOrCreate"] = "import";


?>
<html>
    <head>
        <title>enGeno</title>
        <meta charset="UTF-8">
         <link href="webstyle.css" rel="stylesheet" type="text/css" />
        <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

        <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">

        <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
    </head>
    
    <body id="bodyindex">
       <div id="header">
           <img src="img/logo.png" id="logo">
       </div>
       
       <div id="menuindex">
           <a href="create-1.php" onclick="setCreateType();" > <img class="btmenu" src="img/menubt-create.png"> </a><br><br>
           
           
           
           
           <a href="#" onclick="performClick('ButtonFile')"> <img class="btmenu"  src="img/menubt-txt.png" onclick="<? $_SESSION["importOrCreate"] = "import"; ?>"> </a><br><br>
           <input type="file" id="ButtonFile" onchange="openFile(event)" style="display:none"  >
       </div>
        
        
        
        
        <form id="setWay" action="editGenogram.php" method="get" >
            <input name="data" type="text" id="data" style="display:none" >
            <input name="startType" type="text" id="startType" style="display:none" >
            <input id="submit" type="submit"  style="display:none" >
            
        </form>
        
        
        
        <div id="result"> </div>

        
    </body>
    
</html>








<script>
                function performClick(elemId) {
   var elem = document.getElementById(elemId);
   if(elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
      // openFile(elem);
   }
}
               
               
               
               function openFile(event) {
                 console.log("on open File");  
    var data=[];
   var text;
  
    var input = event.target;
//alert(input);
    var data=[];
    
    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      var lines = text.split("\r\n");
       
    for(var line = 0; line < lines.length; line++){
        
     data.push(readByLine(lines[line]));
       
    }
       
    console.log("Start set data");
    //actionSend(data);
        setInput(data);
    
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
    
    console.log("Success read File");
    
                   
                   
  };
    
    function setInput(data){
        var input = document.getElementById('data');
        input.value = "'"+JSON.stringify(data)+"'";
       // input.value = 5;
        var submit =document.getElementById('submit');
        console.log("set input success");
       // console.log(input.value);
        
        //set type start
        var startType = document.getElementById('startType');
        startType.value = "import";
        
        submit.click();
        
    }
    
    function setCreateType(){
        var setWay = document.getElementById('setWay');
        setWay.action = "create-1.php";
        var startType = document.getElementById('startType');
        startType.value = "create";
        var submit =document.getElementById('submit');
         submit.click();
    }
    
    
    
           </script>