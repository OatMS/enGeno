
  var vm_form = new Vue({
    el:"#form",
    data:{
      name:"",
      age:"",
      gender:"M",
      disease:[],
      relativePatient:{
      	patient:{
      		ySis:"",oSis:"",yBro:"",oBro:""
      	},
      	father:{
      		ySis:"",oSis:"",yBro:"",oBro:""
      	},
      	mother:{
      		ySis:"",oSis:"",yBro:"",oBro:""
      	}
      },
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
	    attrFill:function(a) {
	        switch (a) {
	            case "A":
	                return "#0000FE";break;
	            case "B":
	                return "#FF00FF";break;
	            case "C":
	                return "#FE0000";break;
	            case "D":
	                return "#C00000";break;
	            case "E":
	                return "#C00000";break;
	            case "F":
	                return "#FFC000";break;
	            case "G":
	                return "#01FF00";break;
	            case "H":
	                return "#800080";break;
	            case "I":
	                return "#939FBB";break;
	            case "J":
	                return "#01FFFF";break;
	            case "K":
	                return "#359AFF";break;
	            case "L":
	                return "#FFFF00";break;
	            case "S":
	                return "red";
	            default:
	                return "transparent";
	        }
        },
        fillColorForm:function(){
        	if(this.disease.length==0){
        		this.attr1Style.backgroundColor = 'white'
        		this.attr2Style.backgroundColor = 'white'
        		this.attr3Style.backgroundColor = 'white'
        		this.attr4Style.backgroundColor = 'white'
        		return
        	}
        	if(this.disease.length>0){
        		this.attr1Style.backgroundColor = this.attrFill(this.disease[0])
        		this.attr2Style.backgroundColor = 'white'
        		this.attr3Style.backgroundColor = 'white'
        		this.attr4Style.backgroundColor = 'white'
        	}if(this.disease.length>1){
        		this.attr2Style.backgroundColor = this.attrFill(this.disease[1])
        		this.attr3Style.backgroundColor = 'white'
        		this.attr4Style.backgroundColor = 'white'
        	}if(this.disease.length>2){
        		this.attr3Style.backgroundColor = this.attrFill(this.disease[2])
        		this.attr4Style.backgroundColor = 'white'
        	}if(this.disease.length>3){
        		this.attr4Style.backgroundColor = this.attrFill(this.disease[3])
        	}
        },
        gotoEditDiagram(){
        	var data = []
        	data.push({key:0,n:this.name,s:this.gender,age:parseInt(this.age),f:1,m:2,a:this.disease})
        	data.push({key:1,n:"พ่อ",s:"M",cou:2})
        	data.push({key:2,n:"แม่",s:"F",cou:1})
        	console.log(data)

        }
    },
    mounted(){
    	var current_fs, next_fs, previous_fs; //fieldsets
		var left, opacity, scale; //fieldset properties which we will animate
		var animating; //flag to prevent quick multi-click glitches

		$(".next").click(function(){
			if(animating) return false;
			animating = true;
			
			current_fs = $(this).parent();
			next_fs = $(this).parent().next();
			
			//activate next step on progressbar using the index of next_fs
			$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
			
			//show the next fieldset
			next_fs.show(); 
			//hide the current fieldset with style
			current_fs.animate({opacity: 0}, {
				step: function(now, mx) {
					//as the opacity of current_fs reduces to 0 - stored in "now"
					//1. scale current_fs down to 80%
					scale = 1 - (1 - now) * 0.2;
					//2. bring next_fs from the right(50%)
					left = (now * 50)+"%";
					//3. increase opacity of next_fs to 1 as it moves in
					opacity = 1 - now;
					current_fs.css({'transform': 'scale('+scale+')'});
					next_fs.css({'left': left, 'opacity': opacity});
				}, 
				duration: 800, 
				complete: function(){
					current_fs.hide();
					animating = false;
				}, 
				//this comes from the custom easing plugin
				easing: 'easeInOutBack'
			});
		});

		$(".previous").click(function(){
			if(animating) return false;
			animating = true;
			
			current_fs = $(this).parent();
			previous_fs = $(this).parent().prev();
			
			//de-activate current step on progressbar
			$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
			
			//show the previous fieldset
			previous_fs.show(); 
			//hide the current fieldset with style
			current_fs.animate({opacity: 0}, {
				step: function(now, mx) {
					//as the opacity of current_fs reduces to 0 - stored in "now"
					//1. scale previous_fs from 80% to 100%
					scale = 0.8 + (1 - now) * 0.2;
					//2. take current_fs to the right(50%) - from 0%
					left = ((1-now) * 50)+"%";
					//3. increase opacity of previous_fs to 1 as it moves in
					opacity = 1 - now;
					current_fs.css({'left': left});
					previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
				}, 
				duration: 800, 
				complete: function(){
					current_fs.hide();
					animating = false;
				}, 
				//this comes from the custom easing plugin
				easing: 'easeInOutBack'
			});
		});

		$(".submit").click(function(){
			return false;
		})
    },
    watch:{
    	name:function(){
    		console.log(this.name)
    	},
    	age:function(){
    		console.log(this.age)
    	},
    	gender:function(){
    		console.log(this.gender)
    	},
    	disease:function(){
    		console.log(this.disease)
    	}
    }

})