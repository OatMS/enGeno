<!DOCTYPE html>
<?php
    ob_start();
    $_SESSION['name'] ="";
    $_SESSION['attr'] ="";
    $_SESSION['gender'];
?>
<html>

<head>
    <title>enGeno - Create</title>
    <meta charset="UTF-8">
    <link href="style.css" rel="stylesheet" type="text/css" />
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

    <form action="create-2.php" method="get">
        <div id="formCreate">
            <h2>ข้อมูลส่วนตัวผู้ป่วย</h2>
            <h3 style="display:inline;">ชื่อ : </h3>
            <input type="text" name="name" style="width: 200px;">

            <br>
            <br>

            <div id="radio-button-wrapper">
                <h3 style="display:inline;">เพศ : </h3>
                <label class="image-radio">
                    <input name="gender" style="display:none" type="radio" value="M" checked />
                    <img style="width:50px;" src="img/male-icon.png">
                </label>
                <label class="image-radio">
                    <input name="gender" style="display:none" type="radio" value="F" />
                    <img style="width:50px;" src="img/female-icon.png">
                </label>
            </div>
            <h3>โรค</h3>
            <div class="col-md-6">
                <input id="A" type="checkbox" name="Attribute[]" value="A">ภาวะซึมเศร้า
                <br>
                <input id="B" type="checkbox" name="Attribute[]" value="B"> ภาวะโรคอ้วน
                <br>
                <input id="C" type="checkbox" name="Attribute[]" value="C"> มะเร็ง
                <br>
                <input id="D" type="checkbox" name="Attribute[]" value="D"> โรคหัวใจ
                <br>
                <input id="E" type="checkbox" name="Attribute[]" value="E"> โรคความดันสูง
                <br>
                <input id="F" type="checkbox" name="Attribute[]" value="F"> HIV / เอดส์
                <br>
            </div>

            <div class="col-md-6">

                <input id="G" type="checkbox" name="Attribute[]" value="G">โรคตับอักเสบ
                <br>
                <input id="H" type="checkbox" name="Attribute[]" value="H"> โรคเบาหวาน
                <br>
                <input id="I" type="checkbox" name="Attribute[]" value="I"> โรคไขข้อ
                <br>
                <input id="J" type="checkbox" name="Attribute[]" value="J"> ออทิสติก
                <br>
                <input id="K" type="checkbox" name="Attribute[]" value="K">อัลไซเมอร์
                <br>
                <input id="L" type="checkbox" name="Attribute[]" value="L"> โรคติดต่อทางเพศสัมพันธ์
                <br><br><br><br>
            </div>
            <input type="submit" value="ถัดไป">
        </div>
    </form>




</body>

</html>


