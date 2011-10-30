/*
* BasicUnit by James O'Reilly. Oct 29, 2011
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

/**
 * Intentionally simple unit testing for really basic tests
 */
(function(window) {
BasicUnit = function() {
	this.initialize();
}
var p = BasicUnit.prototype;

// private properties:
	p._passCount = 0;
	p._failCount = 0;
	
// public methods:
	p.initialize = function() {
		this._passCount = this._failCount = 0
	}
	
	p.getPassCount = function() {
		return this._passCount;
	}
	
	p.getFailCount = function() {
		return this._failCount;
	}
	
	p.getTestCount = function() {
		return (this._passCount + this._failCount);
	}
	
	p.assertEquals = function(prop, val, msg) {
		(prop == val) 
			? this.pass(msg)
			: this.fail(prop + ' != ' + val)
	}
	
	p.assertNotEquals = function(prop, val, msg) {
		(prop != val) 
			? this.pass(msg)
			: this.fail(prop + ' == ' + val)
	}

	p.pass = function(s) {
		this._passCount++;
		document.write('<div class="pass">Pass: ' + s + '</div>\n');
	}
	
	p.fail = function(s) {
		this._failCount++;
		document.write('<div class="fail">Fail: ' + s + '</div>\n');
	}
	
window.BasicUnit = BasicUnit;
}(window));
