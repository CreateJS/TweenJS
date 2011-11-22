/*
* PositionLabel by James O'Reilly. Oct 29, 2011
*
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

(function(window) {

/**
* 
* @class PositionLabel
* @constructor
**/
PositionLabel = function(position, name) {
	this.initialize(position, name);
}
var p = PositionLabel.prototype;

// private properties:
	p._position = null;
	p._name = null;
	
// constructor:
	/** 
	* Initialization method.
	* @method initialize
	* @protected
	**/
	p.initialize = function(position, name) {
		var pos = parseFloat(position);
		if (isNaN(pos) || (pos < 0)) {
			throw "Position must be a positive number";
		} else if (typeof(name) != "string" || name == "") {
			throw "Name must be a string with one or more characters";
		} else {
			this._position = pos;
			this._name = name;
		}
	}
	
// public methods:
	p.getPosition = function () {
		return this._position; 
	}
	
	p.getName = function () {
		return this._name; 
	}

	/**
	* Returns a clone of this PositionLabel instance.
	* @method clone
	 @return {PositionLabel} A clone of the current PositionLabel instance.
	**/
	p.clone = function() {
		return new PositionLabel(this.getPosition(), this.getName());
	}

	/**
	* Returns a string representation of this object.
	* @method toString
	* @return {String} a string representation of the instance.
	**/
	p.toString = function() {
		return "[PositionLabel postion="+this.getPosition()+" name="+this.getName()+"]";
	}
	
window.PositionLabel = PositionLabel;
}(window));
