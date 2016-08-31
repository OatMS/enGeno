<?php
    ob_start();
    $_SESSION['name'] = $_GET["name"];
    $attrs = $_GET['Attribute'];

    if(isset($_GET["Attribute"])){
        for($i=0; $i < count($_GET['Attribute']).lenght ; $i++){
            $_SESSION['attr'] .= $_GET['Attribute'][$i];
        }
    }
    $_SESSION['gender'] = $_GET['gender'];
?>
<!DOCTYPE html>
<html>

<head>
    <title>enGeno - Edit Genogram</title>
    <meta charset="UTF-8">
    <link href="style.css" rel="stylesheet" type="text/css" />
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">

    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
    
    
   < meta charset="UTF-8">
  <script src="go.js"></script>
  <!-- you don't need to use this -->
  <script src="goSamples.js"></script>  <!-- this is only for the GoJS Samples framework -->
      <script src="enGeno.js"></script>
  <script src="goSamples.js"></script>  <!-- this is only for the GoJS Samples framework -->
     <script src="formControl.js"></script>
    
</head>

<body id="bodyindex" onload="setupForm()"> 
    <div id="header">
        <img src="img/logo.png" id="logo">
    </div>

     <input id="file" type='file' accept='text/plain' onchange='openFile(event)'><br>
        
<div  id="sample">
  <div ondblclick="dbClick()" id="myDiagram" > </div>
  <div id="infoNode" >
    

     
     
     
     <!------- Info Form ------------->
      <div class="form" id="infoForm">
         
        <h2 style="">ข้อมูลสมาชิกครอบครัว</h2>
        
        <form readonly="readonly" >
         <h3>ชื่อ   </h3>
         
         <input readonly="readonly" type="text" id="nameNode">
         
         <h3>โรค</h3>
         
         
        </form>
    
     </div>
     
         
    <!-- ----- edit Form ------------------->
     <div class="form" id="editForm">
         
        <h2 style="">ข้อมูลสมาชิกครอบครัว</h2>
        
        <form  >
         <h3>ชื่อ   </h3>
         
         <input type="text" id="nameNode">
         
         <h3>โรค</h3>
         
         <div class="col-md-6">
         <input id="A"  type="checkbox" name="Attribute" value="A" >ภาวะซึมเศร้า<br>
        <input id="B" type="checkbox" name="Attribute" value="B"> ภาวะโรคอ้วน<br>
        <input id="C" type="checkbox" name="Attribute" value="C"> มะเร็ง<br>
        <input id="D" type="checkbox" name="Attribute" value="D"> โรคหัวใจ<br>
        <input id="E" type="checkbox" name="Attribute" value="E"> โรคความดันสูง<br>
        <input id="F" type="checkbox" name="Attribute" value="F"> HIV / เอดส์<br>
        </div>
        
        <div class="col-md-6">
        
        <input id="G" type="checkbox" name="Attribute" value="G">โรคตับอักเสบ<br>
        <input id="H" type="checkbox" name="Attribute" value="H"> โรคเบาหวาน<br>
        <input id="I" type="checkbox" name="Attribute" value="I"> โรคไขข้อ<br>
        <input id="J" type="checkbox" name="Attribute" value="J"> ออทิสติก<br>
        <input id="K" type="checkbox" name="Attribute" value="K">อัลไซเมอร์<br>
        <input id="L" type="checkbox" name="Attribute" value="L"> โรคติดต่อทางเพศสัมพันธ์<br>
        </div>
        <input style="margin-top:50px;"  type="submit"  value="บันทึก">
        </form>
    
     </div>
      
      
  </div>
  
</div>
   


</body>

</html>

