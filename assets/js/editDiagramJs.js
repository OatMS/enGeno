
  var vm_diagram = new Vue({
    el:"#editGenogram",
    data:{
      myDiagram:{},
      data:[],
      attrimgPath:[],
      attrdetial:[],
      filterAttr:[],
      selectedNode:{},
      nodeClicked:false,
      attr1Style:{
        width:'75px', height:'75px', float:'left' ,backgroundColor:'white'
      },
      attr2Style:{
        width:'75px', height:'75px', float:'left' ,backgroundColor:'white'
      },
      attr3Style:{
        width:'75px', height:'75px', float:'left' ,backgroundColor:'white'
      },
      attr4Style:{
        width:'75px', height:'75px', float:'left' ,backgroundColor:'white'
      }
    },
    created(){

    },
    methods:{
	    formatObject:function(obj){
	    	var counter = 0
	    	var table = []
            var newData = []
	    	for(var i =0; i<obj.length ;i++){
	    		console.log(obj[i].key)
                table["key"+obj[i].key] = i
	    	}
            console.log(table)
            for(var i =0; i<obj.length ;i++){
                
                obj[i].key = table["key"+obj[i].key]
                if(obj[i].f){
                    obj[i].f = table["key"+obj[i].f]
                }
                if(obj[i].m){
                    obj[i].m = table["key"+obj[i].m]
                }
                if(obj[i].cou){
                    if(typeof obj[i].cou == "string"
                        ||typeof obj[i].cou == "number"){
                        obj[i].cou = table["key"+obj[i].cou]
                    }else if(typeof obj[i].cou == "object"
                        ||typeof obj[i].cou == "array"){
                        newcou = []
                        for(j=0;j<obj[i].cou.length;j++){
                            newcou.push(table["key"+obj[i].cou[j]])
                        }
                        obj[i].cou = newcou
                    }
                }
            }
            console.log(obj)
            return obj
	    },
        filterClick:function(){
            if(this.filterAttr.length==0){
                this.myDiagram.filter("")
            }else{
                this.myDiagram.filter(this.filterAttr)
            }
        },
        attrFill:function(a) {
            switch (a) {
                case "A":
                    return "#880015";
                case "B":
                    return "#3f48cc";
                case "C":
                    return "#21f90a";
                case "D":
                    return "#fff200";
                case "E":
                    return "#f92298";
                case "F":
                    return "#ed1c24";
                case "G":
                    return "#35e4ee";
                case "H":
                    return "#00a2e8";
                case "I":
                    return "#22b14c";
                case "J":
                    return "#a349a4";
                case "K":
                    return "#ff7f27";
                case "L":
                    return "#807a9e";
                case "S":
                    return "red";
                default:
                    return "transparent";
            }
        },
        diagramClick:function(){
            if(this.myDiagram.getSelectedNodes().length>0){
                let selectedNodesArr = this.myDiagram.getSelectedNodes()
                this.selectedNode = selectedNodesArr[0].data
                if(this.selectedNode.a && this.selectedNode.a.length>0){
                    if(this.selectedNode.a.length>3){
                        this.attr4Style.backgroundColor = this.attrFill(this.selectedNode.a[3])
                        this.attr3Style.backgroundColor = this.attrFill(this.selectedNode.a[2])
                        this.attr2Style.backgroundColor = this.attrFill(this.selectedNode.a[1])
                        this.attr1Style.backgroundColor = this.attrFill(this.selectedNode.a[0])
                    }
                    else if(this.selectedNode.a.length>2){
                        this.attr3Style.backgroundColor = this.attrFill(this.selectedNode.a[2])
                        this.attr2Style.backgroundColor = this.attrFill(this.selectedNode.a[1])
                        this.attr1Style.backgroundColor = this.attrFill(this.selectedNode.a[0])
                        this.attr4Style.backgroundColor = 'white'
                    }
                    else if(this.selectedNode.a.length>1){
                        this.attr2Style.backgroundColor = this.attrFill(this.selectedNode.a[1])
                        this.attr1Style.backgroundColor = this.attrFill(this.selectedNode.a[0])
                        this.attr3Style.backgroundColor = 'white'
                        this.attr4Style.backgroundColor = 'white'
                    }
                    else{
                        this.attr1Style.backgroundColor = this.attrFill(this.selectedNode.a[0])
                        this.attr2Style.backgroundColor = 'white'
                        this.attr3Style.backgroundColor = 'white'
                        this.attr4Style.backgroundColor = 'white'
                    }
                }else{
                    this.attr1Style.backgroundColor = 'white'
                    this.attr2Style.backgroundColor = 'white'
                    this.attr3Style.backgroundColor = 'white'
                    this.attr4Style.backgroundColor = 'white'
                    
                }
                console.log(this.selectedNode)
                this.nodeClicked = true
            }else{
                this.nodeClicked = false
            }
        }
    },
    mounted(){
        $('[data-toggle="tooltip"]').tooltip()
    	for (var i = 13; i < 25; i++) {
    		this.attrimgPath.push("img/attr/"+i+".png")
    	}
    	this.attrdetial = ["โรคความดันโลหิตสูง","โรคซึมเศร้า","โรคตับอักเสบ","โรคติดต่อทางเพศสัมพันธ์","โรคมะเร็ง","โรคหัวใจ","โรคออทิสติก","โรคอัลไซเมอร์","โรคอ้วน","โรคเบาหวาน","โรคเอดส์ - HIV","โรคไขข้อ"]
/*
    	this.data = [
    {
        key: 0,n: "Eve", s: "F",m: 1,a: "BHS"
    },
    {
        key: 1,n: 'Mom',s: 'F',cou: 2,a: "CGK"
    },
    {
        key: 2,n: "Dad",s: 'M',a: "AELS"
    },
    {
        key: 3,n: "Ever",s: "F", m: 1,f: 2,a: "BH"
    },
    {
        key: 4,n: 'Ever',s: 'M',cou: 3
    }
] 
*/

        data2 = [
    {
        key: "eve",n: "Eve",s: "F",m: "mom",f: "fan",a: "BHS"
    },
    {
        key: "mom",n: 'Mom',s: 'F',cou: "fan",a: "CGK"
    },
    {
        key: "fan",n: "Dad",s: 'M',a: "AELS"
    },
    {
        key: "son",n: "Ever",s: "F",m: "mom",f: "fan",a: "BH"
    },
    {
        key: "coc",n: 'Ever1',s: 'M',cou: "son"
    }
] 
    
    	this.myDiagram = new enGeno(data2, "myDiagram")
    	this.myDiagram.init()

    },
    watch:{
    	filterAttr:function(){
            console.log(this.filterAttr)
        }
    }

})