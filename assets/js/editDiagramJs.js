
  var vm_diagram = new Vue({
    el:"#editGenogram",
    data:{
      myDiagram:{},
      data:[]
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
	    }
    },
    mounted(){
    	this.data = [
    {
        key: 0,
        n: "Eve",
        s: "F",
        m: 1,
        a: "BHS"
    },
    {
        key: 1,
        n: 'Mom',
        s: 'F',
        cou: 2,
        a: "CGK"
    },
    {
        key: 2,
        n: "Dad",
        s: 'M',
        a: "AELS"
    },
    {
        key: 3,
        n: "Ever",
        s: "F",
        m: 1,
        f: 2,
        a: "BH"
    },
    {
        key: 4,
        n: 'Ever',
        s: 'M',
        cou: 3
    }
] 
        data2 = [
    {
        key: "eve",
        n: "Eve",
        s: "F",
        m: "mom",
        f: "fan",
        a: "BHS"
    },
    {
        key: "mom",
        n: 'Mom',
        s: 'F',
        cou: "fan",
        a: "CGK"
    },
    {
        key: "fan",
        n: "Dad",
        s: 'M',
        a: "AELS"
    },
    {
        key: "son",
        n: "Ever",
        s: "F",
        m: "mom",
        f: "fan",
        a: "BH"
    },
    {
        key: "coc",
        n: 'Ever1',
        s: 'M',
        cou: "son"
    }
] 
    // newdata = this.formatObject(data2)
    	this.myDiagram = new enGeno(data2, "myDiagram")
    	this.myDiagram.init()

    },
    watch:{
    	
    }

})