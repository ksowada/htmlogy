import Html from '../html/Html/Html.js'
import './Modal.css'
import Ids from '../../logic/Ids/Ids.js'
import Toolbar from '../Toolbar/Toolbar.js'
import Obj from '../../logic/Obj/Obj.js'
import HtmlElComp from '../html/HtmlElComp.js'

/**
 * @class
 * @augments HtmlElComp
 */
class Modal extends HtmlElComp {
	constructor() {
		super(Html.mergeDatas.apply(null,arguments))
		super.constructed()
	}
	dom() {
		super.domCreate({container:{css:'modal'}},Html.mergeDatas.apply(null,arguments))
		const modalContent = new Html({parent:{obj:this.containerObj},html:'div',css:'modal-content'})
		this.span = new Html({parent:{obj:modalContent},html:'span',css:'close',evts:{click: this.close.bind(this)}})

		if (this.type=='input' || this.type=='id') {
			const row = new Html({parent:{obj:modalContent},html:'div',css:'modal-input'})
			this.input = new Html({parent:{obj:row},html:'input',atts:{'placeholder':this.placeholder},evts:{'keyup':this.handleInpCreateKey.bind(this)}})
			const toolbarItems = {}
			toolbarItems['submit'] = {css:'btn btn-primary',icon:'fa-solid fa-check',val:'submit',evts:{'click':this.confirm.bind(this)}}
			toolbarItems['cancel'] = {css:'btn btn-primary',icon:'fa-solid fa-ban',val:'cancel',evts:{'click':this.close.bind(this)}}
			new Toolbar({parent:{obj:row},items:toolbarItems})
		}
		if (this.type=='id') {
			this.warn = new Html({parent:{obj:modalContent},html:'div',css:'modal-warn'})
		}
		// TODO if (this.autocomplete) this.autocomplete(this.input.html, this.rows)
		// When the user clicks anywhere outside of the modal, close it
		window.addEventListener('click',this.click.bind(this))
		// TODO usually key Esc in whole window, and then remove evt listener
		// window.addEventListener('keyup', this.handleKey)
	}
	click(event) {
		if (event.target == this.div) {
			this.close()
		}
	}
	open(obj) {
		this.div.style.display = 'block' // TODO would like to use class instead of style, to animate easier
		Obj.attach(this,'clbSuccess',obj.onEnter)
		Obj.attach(this,'rows',obj.rows)
		Obj.attach(this,'placeholder',obj.placeholder,'')
		if (Obj.attach(this,'value',obj.value)) this.input.my.el.value = this.value
		if (this.type=='input' || this.type=='id') {
			this.input.my.el.placeholder = this.placeholder
			this.input.my.el.focus()
		}
	}
	confirm() {
		const val = this.input.my.el.value
		let valEvaluated = ''
		if (this.type=='id') {
			const validId = Ids.isValidId(val,this.rows)
			if (!validId.valid) {
				this.warn.innerHTML = validId.warn
				return
			}
			valEvaluated = validId.value
		}
		this.close()
		this.clbSuccess(valEvaluated)
	}
	close() {
		this.div.style.display = 'none'
	}
	handleInpCreateKey(event) {
		if (event.key === 'Enter') {
			this.confirm()
		} else if (event.key==='Escape' || event.key==='Esc') {
			this.close()
		} else {
			this.warn.innerHTML = ''
		}
	}

	autocomplete(inp,arr) {
		/* the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
		var currentFocus
		/* execute a function when someone writes in the text field:*/
		inp.addEventListener('input',function(e) {
			var a,b,i,val = this.value
			/* close any already open lists of autocompleted values*/
			closeAllLists()
			if (!val) { return false}
			currentFocus = -1
			/* create a DIV element that will contain the items (values):*/
			a = document.createElement('DIV')
			a.setAttribute('id',this.id + 'autocomplete-list')
			a.setAttribute('class','autocomplete-items')
			/* append the DIV element as a child of the autocomplete container:*/
			this.parentNode.appendChild(a)
			/* for each item in the array...*/
			for (i = 0; i < arr.length; i++) {
				/* check if the item starts with the same letters as the text field value:*/
				if (arr[i].substr(0,val.length).toUpperCase() == val.toUpperCase()) {
					/* create a DIV element for each matching element:*/
					b = document.createElement('DIV')
					/* make the matching letters bold:*/
					b.innerHTML = '<strong>' + arr[i].substr(0,val.length) + '</strong>'
					b.innerHTML += arr[i].substr(val.length)
					/* insert a input field that will hold the current array item's value:*/
					b.innerHTML += '<input type=\'hidden\' value=\'' + arr[i] + '\'>'
					/* execute a function when someone clicks on the item value (DIV element):*/
					b.addEventListener('click',function(e) {
						/* insert the value for the autocomplete text field:*/
						inp.value = this.getElementsByTagName('input')[0].value
						/* close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
						closeAllLists()
					})
					a.appendChild(b)
				}
			}
		})
		/* execute a function presses a key on the keyboard:*/
		inp.addEventListener('keydown',function(e) {
			var x = document.getElementById(this.id + 'autocomplete-list')
			if (x) x = x.getElementsByTagName('div')
			if (e.keyCode == 40) {
				/* If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
				currentFocus++
				/* and and make the current item more visible:*/
				addActive(x)
			} else if (e.keyCode == 38) { // up
				/* If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
				currentFocus--
				/* and and make the current item more visible:*/
				addActive(x)
			} else if (e.keyCode == 13) {
				/* If the ENTER key is pressed, prevent the form from being submitted,*/
				e.preventDefault()
				if (currentFocus > -1) {
					/* and simulate a click on the "active" item:*/
					if (x) x[currentFocus].click()
				}
			}
		})
	}
	addActive(x) {
		/* a function to classify an item as "active":*/
		if (!x) return false
		/* start by removing the "active" class on all items:*/
		this.removeActive(x)
		if (currentFocus >= x.length) currentFocus = 0
		if (currentFocus < 0) currentFocus = (x.length - 1)
		/* add class "autocomplete-active":*/
		x[currentFocus].classList.add('autocomplete-active')
	}
	removeActive(x) {
		/* a function to remove the "active" class from all autocomplete items:*/
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove('autocomplete-active')
		}
	}
	closeAllLists(elmnt) {
		/* close all autocomplete lists in the document,
    except the one passed as an argument:*/
		var x = document.getElementsByClassName('autocomplete-items')
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i])
			}
		}
	}
	/* execute a function when someone clicks in the document:*/
//   document.addEventListener("click", function (e) {
//       closeAllLists(e.target);
//   });
}
export default Modal

// /*An array containing all the country names in the world:*/
// var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","Elem Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

// /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
// autocomplete(document.getElementById("myInput"), countries);

// <!DOCTYPE html>
// <html>
// <head>
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
// <style>

// </style>
// </head>
// <body>

// <h2>Autocomplete</h2>

// <p>Start typing:</p>

// <!--Make sure the form has the autocomplete function switched off:-->
// <form autocomplete="off" action="/action_page.php">
//   <div class="autocomplete" style="width:300px;">
//     <input id="myInput" type="text" name="myCountry" placeholder="Country">
//   </div>
//   <input type="submit">
// </form>

// <script>
// function autocomplete(inp, arr) {
//   /*the autocomplete function takes two arguments,
//   the text field element and an array of possible autocompleted values:*/
//   var currentFocus;
//   /*execute a function when someone writes in the text field:*/
//   inp.addEventListener("input", function(e) {
//       var a, b, i, val = this.value;
//       /*close any already open lists of autocompleted values*/
//       closeAllLists();
//       if (!val) { return false;}
//       currentFocus = -1;
//       /*create a DIV element that will contain the items (values):*/
//       a = document.createElement("DIV");
//       a.setAttribute("id", this.id + "autocomplete-list");
//       a.setAttribute("class", "autocomplete-items");
//       /*append the DIV element as a child of the autocomplete container:*/
//       this.parentNode.appendChild(a);
//       /*for each item in the array...*/
//       for (i = 0; i < arr.length; i++) {
//         /*check if the item starts with the same letters as the text field value:*/
//         if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
//           /*create a DIV element for each matching element:*/
//           b = document.createElement("DIV");
//           /*make the matching letters bold:*/
//           b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
//           b.innerHTML += arr[i].substr(val.length);
//           /*insert a input field that will hold the current array item's value:*/
//           b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
//           /*execute a function when someone clicks on the item value (DIV element):*/
//           b.addEventListener("click", function(e) {
//               /*insert the value for the autocomplete text field:*/
//               inp.value = this.getElementsByTagName("input")[0].value;
//               /*close the list of autocompleted values,
//               (or any other open lists of autocompleted values:*/
//               closeAllLists();
//           });
//           a.appendChild(b);
//         }
//       }
//   });
//   /*execute a function presses a key on the keyboard:*/
//   inp.addEventListener("keydown", function(e) {
//       var x = document.getElementById(this.id + "autocomplete-list");
//       if (x) x = x.getElementsByTagName("div");
//       if (e.keyCode == 40) {
//         /*If the arrow DOWN key is pressed,
//         increase the currentFocus variable:*/
//         currentFocus++;
//         /*and and make the current item more visible:*/
//         addActive(x);
//       } else if (e.keyCode == 38) { //up
//         /*If the arrow UP key is pressed,
//         decrease the currentFocus variable:*/
//         currentFocus--;
//         /*and and make the current item more visible:*/
//         addActive(x);
//       } else if (e.keyCode == 13) {
//         /*If the ENTER key is pressed, prevent the form from being submitted,*/
//         e.preventDefault();
//         if (currentFocus > -1) {
//           /*and simulate a click on the "active" item:*/
//           if (x) x[currentFocus].click();
//         }
//       }
//   });
//   function addActive(x) {
//     /*a function to classify an item as "active":*/
//     if (!x) return false;
//     /*start by removing the "active" class on all items:*/
//     removeActive(x);
//     if (currentFocus >= x.length) currentFocus = 0;
//     if (currentFocus < 0) currentFocus = (x.length - 1);
//     /*add class "autocomplete-active":*/
//     x[currentFocus].classList.add("autocomplete-active");
//   }
//   function removeActive(x) {
//     /*a function to remove the "active" class from all autocomplete items:*/
//     for (var i = 0; i < x.length; i++) {
//       x[i].classList.remove("autocomplete-active");
//     }
//   }
//   function closeAllLists(elmnt) {
//     /*close all autocomplete lists in the document,
//     except the one passed as an argument:*/
//     var x = document.getElementsByClassName("autocomplete-items");
//     for (var i = 0; i < x.length; i++) {
//       if (elmnt != x[i] && elmnt != inp) {
//         x[i].parentNode.removeChild(x[i]);
//       }
//     }
//   }
//   /*execute a function when someone clicks in the document:*/
//   document.addEventListener("click", function (e) {
//       closeAllLists(e.target);
//   });
// }

// /*An array containing all the country names in the world:*/
// var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","Elem Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

// /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
// autocomplete(document.getElementById("myInput"), countries);
// </script>

// </body>
// </html>
