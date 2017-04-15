var FormGenerator = function(container) {
    this.parentContainer = container;
}
FormGenerator.prototype = {
    showFormGenerator: function(state){
        var table = document.createElement('table');
        table.innerHTML = "<tr><th>ELEMENT TYPE</th><th>ELEMENT NAME</th><th>ELEMENT CLASS</th><th>ELEMENT LABEL</th><th>ELEMENT VALUES</th><th>ACTIONS</th></tr>";
        table.border = "1";
        this.parentContainer.appendChild(table);
        this.formContainer = table;
        this.formElements = [];
        this.addElement();
        this._addDynamicElementAdderListener();
        if(state){
            this.regenerateFormGeneratorFromJson(state);
        }
    },
    regenerateFormGeneratorFromJson: function(json){
        json = JSON.parse(json);
        var i,j;
        for(i=0;i<json.length;i++){
            var row = this.formElements[i];
            row.childNodes[0].firstChild.value = json[i].type==""?"_blank":json[i].type;
            row.childNodes[1].firstChild.value = json[i].name==""?"_blank":json[i].name;
            row.childNodes[2].firstChild.value = json[i].class==""?"_blank":json[i].class;
            row.childNodes[3].firstChild.value = json[i].label==""?"_blank":json[i].label;
            if(json[i].values){
                row.childNodes[4].firstChild.firstChild.click();
                for(j=0;j<json[i].values.length;j++){
                    var valuesContainer = row.childNodes[4].firstChild.childNodes[j+1];
                    valuesContainer.childNodes[0].value = json[i].values[j].value==""?"_blank":json[i].values[j].value;
                    valuesContainer.childNodes[2].value = json[i].values[j].label==""?"_blank":json[i].values[j].label;
                    if(j<json[i].values.length-1){
                        valuesContainer.childNodes[4].click();
                    }
                }
            }
            if(i<json.length-1){
                this.addElement();
            }
        }
    },
    makeForm: function(json) {
        if(typeof json == "string"){
            json = JSON.parse(json);
        }
        this._JSON = json;
        var formElements = this.unJSONize(this._JSON);
        var i;
        for (i = 0; i < formElements.length; i++) {
            this.parentContainer.appendChild(formElements[i]);
        }
    },
    _wildcards: [{old:"_blank", new: ""}],
    addWildcard: function(wildcard){
    	this._wildcards.push(wildcard);
    },
    removeWildcard: function(wildcard){
    	var i;
    	for(i = 0; i < this._wildcards.length; i++){
    		if(this._wildcards[i].old == wildcard){
    			this._wildcards.splice(i, 1);
    		}
    	}
    },
    getNewFormElement: function() {
        var row = document.createElement('tr');
        row.innerHTML += '<td valign="top"><input type="text" placeholder="Element Type" /></td>';
        row.innerHTML += '<td valign="top"><input type="text" placeholder="Element Name" /></td>';
        row.innerHTML += '<td valign="top"><input type="text" placeholder="Element Class" /></td>';
        row.innerHTML += '<td valign="top"><input type="text" placeholder="Element Label" /></td>';
        row.innerHTML += '<td valign="top"><div><button class="' + this._add_values_uniq_class_name + '">Add Values</button></div></td>';
        row.innerHTML += '<td valign="top"><button class="' + this._add_btn_uniq_class_name + '">+</button><button class="' + this._remove_btn_uniq_class_name + '">&times;</button></td>';
        return row;
    },
    _add_btn_uniq_class_name: 'dynamic_form_generator_element_add',
    _add_values_uniq_class_name: 'dynamic_form_generator_value_block_add',
    _add_value_uniq_class_name: 'dynamic_form_generator_value_add',
    _remove_btn_uniq_class_name: 'dynamic_form_generator_element_remove',
    addFormElement: function(row) {
        this.formContainer.appendChild(row);
        var lastElement = this.formElements[this.formElements.length - 1];
        if (lastElement) {
            lastElement.getElementsByClassName(this._add_btn_uniq_class_name)[0].disabled = true;
        }
        this.formElements.push(row);
    },
    addElement: function() {
        var i;
        for (i = 0; i < this.formElements.length; i++) {
            if (!this.validateElement(this.formElements[i])) {
                throw "Fill all the available fields first before adding another element!";
                return;
            }
        }
        var element = this.getNewFormElement();
        this.addFormElement(element);
    },
    validateElement: function(element) {
        var children = element.children;
        var i;
        for (i = 0; i < children.length; i++) {
            if (children[i].children[0]) {
                if (children[i].children[0].tagName.toLowerCase() == "input" && children[i].children[0].value == "") {
                    return false;
                }
            } else {
                if (children[i].tagName.toLowerCase() == "input" && children[i].value == "") {
                    return false;
                }
            }
        }
        return true;
    },
    getNewValueElement: function() {
        var row = document.createElement('div');
        row.innerHTML += '<input type="text" placeholder="Value" />';
        row.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;';
        row.innerHTML += '<input type="text" placeholder="Label" />';
        row.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;';
        row.innerHTML += '<button class="' + this._add_value_uniq_class_name + '">Add Value</button>';
        row.innerHTML += "<hr/>";
        return row;
    },
    addValueElement: function(parent, element) {
        var lastElement = parent.children[parent.children.length - 1];
        if (lastElement && parent.children.length > 1) {
            lastElement.getElementsByClassName(this._add_value_uniq_class_name)[0].disabled = true;
        }
        parent.appendChild(element);
    },
    addValue: function(parent) {
        var i;
        var values = parent.children;
        for (i = 0; i < values.length; i++) {
            if (!this.validateElement(values[i])) {
                throw "Fill all the available fields first before adding another element!";
                return;
            }
        }
        var element = this.getNewValueElement();
        this.addValueElement(parent, element);
    },
    _addDynamicElementAdderListener: function() {
        var self = this;
        document.querySelector('body').addEventListener('click', function(event) {
            if (event.target.tagName.toLowerCase() === 'button') {
                if (event.target.className == self._add_btn_uniq_class_name) {
                    self.addElement();
                } else if (event.target.className == self._add_values_uniq_class_name) {
                    event.target.style.display = "none";
                    self.addValue(event.target.parentElement);
                } else if (event.target.className == self._add_value_uniq_class_name) {
                    self.addValue(event.target.parentElement.parentElement);
                } else if (event.target.className == self._remove_btn_uniq_class_name) {
                    self.removeElement(event.target.parentElement.parentElement);
                }
            }
        });
    },
    removeElement: function(element){
        if(this.formElements.length <= 1){
            throw "Can't remove row as it is the only row left";
            return;
        }
        element.parentElement.removeChild(element);
        this.formElements.splice(this.formElements.indexOf(element), 1);
        this.formElements[this.formElements.length-1].getElementsByClassName(this._add_btn_uniq_class_name)[0].disabled = false;
    },
    JSONize: function() {
        var JSON = [];
        var i, j;
        for (i = 0; i < this.formElements.length; i++) {
            if (!this.validateElement(this.formElements[i])) {
                throw "Error JSONizing. Check if all values are properly filled and not tampered with";
                return false;
            }
            var element = {};
            element.type = this.replaceWildcards(this.formElements[i].children[0].children[0].value);
            element.name = this.replaceWildcards(this.formElements[i].children[1].children[0].value);
            element.class = this.replaceWildcards(this.formElements[i].children[2].children[0].value);
            element.label = this.replaceWildcards(this.formElements[i].children[3].children[0].value);
            element.values = this.formElements[i].children[4].children[0].children.length == 1 ? "" : this.JSON_parse_values(this.formElements[i].children[4].children[0].children);
            JSON.push(element);
        }
        this._JSON = JSON;
        return this._JSON;
    },
    replaceWildcards: function(string, opposite) {
    	if(typeof string != "string"){
    		return string;
    	}
        var i,
            regExp;
        for (i = 0; i < this._wildcards.length; i++) {
            if(opposite){
                regExp = this.RegExp(this._wildcards[i].new, "g");
                string = string.replace(regExp, this._wildcards[i].old);
            }
            else{
                regExp = this.RegExp(this._wildcards[i].old, "g");
                string = string.replace(regExp, this._wildcards[i].new);
            }
        }
        return string;
    },
    RegExp: function(string, flag){
		return new RegExp(string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), flag);
    },
    JSON_parse_values: function(valuesNode) {
        var i;
        var JSON = [];
        for (i = 1; i < valuesNode.length; i++) {
            if (!this.validateElement(valuesNode[i])) {
                throw "Error JSONizing. Check if all values are properly filled and not tampered with";
                return false;
            }
            var element = {};
            element.value = this.replaceWildcards(valuesNode[i].children[0].value);
            element.label = this.replaceWildcards(valuesNode[i].children[1].value);
            JSON.push(element);
        }
        return JSON;
    },
    unJSONize: function(JSON) {
        var formElements = [];
        var i;
        for (i = 0; i < JSON.length; i++) {
            var element = this.renderElement(JSON[i]);
            formElements.push(element);
        }
        return formElements;
    },
    renderElement: function(raw) {
        raw = this.renderElementBefore(raw);
        var type = raw.type.toLowerCase();
        var element;
        switch (type) {
            case "select":
                element = this.renderElementSelect(raw);
                break;
            case "multiselect":
                element = this.renderElementMultiselect(raw);
                break;
            default:
                element = this.renderElementDefault(raw);
                break;
        }
        var div = document.createElement("div");
        var label = document.createElement('label');
        label.innerHTML = raw.label;
        div.appendChild(label);
        div.appendChild(element);
        return this.renderElementAfter(div);
    },
    renderElementAfter: function(element){
        return element;
    },
    renderElementBefore: function(raw){
        return raw;
    },
    renderElementSelect: function(raw){
        var j;
        var element = document.createElement(raw.type);
        element.name = raw.name;
        element.className = raw.class;
        element.label = raw.label;
        for (j = 0; j < raw.values.length; j++) {
            var option = document.createElement('option');
            option.value = raw.values[j].value;
            option.innerHTML = raw.values[j].label;
            element.appendChild(option);
        }
        return element;
    },
    renderElementMultiselect: function(raw){
        raw.type = "select";
        var element = this.renderElementSelect(raw);
        element.multiple = true;
        return element;
    },
    renderElementDefault: function(raw){
        var j;
        var element = document.createElement('input');
        element.type = raw.type;
        element.name = raw.name;
        element.className = raw.class;
        element.label = raw.label;
        return element;
    }
}