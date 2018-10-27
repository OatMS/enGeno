<!DOCTYPE html>
<?php
  $altimgattr = array(
"ติดการพนัน",
"ติดสารเสพติด",
"ติดแอลกอฮอล์",
"มีการดื่มแอลกอฮอลหรือใช้สารเสพติด",
"มีความผิดปกติทางร่างการและจิต",
"มีปัญหาเรื่อติดแอลกอฮอล์หรือสารเสพติด และอยู่ในระหว่างการรักษาการป่วยทางจิต",
"มีอาการป่วยทางจิต และอยู่ในระหว่างการรักษาการติดแอลกอฮอล์",
"มีอาการป่วยทางร่างกายหรือจิต",
"สงสัยว่ามาการดื่นแอลกอฮอล์และสารเสพติด",
"อยู่ในระหว่างการรักษาอาการติดแอลกอฮอล์ หรือสารเสพติด",
"อยู่ในระหว่างการรักษาอาการทางจิต และรักษาอาการติดแอลกอฮอล์หรือสารเสพติด",
"อยู่ในระหว่างการรักษาอาการป่วยทางจิต",
"โรคความดันโลหิตสูง",
"โรคซึมเศร้า",
"โรคตับอักเสบ",
"โรคติดต่อทางเพศสัมพันธ์",
"โรคมะเร็ง",
"โรคหัวใจ",
"โรคออทิสติก",
"โรคอัลไซเมอร์",
"โรคอ้วน.png",
"โรคเบาหวาน",
"โรคเอดส์ - HIV",
"โรคไขข้อ"
);



$altimgline = array(
    "ความสัมพันธ์ที่ดี",
    "รักกัน",
    "รักกันมาก",
    "สนิทกัน",
    "สนิทกันมาก",
    "เข้าข้างกันมาก",
    "ให้ความสนใจเป็นพิเศษ",
    "ความหลงไหล",
    "ความหลงไหลอย่างมาก",
    "ไม่เป็นมิตรกัน",
    "ไม่เป็นมิตรแต่ไม่ค่อยได้เจอ",
    "ไม่เป็นมิตรกันแต่เจอกันบ่อย",
    "ไม่เป็นมิตรกันและอยู่ด้วยกัน",
    "การขัดแย้งกันจนถึงขั้นทำร้ายร่างกายหรือจิตใจ",
    "ขัดแย้งแบบใช้ความรุนแรง-ไม่ค่อยได้เจอ",
    "ขัดแย้งแบบใช้ความรุนแรง-ใช้ชีวิตอยู่ร่วมกัน",
    "ใช้ความรุนแรงจนไม่เหลือความสัมพันธ์ที่ดี",
    "ไม่ไว้ใจกัน",
    "บาดหมาง",
    "เกลียดกัน",
    "เคยอยู่ห่างกัน",
    "ต่างคนต่างอยู่",
    "ไม่ค่อยมีปฏิสัมพันธ์กัน",
    "ไม่แยแส",
    "ถูกทอดทิ้ง",
    "การอิจฉาริษยา",
    "จ้องจับผิด",
    "การโดนจัดการชีวิต",
    "การโดนควบคุมชีวิต",
    "โดนทำร้ายทางจิตใจ",
    "โดนทำร้ายทางร่างกาย",
    "โดนทำร้ายหรือล่วงละเมิด",
    "โดนล่วงละเมิดหรือทารุณกรรมทางเพศ",
    "ไม่ทราบความสัมพันธ์"
);


if(isset($_GET['startType'])){
    echo $_GET['startType'];
}
else{
    echo "start type is not set";
}

?>
<html>

<head>
    <title>enGeno - edit Genogram</title>
    <meta charset="UTF-8">
     <link href="webstyle.css" rel="stylesheet" type="text/css" />
     <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">

    <!-- Latest compiled and minified JavaScript -->
     <script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>

     <script src="go.js"></script>
     <!-- <script src="enGeno.js"></script> -->
     <script src="enGeno.js"></script>

   <!-- you don't need to use this -->
  <!-- <script src="goSamples.js"></script> -->
      <!-- <script src="enGeno.js"></script> -->
  <!-- <script src="goSamples.js"></script>  -->
      <script src="formControl.js"></script>

</head>




   <body id="bodyindex" onload="<?
                                if($_GET['startType']=="import") echo "genGramFormFile();";
                                else echo "setdata();";

         ?>" >
    <div id="header">
        <img src="img/logo.png" id="logo">
    </div>

    <div id="container">

        <div id="elementTools">
            <div id='cssmenu'>
                <ul>

                <li class='has-sub'><a href='#'>สัญลักษณ์สมาชิก</a>
                        <ul>
                           <div style="text-align:center" >
     <?
               $i=0;
        for($i=0;$i<4;$i++ ){
       echo    "<a style='display:inline' title='".$altimgattr[$i]."' >";
           echo "<img id='attrimg'   src='img/node/";
        echo    $i+1;
        echo    ".png' /> ";

         echo "  </a>";
        }

    ?>
                        </div>
                        </ul>
                    </li>

                    <li class='active has-sub'><a href='#'>สัญลักษณ์</a>
                        <ul>
                           <div style="text-align:center" >
     <?
               $i=0;
        for($i=0;$i<24;$i++ ){
       echo    "<a style='display:inline' title='".$altimgattr[$i]."' >";
           echo "<img id='attrimg'   src='img/attr/";
        echo    $i+1;
        echo    ".png' /> ";

         echo "  </a>";
        }

    ?>
                        </div>
                        </ul>
                    </li>

                    <li class='has-sub'><a href='#'>เส้นความสัมพันธ์</a>
                        <ul>
                           <div style="text-align:center" >
     <?
               $i=0;
        for($i=0;$i<34;$i++ ){

            echo    "<a style='display:inline' title='".$altimgline[$i]."' >";
           echo "<img id='attrimg'   src='img/line/";
        echo    $i+1;
        echo    ".png' /> ";

         echo "  </a>";
    }


    ?>
                        </div>
                        </ul>
                    </li>

                    <li class='has-sub'><a href='#'>ค้นหา</a>
                        <ul>
                           <div style="text-align:center" >
                           <input type="text" id="keyword" name="keyword" >
                           <input type="button" onclick="search()" value="ค้นหา" >
                           <input type="button" onclick="testHighlight()" value="Highlight" >
                        </div>
                        </ul>
                    </li>

                </ul>
            </div>

            <div id="filter" style="background-color:white;">
               <h3 style="text-align:center">Filter</h3>
                <div class="col-md-6"   style="background-color:white;">
         <input id="A" onclick="setFilter()" type="checkbox" name="Attribute" value="A" >ภาวะซึมเศร้า<br>
        <input id="B" onclick="setFilter()" type="checkbox" name="Attribute" value="B"> ภาวะโรคอ้วน<br>
        <input id="C" onclick="setFilter()" type="checkbox" name="Attribute" value="C"> มะเร็ง<br>
        <input id="D" onclick="setFilter()" type="checkbox" name="Attribute" value="D"> โรคหัวใจ<br>
        <input id="E" onclick="setFilter()" type="checkbox" name="Attribute" value="E"> โรคความดันสูง <br>
        <input id="F" onclick="setFilter()" type="checkbox" name="Attribute" value="F"> HIV / เอดส์ <br9>
        </div>

        <div class="col-md-6"  style="background-color:white;">

        <input id="G" onclick="setFilter()" type="checkbox" name="Attribute" value="G"> โรคตับอักเสบ <br>
        <input id="H" onclick="setFilter()" type="checkbox" name="Attribute" value="H"> โรคเบาหวาน <br>
        <input id="I" onclick="setFilter()" type="checkbox" name="Attribute" value="I"> โรคไขข้อ <br>
        <input id="J" onclick="setFilter()" type="checkbox" name="Attribute" value="J"> ออทิสติก <br>
        <input id="K" onclick="setFilter()" type="checkbox" name="Attribute" value="K"> อัลไซเมอร์ <br>
        <input id="L" onclick="setFilter()" type="checkbox" name="Attribute" value="L"> โรคติดต่อทางเพศสัมพันธ์ <br>
        </div>
            </div>




        </div>

<!-- Button Openfilt -->

        <div style="width:60%;
    height:650px;
    float:left;position:relative; background-color:white;" >
            <a id="download-txt" download="genogram-info.txt">
             <image class="diagram-icon" id="icon-export" src="img/download-icon.png" onclick="downloadTxtFile()" >
             </a>
           <a id="download-img" download="genogram.png">
           <image class="diagram-icon" id="icon-png" src="img/png-icon.png" onclick="downloadImage()" >
           </a>
        <div class="" id="myDiagram"  >

        </div>

        </div>

        <div id="infoNode" >





     <!------- Info Form --------->
      <div class="form" id="infoForm">

        <h2 style="">ข้อมูลสมาชิกครอบครัว</h2>


        <div  style=" position: relative; margin-left:50px; width:150px; height:150px; ">

            <div id="attrimg1" style=" width:75px; height:75px; float:left "></div>
            <div id="attrimg2" style=" width:75px; height:75px; float:left "></div>
            <div id="attrimg3" style=" width:75px; height:75px; float:left "></div>
            <div id="attrimg4" style=" width:75px; height:75px; float:left "></div>

            <img src="img/femalenode.png" id="nodeimg" style="position: absolute; top:0px; left:0px;">
        </div>
        <form >
         <h3>ชื่อ : .....<span id="nameText" > </span>.... </h3>
         <h3>เพศ : .....<span id="genderText" > </span>.... </h3>




         <h3 id="diseases"> โรค</h3>
         <div id="attr" style="padding-left:50px;">

         </div>

        </form>
     </div>


    <!-- ------------ edit Form ------------------->
     <div class="form" id="editForm" hidden>

        <h2 style="">ข้อมูลสมาชิกครอบครัว</h2>
        <img src="img/mockup/node.PNG" style="margin-left:50px;">

        <form  >
         <h3>ชื่อ   </h3>

         <input type="text" id="nameNode">

         <h3>โรค</h3>
        <!--
         <div class="col-md-6">
         <input id="A"  type="checkbox" name="Attribute" value="A" >ภาวะซึมเศร้า<br>
        <input id="B" type="checkbox" name="Attribute" value="B"> ภาวะโรคอ้วน<br>
        <input id="C" type="checkbox" name="Attribute" value="C"> มะเร็ง<br>
        <input id="D" type="checkbox" name="Attribute" value="D"> โรคหัวใจ<br>
        <input id="E" type="checkbox" name="Attribute" value="E"> โรคความดันสูง <br>
        <input id="F" type="checkbox" name="Attribute" value="F"> HIV / เอดส์ <br9>
        </div>

        <div class="col-md-6">

        <input id="G" type="checkbox" name="Attribute" value="G"> โรคตับอักเสบ <br>
        <input id="H" type="checkbox" name="Attribute" value="H"> โรคเบาหวาน <br>
        <input id="I" type="checkbox" name="Attribute" value="I"> โรคไขข้อ <br>
        <input id="J" type="checkbox" name="Attribute" value="J"> ออทิสติก <br>
        <input id="K" type="checkbox" name="Attribute" value="K"> อัลไซเมอร์ <br>
        <input id="L" type="checkbox" name="Attribute" value="L"> โรคติดต่อทางเพศสัมพันธ์ <br>
        </div>
        -->

        </form>

     </div>


  </div>


    </div>


    <div id='imgdiv'></div>

    <menu id="ctxMenu">
    <menu title="File">
        <menu onclick="addSon" title="addSon"></menu>
        <menu title="Save As"></menu>
        <menu title="Open"></menu>
    </menu>
    <menu title="Edit">
        <menu title="Cut"></menu>
        <menu title="Copy"></menu>
        <menu title="Paste"></menu>
    </menu>
</menu>

</body>
<!-- ******************* Context Node *********** -->
<!-- sep -->
<nav id="context-menu" class="context-menu">
    <ul class="context-menu__items">
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="View" onclick="diagramAddSon()"><i class="fa fa-eye"></i> Add Son</a>
      </li>
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="Edit" onclick="diagramAddDaughter()"><i class="fa fa-edit"></i> Add Daughter</a>
      </li>
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="Delete"  onclick="diagramDeleteNode()"><i class="fa fa-times"></i> Delete Node</a>
      </li>
      <li class="context-menu__item">
        <a href="#" class="context-menu__link" data-action="Delete"  onclick="diagramUndo()"><i class="fa fa-times"></i> Undo</a>
      </li>
    </ul>
  </nav>
</html>




<!-- //****************** JS ****************** -->
<script>

   function genGramFormFile(){
       console.log('Gen Gram Form data');

       var data = getUrlVars()["data"];
      // var data = $_GET("data");
      // alert(typeof data);

       data =  decodeURI(data);
        data =  decodeURIComponent(data);
        data = data.replace("+","");
        data = data.slice(1,-1);
       console.log(data);
       data = JSON.parse(data);
      // alert(data);
       console.log(data);

        createDi(data);
   }

    function fakeData(){
        var data = [
    { key: 0, n: "Aaron", s: "M",  cou: 1, a: ["C", "F", "K"],age:20},
    { key: 1, n: "Alice", s: "F",  a: ["B", "H", "K"] ,age:45},
    { key: 2, n: "Bob", s: "M", m: 1, f: 0, cou: 3, a: ["C", "H", "L"] },
    { key: 3, n: "Barbara", s: "F", a: ["C"] },
    { key: 4, n: "Bill", s: "M", m: 1, f: 0, cou: 5, a: ["E", "H"] },
    { key: 5, n: "Brooke", s: "F", a: ["B", "H", "L"] },
    { key: 6, n: "Claire", s: "F", m: 1, f: 0, a: ["C"] },
    { key: 7, n: "Carol", s: "F", m: 1, f: 0, a: ["C", "I"] },
    { key: 8, n: "Chloe", s: "F", m: 1, f: 0, cou: 9, a: ["E"] },
    { key: 9, n: "Chris", s: "M", a: ["B", "H"] },
    { key: 10, n: "Ellie", s: "F", m: 3, f: 2, a: ["E", "G"] },
    { key: 11, n: "Dan", s: "M", m: 3, f: 2, a: ["B", "J"] },
    { key: 12, n: "Elizabeth", s: "F", cou: 13, a: ["J"] },
    { key: 13, n: "David", s: "M", m: 5, f: 4, a: ["B", "H"] },
    { key: 14, n: "Emma", s: "F", m: 5, f: 4, a: ["E", "G"] },
    { key: 15, n: "Evan", s: "M", m: 8, f: 9, a: ["F", "H"] },
    { key: 16, n: "Ethan", s: "M", m: 8, f: 9, a: ["D", "K", "S"] },
    { key: 17, n: "Eve", s: "F", cou: 16, a: ["B", "F", "L", "S"],age:12 },
    { key: 18, n: "Emily", s: "F", m: 8, f: 9,age:56 },
    { key: 19, n: "Fred", s: "M", m: 17, f: 16, a: ["B"] },
    { key: 20, n: "Faith", s: "F", m: 17, f: 16, a: ["L"] },
    { key: 21, n: "Felicia", s: "F", m: 12, f: 13, a: ["H"] },
    { key: 22, n: "Frank", s: "M", m: 12, f: 13, a: ["B", "H"] }


];
        createDi(data);
    }


    function getUrlVars() {
var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
vars[key] = value;
});
return vars;
}

    function setdata(){
        var attr ="<? echo $_GET['attr'] ?>";
        attr = attr.split("");
        var userdata =[{n: "<? echo $_GET['name']; ?>",
                        key:1,m:2,f:3,
                        s: "<? echo $_GET['gender'] ?>",
                        a: attr,
                    },
                    //mother
                    {
                        key:2,n:"แม่",s:"F",cou:3
                    },
                    //father
                    {
                        key:3,n:"พ่อ",s:"M",cou:2
                    }
                        ];

        createDi(userdata);
    }




    //***************Context JS********************

(function() {

  "use strict";

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //
  // H E L P E R    F U N C T I O N S
  //
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Function to check if we clicked inside an element with a particular class
   * name.
   *
   * @param {Object} e The event
   * @param {String} className The class name to check against
   * @return {Boolean}
   */
  function clickInsideElement( e, className ) {
    var el = e.srcElement || e.target;

    if ( el.classList.contains(className) ) {
      return el;
    } else {
      while ( el = el.parentNode ) {
        if ( el.classList && el.classList.contains(className) ) {
          return el;
        }
      }
    }

    return false;
  }

  /**
   * Get's exact position of event.
   *
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
  function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;

    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //
  // C O R E    F U N C T I O N S
  //
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Variables.
   */
  var contextMenuClassName = "context-menu";
  var contextMenuItemClassName = "context-menu__item";
  var contextMenuLinkClassName = "context-menu__link";
  var contextMenuActive = "context-menu--active";

  var taskItemClassName = "task";
  var taskItemInContext;

  var clickCoords;
  var clickCoordsX;
  var clickCoordsY;

  var menu = document.querySelector("#context-menu");
  var menuItems = menu.querySelectorAll(".context-menu__item");
  var menuState = 0;
  var menuWidth;
  var menuHeight;
  var menuPosition;
  var menuPositionX;
  var menuPositionY;

  var windowWidth;
  var windowHeight;

  /**
   * Initialise our application's code.
   */
  function init() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();
  }

  /**
   * Listens for contextmenu events.
   */
  function contextListener() {
    document.addEventListener( "contextmenu", function(e) {
      taskItemInContext = clickInsideElement( e, taskItemClassName );

      if ( taskItemInContext ) {
        e.preventDefault();
        toggleMenuOn();
        positionMenu(e);
      } else {
        taskItemInContext = null;
        toggleMenuOff();
      }
    });
  }

  /**
   * Listens for click events.
   */
  function clickListener() {
    document.addEventListener( "click", function(e) {
      var clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

      if ( clickeElIsLink ) {
        e.preventDefault();
        menuItemListener( clickeElIsLink );
      } else {
        var button = e.which || e.button;
        if ( button === 1 ) {
          toggleMenuOff();
        }
      }
    });
  }

  /**
   * Listens for keyup events.
   */
  function keyupListener() {
    window.onkeyup = function(e) {
      if ( e.keyCode === 27 ) {
        toggleMenuOff();
      }
    }
  }

  /**
   * Window resize event listener
   */
  function resizeListener() {
    window.onresize = function(e) {
      toggleMenuOff();
    };
  }

  /**
   * Turns the custom context menu on.
   */
  function toggleMenuOn() {
    if ( menuState !== 1 ) {
      menuState = 1;
      menu.classList.add( contextMenuActive );
    }
  }

  /**
   * Turns the custom context menu off.
   */
  function toggleMenuOff() {
    if ( menuState !== 0 ) {
      menuState = 0;
      menu.classList.remove( contextMenuActive );
    }
  }

  /**
   * Positions the menu properly.
   *
   * @param {Object} e The event
   */
  function positionMenu(e) {
    clickCoords = getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
      menu.style.left = windowWidth - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
      menu.style.top = windowHeight - menuHeight + "px";
    } else {
      menu.style.top = clickCoordsY + "px";
    }
  }

  /**
   * Dummy action function that logs an action when a menu item link is clicked
   *
   * @param {HTMLElement} link The link that was clicked
   */
  function menuItemListener( link ) {
    console.log( "Task ID - " + taskItemInContext.getAttribute("data-id") + ", Task action - " + link.getAttribute("data-action"));
    toggleMenuOff();
  }

  /**
   * Run the app.
   */
  init();

})();

//----------------------------

</script>
