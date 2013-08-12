/**
 * @module TweenJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
  "use strict";

  RaphaelJSUtilities = (function() {
    var objectToString = Object.prototype.toString,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        lowerCase = String.prototype.toLowerCase,
        upperCase = String.prototype.toUpperCase
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        has = "hasOwnProperty",
        apply = "apply",
        array = "array",
        concat = "concat",
        math = Math,
        PI = math.PI,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        toFloat = parseFloat,
        toInt = parseInt,
        getTotalLength = getLengthFactory(1),
        getSubpathsAtLength = getLengthFactory(0, 1);

      function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
          return array.push(array.splice(i, 1)[0]);
        }
      }

      function l2c(x1, y1, x2, y2) {
        return [x1, y1, x2, y2, x2, y2];
      }

      function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;

        return t * t2 - 3 * p1 + 3 * p2;
      }

      function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
          var p = [
            {x: +crp[i - 2], y: +crp[i - 1]},
            {x: +crp[i],     y: +crp[i + 1]},
            {x: +crp[i + 2], y: +crp[i + 3]},
            {x: +crp[i + 4], y: +crp[i + 5]}
          ];
          if (z) {
            if (!i) {
              p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
            } else if (iLen - 4 == i) {
              p[3] = {x: +crp[0], y: +crp[1]};
            } else if (iLen - 2 == i) {
              p[2] = {x: +crp[0], y: +crp[1]};
              p[3] = {x: +crp[2], y: +crp[3]};
            }
          } else {
            if (iLen - 4 == i) {
              p[3] = p[2];
            } else if (!i) {
              p[0] = {x: +crp[i], y: +crp[i + 1]};
            }
          }
          d.push(["C",
            (-p[0].x + 6 * p[1].x + p[2].x) / 6,
            (-p[0].y + 6 * p[1].y + p[2].y) / 6,
            (p[1].x + 6 * p[2].x - p[3].x) / 6,
            (p[1].y + 6*p[2].y - p[3].y) / 6,
            p[2].x,
            p[2].y
          ]);
        }

        return d;
      }

    function pathToAbsolute(pathArray) {
        var pth = paths(pathArray);
        if (pth.abs) {
          return pathClone(pth.abs);
        }
        if (!is(pathArray, array) || !is(pathArray && pathArray[0], array)) { // rough assumption
          pathArray = parsePathString(pathArray);
        }
        if (!pathArray || !pathArray.length) {
          return [["M", 0, 0]];
        }
        var res = [],
          x = 0,
          y = 0,
          mx = 0,
          my = 0,
          start = 0;
        if (pathArray[0][0] == "M") {
          x = +pathArray[0][1];
          y = +pathArray[0][2];
          mx = x;
          my = y;
          start++;
          res[0] = ["M", x, y];
        }
        var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
        for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
          res.push(r = []);
          pa = pathArray[i];
          if (pa[0] != upperCase.call(pa[0])) {
            r[0] = upperCase.call(pa[0]);
            switch (r[0]) {
              case "A":
                r[1] = pa[1];
                r[2] = pa[2];
                r[3] = pa[3];
                r[4] = pa[4];
                r[5] = pa[5];
                r[6] = +(pa[6] + x);
                r[7] = +(pa[7] + y);
                break;
              case "V":
                r[1] = +pa[1] + y;
                break;
              case "H":
                r[1] = +pa[1] + x;
                break;
              case "R":
                var dots = [x, y][concat](pa.slice(1));
                for (var j = 2, jj = dots.length; j < jj; j++) {
                  dots[j] = +dots[j] + x;
                  dots[++j] = +dots[j] + y;
                }
                res.pop();
                res = res[concat](catmullRom2bezier(dots, crz));
                break;
              case "M":
                mx = +pa[1] + x;
                my = +pa[2] + y;
              default:
                for (j = 1, jj = pa.length; j < jj; j++) {
                  r[j] = +pa[j] + ((j % 2) ? x : y);
                }
            }
          } else if (pa[0] == "R") {
            dots = [x, y][concat](pa.slice(1));
            res.pop();
            res = res[concat](catmullRom2bezier(dots, crz));
            r = ["R"][concat](pa.slice(-2));
          } else {
            for (var k = 0, kk = pa.length; k < kk; k++) {
              r[k] = pa[k];
            }
          }
          switch (r[0]) {
            case "Z":
              x = mx;
              y = my;
              break;
            case "H":
              x = r[1];
              break;
            case "V":
              y = r[1];
              break;
            case "M":
              mx = r[r.length - 2];
              my = r[r.length - 1];
            default:
              x = r[r.length - 2];
              y = r[r.length - 1];
          }
        }
        res.toString = _path2string;
        pth.abs = pathClone(res);
        return res;
      }

      function cacher(f, scope, postprocessor) {
        function newf() {
          var arg = Array.prototype.slice.call(arguments, 0),
              args = arg.join("\u2400"),
              cache = newf.cache = newf.cache || {},
              count = newf.count = newf.count || [];
          if (cache[has](args)) {
            repush(count, args);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
          }
          count.length >= 1e3 && delete cache[count.shift()];
          count.push(args);
          cache[args] = f[apply](scope, arg);
          return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
      }

      var path2curve = cacher(function (path, path2) {
        var pth = !path2 && paths(path);
        if (!path2 && pth.curve) {
            return pathClone(pth.curve);
        }
        var p = pathToAbsolute(path),
            p2 = path2 && pathToAbsolute(path2),
            attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
            processPath = function (path, d) {
                var nx, ny;
                if (!path) {
                  return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                }
                !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                switch (path[0]) {
                  case "M":
                    d.X = path[1];
                    d.Y = path[2];
                    break;
                  case "A":
                    path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                    break;
                  case "S":
                    nx = d.x + (d.x - (d.bx || d.x));
                    ny = d.y + (d.y - (d.by || d.y));
                    path = ["C", nx, ny][concat](path.slice(1));
                    break;
                  case "T":
                    d.qx = d.x + (d.x - (d.qx || d.x));
                    d.qy = d.y + (d.y - (d.qy || d.y));
                    path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                    break;
                  case "Q":
                    d.qx = path[1];
                    d.qy = path[2];
                    path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                    break;
                  case "L":
                    path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                    break;
                  case "H":
                    path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                    break;
                  case "V":
                    path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                    break;
                  case "Z":
                    path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                    break;
                }
                return path;
            },
            fixArc = function (pp, i) {
              if (pp[i].length > 7) {
                pp[i].shift();
                var pi = pp[i];
                while (pi.length) {
                  pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                }
                pp.splice(i, 1);
                ii = mmax(p.length, p2 && p2.length || 0);
              }
            },
            fixM = function (path1, path2, a1, a2, i) {
              if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                path2.splice(i, 0, ["M", a2.x, a2.y]);
                a1.bx = 0;
                a1.by = 0;
                a1.x = path1[i][1];
                a1.y = path1[i][2];
                ii = mmax(p.length, p2 && p2.length || 0);
              }
            };
        for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
          p[i] = processPath(p[i], attrs);
          fixArc(p, i);
          p2 && (p2[i] = processPath(p2[i], attrs2));
          p2 && fixArc(p2, i);
          fixM(p, p2, attrs, attrs2, i);
          fixM(p2, p, attrs2, attrs, i);
          var seg = p[i],
              seg2 = p2 && p2[i],
              seglen = seg.length,
              seg2len = p2 && seg2.length;
          attrs.x = seg[seglen - 2];
          attrs.y = seg[seglen - 1];
          attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
          attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
          attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
          attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
          attrs2.x = p2 && seg2[seg2len - 2];
          attrs2.y = p2 && seg2[seg2len - 1];
        }
        if (!p2) {
          pth.curve = pathClone(p);
        }
        return p2 ? [p, p2] : p;
      }, null, pathClone);

      function parsePathString(pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }

        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (is(pathString, array) && is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
          String(pathString).replace(pathCommand, function (a, b, c) {
            var params = [],
                name = b.toLowerCase();
            c.replace(pathValues, function (a, b) {
              b && params.push(+b);
            });
            if (name == "m" && params.length > 2) {
              data.push([b][concat](params.splice(0, 2)));
              name = "l";
              b = b == "m" ? "l" : "L";
            }
            if (name == "r") {
              data.push([b][concat](params));
            } else while (params.length >= paramCounts[name]) {
              data.push([b][concat](params.splice(0, paramCounts[name])));
              if (!paramCounts[name]) {
                  break;
              }
            }
          });
        }
        data.toString = _path2string;
        pth.arr = pathClone(data);
        return data;
      }

      function getSubpath(path, from, to) {
          if (getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
          }
          var a = getSubpathsAtLength(path, to, 1);
          return from ? getSubpathsAtLength(a, from).end : a;
      }

      function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
          if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
          }
          var t = 1,
              step = t / 2,
              t2 = t - step,
              l,
              e = .01;
          l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
          while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
          }
          return t2;
      }

      function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
          z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
          var ct = z2 * Tvalues[i] + z2,
              xbase = base3(ct, x1, x2, x3, x4),
              ybase = base3(ct, y1, y2, y3, y4),
              comb = xbase * xbase + ybase * ybase;
          sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
      }

      function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
          x: x,
          y: y,
          m: {x: mx, y: my},
          n: {x: nx, y: ny},
          start: {x: ax, y: ay},
          end: {x: cx, y: cy},
          alpha: alpha
        };
      }

      function getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        if (length == null) {
          return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        } else {
          return findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
        }
      }

      function getLengthFactory (istotal, subpath) {
        return function (path, length, onlystart) {
          path = path2curve(path);
          var x, y, p, l, sp = "", subpaths = {}, point,
              len = 0;
          for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
              x = +p[1];
              y = +p[2];
            } else {
              l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
              if (len + l > length) {
                if (subpath && !subpaths.start) {
                  point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                  sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                  if (onlystart) {return sp;}
                  subpaths.start = sp;
                  sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                  len += l;
                  x = +p[5];
                  y = +p[6];
                  continue;
                }
                if (!istotal && !subpath) {
                  point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                  return {x: point.x, y: point.y, alpha: point.alpha};
                }
              }
              len += l;
              x = +p[5];
              y = +p[6];
            }
            sp += p.shift() + p;
          }
          subpaths.end = sp;
          point = istotal ? len : subpath ? subpaths : findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
          point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
          return point;
        };
      };

      function clone(obj) {
        if (Object(obj) !== obj) {
          return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
          res[key] = clone(obj[key]);
        }
        return res;
      }

      function _path2string() {
        return this.join(",").replace(p2s, "$1");
      }

      function pathClone(pathArray) {
        var res = clone(pathArray);
        res.toString = _path2string;
        return res;
      }

      function paths(ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
          p[ps].sleep = 100;
        } else {
          p[ps] = {
              sleep: 100
          };
        }
        setTimeout(function () {
          for (var key in p) if (p[has](key) && key != ps) {
            p[key].sleep--;
            !p[key].sleep && delete p[key];
          }
        });
        return p[ps];
      }

      function is(o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
          return !isnan[has](+o);
        }
        if (type == "array") {
          return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
      }

      return {
        getTotalLength: getTotalLength,
        parsePathString: parsePathString,
        getSubpath: getSubpath
      };
  })();


  /**
   * A TweenJS plugin for working with animated path drawing.
   * This plugin uses a subset of RaphaelJS(http://raphaeljs.com/) methods to compute the animation steps.
   *
   * To use, install the plugin after TweenJS has loaded. Next tween the 'guide' property with an object as detailed below.
   *
   *       createjs.LineAnimationPlugin.install();
   *
   * <h4>Example</h4>
   *
   *      // Using a Line Animation
   *      var target = new createjs.Shape();
   *
   *      target.color = '#000000';
   *      target.strokeWidth = 3;
   *
   *      createjs.Tween.get(target).to({path: "M 85,128 C 123,124 139,124 168,127 L 338,55 369,54", pathShrink: true},5000);
   *
   * Properties:
   * <UL>
   *      <LI> path: Required, String : The SVG path describing the final line.</LI>
   *      <LI> pathShrink: Optional, boolean : If true, the animation starts with the complete line and shrinks.</LI>
   * </UL>
   *
   * @class LineAnimationPlugin
   * @constructor
   **/
  function LineAnimationPlugin() {
    throwErr(CANNOT_INSTANTIATE);
  }

  function isValidTarget(t) {
    return !!t.graphics;
  }

  var CANNOT_INSTANTIATE = 'LineAnimationPlugin cannot be instantiated.';
  var NOT_VALID_TARGET = 'Object does not support path tweens.';

  var propIndex = ['path', 'pathShrink'];

  function throwErr() {
    throw(formatStr.apply(arguments[0], Array.prototype.splice.call(arguments, 1)));
  }
  function formatStr() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  }


  LineAnimationPlugin.priority = -10;

  /**
   * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
   * @method install
   * @static
   **/
  LineAnimationPlugin.install = function() {
    createjs.Tween.installPlugin(LineAnimationPlugin, propIndex);

    return createjs.Tween.IGNORE;
  }

  LineAnimationPlugin.init = function(tween, prop, value) {
    var shape = tween._target;

    if(!isValidTarget(shape)) {
      throwErr(NOT_VALID_TARGET);
    }

    return value;
  }

  LineAnimationPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
    var shape = tween._target,
        ctx = shape.graphics;

    if(wait) {
      if(ratio.toFixed(2) == 0) {
        ctx.clear();
      }
      return;
    }
    endValues.oldRatio = ratio;

    if(!endValues.pathLength) {
      endValues.pathLength = RaphaelJSUtilities.getTotalLength(endValues.path);
    }

    if(ratio > 1) {
      ratio = 1;
    }

    ctx.clear();
    ctx.beginStroke(shape.color).setStrokeStyle(shape.strokeWidth, 1, 1);

    var currentLength = (!!endValues.pathShrink)
                          ? (endValues.pathLength - (endValues.pathLength * ratio))
                          : endValues.pathLength * ratio,
        subpath = RaphaelJSUtilities.parsePathString(RaphaelJSUtilities.getSubpath(endValues.path, 0, currentLength)),
        instructions = {
          M: 'moveTo',
          C: 'bezierCurveTo',
          L: 'lineTo',
          Z: 'closePath',
          S: 'curveTo',
          Q: 'quadraticCurveTo'
        };

    for(var i = 0; i < subpath.length; ++i) {
      var instruction = subpath[i],
          command = instruction.shift();

      ctx[instructions[command]].apply(ctx, instruction);
    }

    return value;
  }

  createjs.LineAnimationPlugin = LineAnimationPlugin;
}());