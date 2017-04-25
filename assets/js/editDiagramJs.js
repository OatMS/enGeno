
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
    	// this.myDiagram = new enGeno(this.data, "myDiagram")
    	// this.myDiagram.init()

    },
    watch:{
    	
    }

})