import {
  buildColumnsMeta
} from "./chunk-B7RPT2FF.js";
import {
  BENIN_DEPARTEMENTS,
  readSync,
  utils
} from "./chunk-YSBAVJAT.js";
import {
  isSupabaseConfigured,
  supabase
} from "./chunk-U3XLNF6K.js";
import {
  Sidebar,
  UserMenu
} from "./chunk-FYJTF33N.js";
import {
  Bell,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileCheckCorner,
  FileSpreadsheet,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
  __commonJS,
  __toESM,
  require_react
} from "./chunk-INE2IJBE.js";

// node_modules/papaparse/papaparse.min.js
var require_papaparse_min = __commonJS({
  "node_modules/papaparse/papaparse.min.js"(exports, module) {
    ((e, t) => {
      "function" == typeof define && define.amd ? define([], t) : "object" == typeof module && "undefined" != typeof exports ? module.exports = t() : e.Papa = t();
    })(exports, function r() {
      var n = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== n ? n : {};
      var s = !n.document && !!n.postMessage, a = n.IS_PAPA_WORKER || false, o = {}, h = 0, w = {};
      function P(e) {
        return 65279 === e.charCodeAt(0) ? e.slice(1) : e;
      }
      function u(e) {
        this._handle = null, this._finished = false, this._completed = false, this._halted = false, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = true, this._completeResults = { data: [], errors: [], meta: {} }, function(e2) {
          var t = b(e2);
          t.chunkSize = parseInt(t.chunkSize), e2.step || e2.chunk || (t.chunkSize = null);
          this._handle = new i(t), (this._handle.streamer = this)._config = t;
        }.call(this, e), this.parseChunk = function(t, e2) {
          var i2 = parseInt(this._config.skipFirstNLines) || 0;
          if (this.isFirstChunk && 0 < i2) {
            let e3 = this._config.newline;
            e3 || (r2 = this._config.quoteChar || '"', e3 = this._handle.guessLineEndings(t, r2)), t = [...t.split(e3).slice(i2)].join(e3);
          }
          this.isFirstChunk && U(this._config.beforeFirstChunk) && void 0 !== (r2 = this._config.beforeFirstChunk(t)) && (t = r2), this.isFirstChunk = false, this._halted = false;
          var i2 = this._partialLine + t, r2 = (this._partialLine = "", this._handle.parse(i2, this._baseIndex, !this._finished));
          if (!this._handle.paused() && !this._handle.aborted()) {
            t = r2.meta.cursor, i2 = (this._finished || (this._partialLine = i2.substring(t - this._baseIndex), this._baseIndex = t), r2 && r2.data && (this._rowCount += r2.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview);
            if (a) n.postMessage({ results: r2, workerId: w.WORKER_ID, finished: i2 });
            else if (U(this._config.chunk) && !e2) {
              if (this._config.chunk(r2, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = true);
              this._completeResults = r2 = void 0;
            }
            return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(r2.data), this._completeResults.errors = this._completeResults.errors.concat(r2.errors), this._completeResults.meta = r2.meta), this._completed || !i2 || !U(this._config.complete) || r2 && r2.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = true), i2 || r2 && r2.meta.paused || this._nextChunk(), r2;
          }
          this._halted = true;
        }, this._sendError = function(e2) {
          U(this._config.error) ? this._config.error(e2) : a && this._config.error && n.postMessage({ workerId: w.WORKER_ID, error: e2, finished: false });
        };
      }
      function d(e) {
        var r2;
        (e = e || {}).chunkSize || (e.chunkSize = w.RemoteChunkSize), u.call(this, e), this._nextChunk = s ? function() {
          this._readChunk(), this._chunkLoaded();
        } : function() {
          this._readChunk();
        }, this.stream = function(e2) {
          this._input = e2, this._nextChunk();
        }, this._readChunk = function() {
          if (this._finished) this._chunkLoaded();
          else {
            if (r2 = new XMLHttpRequest(), this._config.withCredentials && (r2.withCredentials = this._config.withCredentials), s || (r2.onload = m(this._chunkLoaded, this), r2.onerror = m(this._chunkError, this)), r2.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !s), this._config.downloadRequestHeaders) {
              var e2, t = this._config.downloadRequestHeaders;
              for (e2 in t) r2.setRequestHeader(e2, t[e2]);
            }
            var i2;
            this._config.chunkSize && (i2 = this._start + this._config.chunkSize - 1, r2.setRequestHeader("Range", "bytes=" + this._start + "-" + i2));
            try {
              r2.send(this._config.downloadRequestBody);
            } catch (e3) {
              this._chunkError(e3.message);
            }
            s && 0 === r2.status && this._chunkError();
          }
        }, this._chunkLoaded = function() {
          4 === r2.readyState && (r2.status < 200 || 400 <= r2.status ? this._chunkError() : (this._start += this._config.chunkSize || r2.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((e2) => null !== (e2 = e2.getResponseHeader("Content-Range")) ? parseInt(e2.substring(e2.lastIndexOf("/") + 1)) : -1)(r2), this.parseChunk(r2.responseText)));
        }, this._chunkError = function(e2) {
          e2 = r2.statusText || e2;
          this._sendError(new Error(e2));
        };
      }
      function l(e) {
        (e = e || {}).chunkSize || (e.chunkSize = w.LocalChunkSize), u.call(this, e);
        var i2, r2, n2 = "undefined" != typeof FileReader;
        this.stream = function(e2) {
          this._input = e2, r2 = e2.slice || e2.webkitSlice || e2.mozSlice, n2 ? ((i2 = new FileReader()).onload = m(this._chunkLoaded, this), i2.onerror = m(this._chunkError, this)) : i2 = new FileReaderSync(), this._nextChunk();
        }, this._nextChunk = function() {
          this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
        }, this._readChunk = function() {
          var e2 = this._input, t = (this._config.chunkSize && (t = Math.min(this._start + this._config.chunkSize, this._input.size), e2 = r2.call(e2, this._start, t)), i2.readAsText(e2, this._config.encoding));
          n2 || this._chunkLoaded({ target: { result: t } });
        }, this._chunkLoaded = function(e2) {
          this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e2.target.result);
        }, this._chunkError = function() {
          this._sendError(i2.error);
        };
      }
      function f(e) {
        var i2;
        u.call(this, e = e || {}), this.stream = function(e2) {
          return i2 = e2, this._nextChunk();
        }, this._nextChunk = function() {
          var e2, t;
          if (!this._finished) return e2 = this._config.chunkSize, i2 = e2 ? (t = i2.substring(0, e2), i2.substring(e2)) : (t = i2, ""), this._finished = !i2, this.parseChunk(t);
        };
      }
      function c(e) {
        u.call(this, e = e || {});
        var t = [], i2 = true, r2 = false;
        this.pause = function() {
          u.prototype.pause.apply(this, arguments), this._input.pause();
        }, this.resume = function() {
          u.prototype.resume.apply(this, arguments), this._input.resume();
        }, this.stream = function(e2) {
          this._input = e2, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
        }, this._checkIsFinished = function() {
          r2 && 1 === t.length && (this._finished = true);
        }, this._nextChunk = function() {
          this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : i2 = true;
        }, this._streamData = m(function(e2) {
          try {
            t.push("string" == typeof e2 ? e2 : e2.toString(this._config.encoding)), i2 && (i2 = false, this._checkIsFinished(), this.parseChunk(t.shift()));
          } catch (e3) {
            this._streamError(e3);
          }
        }, this), this._streamError = m(function(e2) {
          this._streamCleanUp(), this._sendError(e2);
        }, this), this._streamEnd = m(function() {
          this._streamCleanUp(), r2 = true, this._streamData("");
        }, this), this._streamCleanUp = m(function() {
          this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
        }, this);
      }
      function i(m2) {
        var n2, s2, a2, t, o2 = Math.pow(2, 53), h2 = -o2, u2 = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, d2 = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, i2 = this, r2 = 0, l2 = 0, f2 = false, e = false, c2 = [], p2 = { data: [], errors: [], meta: {} };
        function y(e2) {
          return "greedy" === m2.skipEmptyLines ? "" === e2.join("").trim() : 1 === e2.length && 0 === e2[0].length;
        }
        function _2() {
          if (p2 && a2 && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + w.DefaultDelimiter + "'"), a2 = false), m2.skipEmptyLines && (p2.data = p2.data.filter(function(e3) {
            return !y(e3);
          })), g2()) {
            let t3 = function(e3, t4) {
              e3 = P(e3), U(m2.transformHeader) && (e3 = m2.transformHeader(e3, t4)), c2.push(e3);
            };
            var t2 = t3;
            if (p2) if (Array.isArray(p2.data[0])) {
              for (var e2 = 0; g2() && e2 < p2.data.length; e2++) p2.data[e2].forEach(t3);
              p2.data.splice(0, 1);
            } else p2.data.forEach(t3);
          }
          function i3(e3, t3) {
            for (var i4 = m2.header ? {} : [], r4 = 0; r4 < e3.length; r4++) {
              var n3 = r4, s3 = e3[r4], s3 = ((e4, t4) => ((e5) => (m2.dynamicTypingFunction && void 0 === m2.dynamicTyping[e5] && (m2.dynamicTyping[e5] = m2.dynamicTypingFunction(e5)), true === (m2.dynamicTyping[e5] || m2.dynamicTyping)))(e4) ? "true" === t4 || "TRUE" === t4 || "false" !== t4 && "FALSE" !== t4 && (((e5) => {
                if (u2.test(e5)) {
                  e5 = parseFloat(e5);
                  if (h2 < e5 && e5 < o2) return 1;
                }
              })(t4) ? parseFloat(t4) : d2.test(t4) ? new Date(t4) : "" === t4 ? null : t4) : t4)(n3 = m2.header ? r4 >= c2.length ? "__parsed_extra" : c2[r4] : n3, s3 = m2.transform ? m2.transform(s3, n3) : s3);
              "__parsed_extra" === n3 ? (i4[n3] = i4[n3] || [], i4[n3].push(s3)) : i4[n3] = s3;
            }
            return m2.header && (r4 > c2.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + c2.length + " fields but parsed " + r4, l2 + t3) : r4 < c2.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + c2.length + " fields but parsed " + r4, l2 + t3)), i4;
          }
          var r3;
          p2 && (m2.header || m2.dynamicTyping || m2.transform) && (r3 = 1, !p2.data.length || Array.isArray(p2.data[0]) ? (p2.data = p2.data.map(i3), r3 = p2.data.length) : p2.data = i3(p2.data, 0), m2.header && p2.meta && (p2.meta.fields = c2), l2 += r3);
        }
        function g2() {
          return m2.header && 0 === c2.length;
        }
        function k(e2, t2, i3, r3) {
          e2 = { type: e2, code: t2, message: i3 };
          void 0 !== r3 && (e2.row = r3), p2.errors.push(e2);
        }
        U(m2.step) && (t = m2.step, m2.step = function(e2) {
          p2 = e2, g2() ? _2() : (_2(), 0 !== p2.data.length && (r2 += e2.data.length, m2.preview && r2 > m2.preview ? s2.abort() : (p2.data = p2.data[0], t(p2, i2))));
        }), this.parse = function(e2, t2, i3) {
          var r3 = m2.quoteChar || '"', r3 = (m2.newline || (m2.newline = this.guessLineEndings(e2, r3)), a2 = false, m2.delimiter ? U(m2.delimiter) && (m2.delimiter = m2.delimiter(e2), p2.meta.delimiter = m2.delimiter) : ((r3 = ((e3, t3, i4, r4, n3) => {
            var s3, a3, o3, h3;
            n3 = n3 || [",", "	", "|", ";", w.RECORD_SEP, w.UNIT_SEP];
            for (var u3 = 0; u3 < n3.length; u3++) {
              for (var d3, l3 = n3[u3], f3 = 0, c3 = 0, p3 = 0, _3 = (o3 = void 0, new E({ comments: r4, delimiter: l3, newline: t3, preview: 10 }).parse(e3)), g3 = 0; g3 < _3.data.length; g3++) i4 && y(_3.data[g3]) ? p3++ : (d3 = _3.data[g3].length, c3 += d3, void 0 === o3 ? o3 = d3 : 0 < d3 && (f3 += Math.abs(d3 - o3), o3 = d3));
              0 < _3.data.length && (c3 /= _3.data.length - p3), 1.99 < c3 && (void 0 === a3 || f3 < a3 || f3 === a3 && h3 < c3) && (a3 = f3, s3 = l3, h3 = c3);
            }
            return { successful: !!(m2.delimiter = s3), bestDelimiter: s3 };
          })(e2, m2.newline, m2.skipEmptyLines, m2.comments, m2.delimitersToGuess)).successful ? m2.delimiter = r3.bestDelimiter : (a2 = true, m2.delimiter = w.DefaultDelimiter), p2.meta.delimiter = m2.delimiter), b(m2));
          return m2.preview && m2.header && r3.preview++, n2 = e2, s2 = new E(r3), p2 = s2.parse(n2, t2, i3), _2(), f2 ? { meta: { paused: true } } : p2 || { meta: { paused: false } };
        }, this.paused = function() {
          return f2;
        }, this.pause = function() {
          f2 = true, s2.abort(), n2 = U(m2.chunk) ? "" : n2.substring(s2.getCharIndex());
        }, this.resume = function() {
          i2.streamer._halted ? (f2 = false, i2.streamer.parseChunk(n2, true)) : setTimeout(i2.resume, 3);
        }, this.aborted = function() {
          return e;
        }, this.abort = function() {
          e = true, s2.abort(), p2.meta.aborted = true, U(m2.complete) && m2.complete(p2), n2 = "";
        }, this.guessLineEndings = function(e2, t2) {
          e2 = e2.substring(0, 1048576);
          var t2 = new RegExp(q(t2) + "([^]*?)" + q(t2), "gm"), i3 = (e2 = e2.replace(t2, "")).split("\r"), t2 = e2.split("\n"), e2 = 1 < t2.length && t2[0].length < i3[0].length;
          if (1 === i3.length || e2) return "\n";
          for (var r3 = 0, n3 = 0; n3 < i3.length; n3++) "\n" === i3[n3][0] && r3++;
          return r3 >= i3.length / 2 ? "\r\n" : "\r";
        };
      }
      function q(e) {
        return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      function E(C) {
        var S = (C = C || {}).delimiter, O = C.newline, x = C.comments, I = C.step, A = C.preview, T = C.fastMode, D = null, L = false, F = null == C.quoteChar ? '"' : C.quoteChar, z = F;
        if (void 0 !== C.escapeChar && (z = C.escapeChar), ("string" != typeof S || -1 < w.BAD_DELIMITERS.indexOf(S)) && (S = ","), x === S) throw new Error("Comment character same as delimiter");
        true === x ? x = "#" : ("string" != typeof x || -1 < w.BAD_DELIMITERS.indexOf(x)) && (x = false), "\n" !== O && "\r" !== O && "\r\n" !== O && (O = "\n");
        var M = 0, j = false;
        this.parse = function(i2, t, r2) {
          if ("string" != typeof i2) throw new Error("Input must be a string");
          var n2 = i2.length, e = S.length, s2 = O.length, a2 = x.length, o2 = U(I), h2 = [], u2 = [], d2 = [], l2 = M = 0;
          if (!i2) return v();
          if (T || false !== T && -1 === i2.indexOf(F)) {
            for (var f2 = i2.split(O), c2 = 0; c2 < f2.length; c2++) {
              if (d2 = f2[c2], M += d2.length, c2 !== f2.length - 1) M += O.length;
              else if (r2) return v();
              if (!x || d2.substring(0, a2) !== x) {
                if (o2) {
                  if (h2 = [], k(d2.split(S)), R(), j) return v();
                } else k(d2.split(S));
                if (A && A <= c2) return h2 = h2.slice(0, A), v(true);
              }
            }
            return v();
          }
          for (var p2 = i2.indexOf(S, M), _2 = i2.indexOf(O, M), g2 = new RegExp(q(z) + q(F), "g"), m2 = i2.indexOf(F, M); ; ) if (i2[M] === F) for (m2 = M, M++; ; ) {
            if (-1 === (m2 = i2.indexOf(F, m2 + 1))) return r2 || u2.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: h2.length, index: M }), E2();
            if (m2 === n2 - 1) return E2(i2.substring(M, m2).replace(g2, F));
            if (F === z && i2[m2 + 1] === z) m2++;
            else if (F === z || 0 === m2 || i2[m2 - 1] !== z) {
              -1 !== p2 && p2 < m2 + 1 && (p2 = i2.indexOf(S, m2 + 1));
              var y = w2(-1 === (_2 = -1 !== _2 && _2 < m2 + 1 ? i2.indexOf(O, m2 + 1) : _2) ? p2 : Math.min(p2, _2));
              if (i2.substr(m2 + 1 + y, e) === S) {
                d2.push(i2.substring(M, m2).replace(g2, F)), i2[M = m2 + 1 + y + e] !== F && (m2 = i2.indexOf(F, M)), p2 = i2.indexOf(S, M), _2 = i2.indexOf(O, M);
                break;
              }
              y = w2(_2);
              if (i2.substring(m2 + 1 + y, m2 + 1 + y + s2) === O) {
                if (d2.push(i2.substring(M, m2).replace(g2, F)), b2(m2 + 1 + y + s2), p2 = i2.indexOf(S, M), m2 = i2.indexOf(F, M), o2 && (R(), j)) return v();
                if (A && h2.length >= A) return v(true);
                break;
              }
              u2.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: h2.length, index: M }), m2++;
            }
          }
          else if (x && 0 === d2.length && i2.substring(M, M + a2) === x) {
            if (-1 === _2) return v();
            M = _2 + s2, _2 = i2.indexOf(O, M), p2 = i2.indexOf(S, M);
          } else if (-1 !== p2 && (p2 < _2 || -1 === _2)) d2.push(i2.substring(M, p2)), M = p2 + e, p2 = i2.indexOf(S, M);
          else {
            if (-1 === _2) break;
            if (d2.push(i2.substring(M, _2)), b2(_2 + s2), o2 && (R(), j)) return v();
            if (A && h2.length >= A) return v(true);
          }
          return E2();
          function k(e2) {
            h2.push(e2), l2 = M;
          }
          function w2(e2) {
            var t2 = 0;
            return t2 = -1 !== e2 && (e2 = i2.substring(m2 + 1, e2)) && "" === e2.trim() ? e2.length : t2;
          }
          function E2(e2) {
            return r2 || (void 0 === e2 && (e2 = i2.substring(M)), d2.push(e2), M = n2, k(d2), o2 && R()), v();
          }
          function b2(e2) {
            M = e2, k(d2), d2 = [], _2 = i2.indexOf(O, M);
          }
          function v(e2) {
            if (C.header && !t && h2.length && !L) {
              var s3 = h2[0], a3 = /* @__PURE__ */ Object.create(null), o3 = new Set(s3);
              let n3 = false;
              for (let r3 = 0; r3 < s3.length; r3++) {
                let i3 = P(s3[r3]);
                if (a3[i3 = U(C.transformHeader) ? C.transformHeader(i3, r3) : i3]) {
                  let e3, t2 = a3[i3];
                  for (; e3 = i3 + "_" + t2, t2++, o3.has(e3); ) ;
                  o3.add(e3), s3[r3] = e3, a3[i3]++, n3 = true, (D = null === D ? {} : D)[e3] = i3;
                } else a3[i3] = 1, s3[r3] = i3;
                o3.add(i3);
              }
              n3 && console.warn("Duplicate headers found and renamed."), L = true;
            }
            return { data: h2, errors: u2, meta: { delimiter: S, linebreak: O, aborted: j, truncated: !!e2, cursor: l2 + (t || 0), renamedHeaders: D } };
          }
          function R() {
            I(v()), h2 = [], u2 = [];
          }
        }, this.abort = function() {
          j = true;
        }, this.getCharIndex = function() {
          return M;
        };
      }
      function p(e) {
        var t = e.data, i2 = o[t.workerId], r2 = false;
        if (t.error) i2.userError(t.error, t.file);
        else if (t.results && t.results.data) {
          var n2 = { abort: function() {
            r2 = true, _(t.workerId, { data: [], errors: [], meta: { aborted: true } });
          }, pause: g, resume: g };
          if (U(i2.userStep)) {
            for (var s2 = 0; s2 < t.results.data.length && (i2.userStep({ data: t.results.data[s2], errors: t.results.errors, meta: t.results.meta }, n2), !r2); s2++) ;
            delete t.results;
          } else U(i2.userChunk) && (i2.userChunk(t.results, n2, t.file), delete t.results);
        }
        t.finished && !r2 && _(t.workerId, t.results);
      }
      function _(e, t) {
        var i2 = o[e];
        U(i2.userComplete) && i2.userComplete(t), i2.terminate(), delete o[e];
      }
      function g() {
        throw new Error("Not implemented.");
      }
      function b(e) {
        if ("object" != typeof e || null === e) return e;
        var t, i2 = Array.isArray(e) ? [] : {};
        for (t in e) i2[t] = b(e[t]);
        return i2;
      }
      function m(e, t) {
        return function() {
          e.apply(t, arguments);
        };
      }
      function U(e) {
        return "function" == typeof e;
      }
      return w.parse = function(e, t) {
        var i2 = (t = t || {}).dynamicTyping || false;
        U(i2) && (t.dynamicTypingFunction = i2, i2 = {});
        if (t.dynamicTyping = i2, t.transform = !!U(t.transform) && t.transform, !t.worker || !w.WORKERS_SUPPORTED) return i2 = null, w.NODE_STREAM_INPUT, "string" == typeof e ? (e = P(e), i2 = new (t.download ? d : f)(t)) : true === e.readable && U(e.read) && U(e.on) ? i2 = new c(t) : (n.File && e instanceof File || e instanceof Object) && (i2 = new l(t)), i2.stream(e);
        (i2 = (() => {
          var e2;
          return !!w.WORKERS_SUPPORTED && (e2 = (() => {
            var e3 = n.URL || n.webkitURL || null, t2 = r.toString();
            return w.BLOB_URL || (w.BLOB_URL = e3.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", t2, ")();"], { type: "text/javascript" })));
          })(), (e2 = new n.Worker(e2)).onmessage = p, e2.id = h++, o[e2.id] = e2);
        })()).userStep = t.step, i2.userChunk = t.chunk, i2.userComplete = t.complete, i2.userError = t.error, t.step = U(t.step), t.chunk = U(t.chunk), t.complete = U(t.complete), t.error = U(t.error), delete t.worker, i2.postMessage({ input: e, config: t, workerId: i2.id });
      }, w.unparse = function(e, t) {
        var s2 = false, g2 = true, m2 = ",", y = "\r\n", a2 = '"', o2 = a2 + a2, i2 = false, r2 = null, h2 = false, u2 = ((() => {
          if ("object" == typeof t) {
            if ("string" != typeof t.delimiter || w.BAD_DELIMITERS.filter(function(e2) {
              return -1 !== t.delimiter.indexOf(e2);
            }).length || (m2 = t.delimiter), "boolean" != typeof t.quotes && "function" != typeof t.quotes && !Array.isArray(t.quotes) || (s2 = t.quotes), "boolean" != typeof t.skipEmptyLines && "string" != typeof t.skipEmptyLines || (i2 = t.skipEmptyLines), "string" == typeof t.newline && (y = t.newline), "string" == typeof t.quoteChar && (a2 = t.quoteChar, o2 = a2 + a2), "boolean" == typeof t.header && (g2 = t.header), Array.isArray(t.columns)) {
              if (0 === t.columns.length) throw new Error("Option columns is empty");
              r2 = t.columns;
            }
            void 0 !== t.escapeChar && (o2 = t.escapeChar + a2), t.escapeFormulae instanceof RegExp ? h2 = t.escapeFormulae : "boolean" == typeof t.escapeFormulae && t.escapeFormulae && (h2 = /^[=+\-@\t\r].*$/);
          }
        })(), new RegExp(q(a2), "g"));
        "string" == typeof e && (e = JSON.parse(e));
        if (Array.isArray(e)) {
          if (!e.length || Array.isArray(e[0])) return n2(null, e, i2);
          if ("object" == typeof e[0]) return n2(r2 || Object.keys(e[0]), e, i2);
        } else if ("object" == typeof e) return "string" == typeof e.data && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || r2), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : "object" == typeof e.data[0] ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || "object" == typeof e.data[0] || (e.data = [e.data])), n2(e.fields || [], e.data || [], i2);
        throw new Error("Unable to serialize unrecognized input");
        function n2(e2, t2, i3) {
          var r3 = "", n3 = ("string" == typeof e2 && (e2 = JSON.parse(e2)), "string" == typeof t2 && (t2 = JSON.parse(t2)), Array.isArray(e2) && 0 < e2.length), s3 = !Array.isArray(t2[0]);
          if (n3 && g2) {
            for (var a3 = 0; a3 < e2.length; a3++) 0 < a3 && (r3 += m2), r3 += k(e2[a3], a3);
            0 < t2.length && (r3 += y);
          }
          for (var o3 = 0; o3 < t2.length; o3++) {
            var h3 = (n3 ? e2 : t2[o3]).length, u3 = false, d2 = n3 ? 0 === Object.keys(t2[o3]).length : 0 === t2[o3].length;
            if (i3 && !n3 && (u3 = "greedy" === i3 ? "" === t2[o3].join("").trim() : 1 === t2[o3].length && 0 === t2[o3][0].length), "greedy" === i3 && n3) {
              for (var l2 = [], f2 = 0; f2 < h3; f2++) {
                var c2 = s3 ? e2[f2] : f2;
                l2.push(t2[o3][c2]);
              }
              u3 = "" === l2.join("").trim();
            }
            if (!u3) {
              for (var p2 = 0; p2 < h3; p2++) {
                0 < p2 && !d2 && (r3 += m2);
                var _2 = n3 && s3 ? e2[p2] : p2;
                r3 += k(t2[o3][_2], p2);
              }
              o3 < t2.length - 1 && (!i3 || 0 < h3 && !d2) && (r3 += y);
            }
          }
          return r3;
        }
        function k(e2, t2) {
          var i3, r3, n3;
          return null == e2 ? "" : e2.constructor === Date ? isNaN(e2.getTime()) ? "" : e2.toISOString() : (n3 = false, h2 && "string" == typeof e2 && h2.test(e2) && (e2 = "'" + e2, n3 = true), r3 = (i3 = e2.toString()).replace(u2, o2), (n3 = n3 || true === s2 || "function" == typeof s2 && s2(e2, t2) || Array.isArray(s2) && s2[t2] || ((e3, t3) => {
            for (var i4 = 0; i4 < t3.length; i4++) if (-1 < e3.indexOf(t3[i4])) return true;
            return false;
          })(r3, w.BAD_DELIMITERS) || -1 < r3.indexOf(m2) || -1 < i3.indexOf(a2) || " " === r3.charAt(0) || " " === r3.charAt(r3.length - 1)) ? a2 + r3 + a2 : r3);
        }
      }, w.RECORD_SEP = String.fromCharCode(30), w.UNIT_SEP = String.fromCharCode(31), w.BYTE_ORDER_MARK = "\uFEFF", w.BAD_DELIMITERS = ["\r", "\n", '"', w.BYTE_ORDER_MARK], w.WORKERS_SUPPORTED = !s && !!n.Worker, w.NODE_STREAM_INPUT = 1, w.LocalChunkSize = 10485760, w.RemoteChunkSize = 5242880, w.DefaultDelimiter = ",", w.Parser = E, w.ParserHandle = i, w.NetworkStreamer = d, w.FileStreamer = l, w.StringStreamer = f, w.ReadableStreamStreamer = c, a && (n.onmessage = function(e) {
        e = e.data;
        void 0 === w.WORKER_ID && e && (w.WORKER_ID = e.workerId);
        "string" == typeof e.input ? n.postMessage({ workerId: w.WORKER_ID, results: w.parse(e.input, e.config), finished: true }) : (n.File && e.input instanceof File || e.input instanceof Object) && (e = w.parse(e.input, e.config)) && n.postMessage({ workerId: w.WORKER_ID, results: e, finished: true });
      }), (d.prototype = Object.create(u.prototype)).constructor = d, (l.prototype = Object.create(u.prototype)).constructor = l, (f.prototype = Object.create(f.prototype)).constructor = f, (c.prototype = Object.create(u.prototype)).constructor = c, w;
    });
  }
});

// src/ImportWizard.jsx
var import_react = __toESM(require_react());
var import_papaparse = __toESM(require_papaparse_min());
var NAVY = "#1F3864";
var GOLD = "#C99A2E";
var FILIERE_COLORS = ["#6C7DAE", "#F0AC1B", "#3592C4", "#B5651D", "#3E9C6B", "#C9832E", "#8A6BB5", "#4FA07A", "#B3413A", "#7A8A3E", "#2E7D8C", "#A6642E"];
var DEFAULT_FILIERES = ["Coton", "Ma\xEFs", "Riz", "Manioc", "Soja", "Arachide", "Sorgho", "Mil", "Ni\xE9b\xE9", "Igname", "Ananas", "Anacarde", "Palmier \xE0 huile", "Karit\xE9"];
function filiereColor(name) {
  const idx = DEFAULT_FILIERES.indexOf(name);
  return FILIERE_COLORS[(idx >= 0 ? idx : name.length) % FILIERE_COLORS.length];
}
var STEPS = [
  { id: 1, label: "Questionnaire" },
  { id: 2, label: "Base de donn\xE9es" },
  { id: 3, label: "Contexte de l'\xE9tude" },
  { id: 4, label: "Indicateurs" },
  { id: 5, label: "Cartographie des variables" }
];
function Watermark() {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center" }, /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "font-serif font-black whitespace-nowrap select-none",
      style: { color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }
    },
    "AgriHakStat"
  ), /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "absolute bottom-4 right-6 text-xs font-medium select-none",
      style: { color: NAVY, opacity: 0.35 }
    },
    "Con\xE7u par Hakibou MOUSSA"
  ));
}
function Stepper({ current, setCurrent }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center mb-8" }, STEPS.map((s, i) => /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, { key: s.id }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setCurrent(s.id), className: "flex items-center gap-2 group" }, /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      className: "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0",
      style: s.id < current ? { background: "#3E9C6B", color: "white" } : s.id === current ? { background: NAVY, color: "white" } : { background: "#EDEEF3", color: "#8A93A8" }
    },
    s.id < current ? /* @__PURE__ */ import_react.default.createElement(Check, { size: 14 }) : s.id
  ), /* @__PURE__ */ import_react.default.createElement(
    "span",
    {
      className: "text-xs font-medium hidden md:block",
      style: { color: s.id === current ? NAVY : "#8A93A8" }
    },
    s.label
  )), i < STEPS.length - 1 && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 h-[2px] mx-3", style: { background: s.id < current ? "#3E9C6B" : "#E4E6ED" } }))));
}
function Card({ children, className = "" }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}` }, children);
}
function UploadedFile({ icon: Icon, name, meta, tint, fg, onDelete }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-3 rounded-xl p-3 border border-black/5", style: { background: tint } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center shrink-0", style: { background: "white" } }, /* @__PURE__ */ import_react.default.createElement(Icon, { size: 18, style: { color: fg } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium truncate", style: { color: fg } }, name), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] opacity-70", style: { color: fg } }, meta)), /* @__PURE__ */ import_react.default.createElement("button", { onClick: onDelete, type: "button", className: "text-gray-400 hover:text-red-500 transition-colors" }, /* @__PURE__ */ import_react.default.createElement(X, { size: 16 })));
}
function Chip({ label, active, onClick, color }) {
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick,
      className: "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
      style: active ? { background: color || NAVY, borderColor: color || NAVY, color: "white" } : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }
    },
    label
  );
}
function ImportWizard({ active, onNavigate, userEmail, userId, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin, dataset, onDatasetParsed, context, onContextChange }) {
  const [step, setStep] = (0, import_react.useState)(1);
  const [departement, setDepartement] = (0, import_react.useState)(context?.departement || "Borgou");
  const [communes, setCommunes] = (0, import_react.useState)(context?.communes || ["Tchaourou", "P\xE9r\xE8r\xE8"]);
  const [filieres, setFilieres] = (0, import_react.useState)(context?.filieres || ["Coton"]);
  const [customFiliereInput, setCustomFiliereInput] = (0, import_react.useState)("");
  const [availableFilieres, setAvailableFilieres] = (0, import_react.useState)(DEFAULT_FILIERES);
  const [objectif, setObjectif] = (0, import_react.useState)(
    context?.objectif || "Suivre la progression d\xE9cadaire des semis de coton sur les communes \xE0 risque pluviom\xE9trique du Borgou."
  );
  const [periodeDebut, setPeriodeDebut] = (0, import_react.useState)(context?.periodeDebut || "2026-06-10");
  const [periodeFin, setPeriodeFin] = (0, import_react.useState)(context?.periodeFin || "2026-07-20");
  const [uniteAnalyse, setUniteAnalyse] = (0, import_react.useState)(context?.uniteAnalyse || "Exploitation agricole");
  const [indicateurs, setIndicateurs] = (0, import_react.useState)(context?.indicateurs || [
    { id: 1, nom: "Taux de r\xE9alisation des semis", formule: "Superficie r\xE9alis\xE9e / Superficie pr\xE9vue \xD7 100", seuil: "75 %" },
    { id: 2, nom: "Rendement moyen estim\xE9", formule: "Production estim\xE9e / Superficie r\xE9alis\xE9e", seuil: "ND \u2014 \xE0 renseigner" }
  ]);
  const [editingIndicateur, setEditingIndicateur] = (0, import_react.useState)(null);
  const [questionnaire, setQuestionnaire] = (0, import_react.useState)(null);
  const [submitting, setSubmitting] = (0, import_react.useState)(false);
  const [submitted, setSubmitted] = (0, import_react.useState)(false);
  const [submitError, setSubmitError] = (0, import_react.useState)("");
  const [parsing, setParsing] = (0, import_react.useState)(false);
  const [parseProgress, setParseProgress] = (0, import_react.useState)(0);
  const [parsePhase, setParsePhase] = (0, import_react.useState)("");
  const [fileError, setFileError] = (0, import_react.useState)("");
  const [fileWarnings, setFileWarnings] = (0, import_react.useState)([]);
  const workerRef = (0, import_react.useRef)(null);
  const parseIdRef = (0, import_react.useRef)(0);
  (0, import_react.useEffect)(() => {
    if (onContextChange) {
      onContextChange({ departement, communes, filieres, objectif, periodeDebut, periodeFin, uniteAnalyse, indicateurs });
    }
  }, [departement, communes, filieres, objectif, periodeDebut, periodeFin, uniteAnalyse, indicateurs]);
  const communesDuDepartement = BENIN_DEPARTEMENTS.find((d) => d.departement === departement)?.communes || [];
  const handleQuestionnaireUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuestionnaire({ name: file.name, size: (file.size / 1024).toFixed(0) + " Ko" });
  };
  const addCustomFiliere = () => {
    const label = customFiliereInput.trim();
    if (!label) return;
    if (!availableFilieres.includes(label)) setAvailableFilieres([...availableFilieres, label]);
    if (!filieres.includes(label)) setFilieres([...filieres, label]);
    setCustomFiliereInput("");
  };
  const saveIndicateur = () => {
    if (!editingIndicateur?.nom?.trim()) return;
    if (editingIndicateur.id) {
      setIndicateurs(indicateurs.map((k) => k.id === editingIndicateur.id ? editingIndicateur : k));
    } else {
      setIndicateurs([...indicateurs, { ...editingIndicateur, id: Date.now() }]);
    }
    setEditingIndicateur(null);
  };
  const isEmptyRow = (row) => Object.values(row).every((v) => v === "" || v === null || v === void 0);
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");
    setFileWarnings([]);
    setParsing(true);
    setParseProgress(0);
    setParsePhase("lecture");
    const extension = file.name.split(".").pop().toLowerCase();
    const finish = (parsedRows, warnings = [], precomputedColumns = null) => {
      setParsing(false);
      setParsePhase("");
      if (!parsedRows || !parsedRows.length) {
        setFileError("Le fichier semble vide ou n'a pas pu \xEAtre lu. V\xE9rifiez qu'il contient une ligne d'en-t\xEAtes et au moins une ligne de donn\xE9es.");
        return;
      }
      const columns = precomputedColumns || buildColumnsMeta(parsedRows);
      setFileWarnings(warnings);
      onDatasetParsed({ rows: parsedRows, columns, fileName: file.name });
    };
    if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onprogress = (ev) => {
        if (ev.lengthComputable) setParseProgress(Math.min(35, Math.round(ev.loaded / ev.total * 35)));
      };
      reader.onload = (ev) => {
        try {
          if (!workerRef.current) workerRef.current = new Worker("/importWorker.js");
        } catch (err) {
          try {
            const wb = readSync(ev.target.result, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = utils.sheet_to_json(sheet, { defval: "" });
            finish(rows);
          } catch (err2) {
            setParsing(false);
            setFileError("Erreur de lecture du fichier Excel : " + err2.message);
          }
          return;
        }
        const worker = workerRef.current;
        const id = ++parseIdRef.current;
        const handleMessage = (msgEvent) => {
          const msg = msgEvent.data;
          if (msg.id !== id) return;
          if (msg.type === "progress") {
            setParsePhase(msg.phase);
            setParseProgress(msg.pct);
          } else if (msg.type === "done") {
            worker.removeEventListener("message", handleMessage);
            setParseProgress(100);
            finish(msg.rows, msg.warnings, msg.columns);
          } else if (msg.type === "error") {
            worker.removeEventListener("message", handleMessage);
            setParsing(false);
            setFileError("Erreur de lecture du fichier Excel : " + msg.message);
          }
        };
        worker.addEventListener("message", handleMessage);
        worker.postMessage({ id, fileName: file.name, buffer: ev.target.result }, [ev.target.result]);
      };
      reader.onerror = () => {
        setParsing(false);
        setFileError("Erreur de lecture du fichier.");
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === "csv") {
      import_papaparse.default.parse(file, {
        preview: 1,
        skipEmptyLines: "greedy",
        complete: (headerPreview) => {
          const rawHeader = headerPreview.data && headerPreview.data[0] || [];
          const headerCounts = {};
          rawHeader.forEach((h) => {
            const key = String(h ?? "").trim().toLowerCase();
            if (key) headerCounts[key] = (headerCounts[key] || 0) + 1;
          });
          const dupHeaders = Object.entries(headerCounts).filter(([, n]) => n > 1).map(([k]) => k);
          const rows = [];
          import_papaparse.default.parse(file, {
            header: true,
            skipEmptyLines: "greedy",
            worker: true,
            step: (results) => {
              rows.push(results.data);
              if (file.size > 0) setParseProgress(Math.min(99, Math.round(results.meta.cursor / file.size * 100)));
            },
            complete: (results) => {
              const errors = results?.errors || [];
              const warnings = [];
              if (dupHeaders.length > 0) {
                warnings.push(`En-t\xEAte(s) en double d\xE9tect\xE9(s) dans le fichier source (${dupHeaders.join(", ")}) \u2014 les colonnes concern\xE9es ont \xE9t\xE9 automatiquement renomm\xE9es (ex. \xAB ${dupHeaders[0]}_1 \xBB) pour \xE9viter toute perte de donn\xE9es ; v\xE9rifiez qu'il s'agit bien de colonnes distinctes.`);
              }
              const emptyCount = rows.filter(isEmptyRow).length;
              const cleanRows = rows.filter((r) => !isEmptyRow(r));
              if (emptyCount > 0) warnings.push(`${emptyCount} ligne(s) enti\xE8rement vide(s) d\xE9tect\xE9e(s) et exclue(s) de l'analyse.`);
              if (errors.length > 0) {
                const distinctCodes = [...new Set(errors.map((er) => er.code))];
                warnings.push(`${errors.length} anomalie(s) de format d\xE9tect\xE9e(s) pendant la lecture (${distinctCodes.join(", ")}) \u2014 certaines lignes peuvent \xEAtre d\xE9cal\xE9es.`);
              }
              setParseProgress(100);
              finish(cleanRows, warnings);
            },
            error: (err) => {
              setParsing(false);
              setFileError("Erreur de lecture du fichier CSV : " + err.message);
            }
          });
        },
        error: (err) => {
          setParsing(false);
          setFileError("Erreur de lecture du fichier CSV : " + err.message);
        }
      });
    } else {
      setParsing(false);
      setFileError("Format non reconnu \u2014 utilisez un fichier .csv, .xlsx ou .xls.");
    }
  };
  (0, import_react.useEffect)(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);
  const toggle = (list, setList, item) => setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans" }, /* @__PURE__ */ import_react.default.createElement(Watermark, null), /* @__PURE__ */ import_react.default.createElement("div", { className: "relative z-10 flex" }, /* @__PURE__ */ import_react.default.createElement(Sidebar, { active, onNavigate }), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1 min-h-screen" }, /* @__PURE__ */ import_react.default.createElement(
    "header",
    {
      className: "bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between",
      style: { borderBottom: `2px solid ${GOLD}` }
    },
    /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("h1", { className: "font-serif text-xl font-bold", style: { color: NAVY } }, "Nouvelle enqu\xEAte"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-500 mt-0.5" }, "Assistant d'import \u2014 questionnaire, base et contexte d'\xE9tude")),
    /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ import_react.default.createElement(Bell, { size: 18, className: "text-gray-400" }), /* @__PURE__ */ import_react.default.createElement(
      UserMenu,
      {
        email: userEmail,
        roleLabel,
        isAdmin,
        isGuest,
        onLogout,
        onOpenAdmin
      }
    ))
  ), /* @__PURE__ */ import_react.default.createElement("main", { className: "p-8 max-w-4xl" }, /* @__PURE__ */ import_react.default.createElement(Stepper, { current: step, setCurrent: setStep }), step === 1 && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Importer le questionnaire"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, "Formats accept\xE9s : Excel (.xlsx), CSV, ou tout export XLSForm/KoboToolbox/Akvo Flow/ODK."), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors hover:bg-[#FAFBFE]", style: { borderColor: "#C7D2E8" } }, /* @__PURE__ */ import_react.default.createElement("input", { type: "file", accept: ".xlsx,.xls,.csv,.pdf,.docx", className: "hidden", onChange: handleQuestionnaireUpload }), /* @__PURE__ */ import_react.default.createElement("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center mb-1", style: { background: "#EBEEF7" } }, /* @__PURE__ */ import_react.default.createElement(Upload, { size: 20, style: { color: NAVY } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-medium text-sm", style: { color: NAVY } }, "Glisser-d\xE9poser un fichier"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "ou cliquer pour parcourir"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-1.5 justify-center mt-2" }, ["XLSForm", "ODK", ".xlsx"].map((f) => /* @__PURE__ */ import_react.default.createElement("span", { key: f, className: "text-[10px] px-2 py-1 rounded-full bg-[#F6E9DD] text-[#8A4A1D] font-medium" }, f)))), /* @__PURE__ */ import_react.default.createElement("div", { className: "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-[#FAFBFE]", style: { borderColor: "#C7D2E8" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center mb-1", style: { background: "#E4F5EC" } }, /* @__PURE__ */ import_react.default.createElement(Link2, { size: 20, style: { color: "#256B45" } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-medium text-sm", style: { color: NAVY } }, "Connecter Akvo Flow / KoboToolbox"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Import direct via API (\xE0 venir)"))), questionnaire ? /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-5" }, /* @__PURE__ */ import_react.default.createElement(
    UploadedFile,
    {
      icon: FileSpreadsheet,
      name: questionnaire.name,
      meta: questionnaire.size,
      tint: "#EBEEF7",
      fg: NAVY,
      onDelete: () => setQuestionnaire(null)
    }
  )) : /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-5 rounded-xl p-3 border border-black/5 bg-gray-50 text-xs text-gray-500" }, "Aucun questionnaire import\xE9 pour l'instant.")), step === 2 && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Importer la base de donn\xE9es"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, "Fichier Excel (.xlsx) ou CSV r\xE9el \u2014 les colonnes et leur type sont d\xE9tect\xE9s automatiquement."), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-[#FAFBFE]", style: { borderColor: "#C7D2E8" } }, /* @__PURE__ */ import_react.default.createElement("input", { type: "file", accept: ".csv,.xlsx,.xls", className: "hidden", onChange: handleFileUpload }), /* @__PURE__ */ import_react.default.createElement("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center mb-1", style: { background: "#EBEEF7" } }, /* @__PURE__ */ import_react.default.createElement(Upload, { size: 20, style: { color: NAVY } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-medium text-sm", style: { color: NAVY } }, parsing ? "Analyse en cours\u2026" : "Glisser-d\xE9poser un fichier"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "ou cliquer pour parcourir"), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[10px] px-2 py-1 rounded-full bg-[#F6E9DD] text-[#8A4A1D] font-medium mt-2" }, ".xlsx, .xls ou .csv")), /* @__PURE__ */ import_react.default.createElement("div", { className: "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-[#FAFBFE]", style: { borderColor: "#C7D2E8" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center mb-1", style: { background: "#E4F5EC" } }, /* @__PURE__ */ import_react.default.createElement(Link2, { size: 20, style: { color: "#256B45" } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "font-medium text-sm", style: { color: NAVY } }, "Connecter Akvo Flow / KoboToolbox"), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400" }, "Synchronisation automatique (\xE0 venir)"))), parsing && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between text-[11px] text-gray-500 mb-1" }, /* @__PURE__ */ import_react.default.createElement("span", null, parsePhase === "lecture" && "Lecture du fichier\u2026", parsePhase === "analyse" && "Analyse des feuilles et des lignes\u2026", parsePhase === "typage" && "D\xE9tection des types de colonnes\u2026", !parsePhase && "Analyse en cours\u2026", " ", "\u2014 ex\xE9cut\xE9e en arri\xE8re-plan, l'interface reste utilisable."), /* @__PURE__ */ import_react.default.createElement("span", { className: "font-medium", style: { color: NAVY } }, parseProgress, "%")), /* @__PURE__ */ import_react.default.createElement("div", { className: "w-full h-1.5 rounded-full bg-gray-100 overflow-hidden" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "h-full rounded-full transition-all", style: { width: `${parseProgress}%`, background: NAVY } }))), fileError && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 rounded-xl p-3 text-xs", style: { background: "#FBE7E5", color: "#B3413A" } }, fileError), fileWarnings.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-4 rounded-xl p-3 text-xs space-y-1", style: { background: "#FDF1DA", color: "#8A5A00" } }, fileWarnings.map((w, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, className: "flex items-start gap-1.5" }, /* @__PURE__ */ import_react.default.createElement(CircleAlert, { size: 13, className: "mt-0.5 shrink-0" }), /* @__PURE__ */ import_react.default.createElement("span", null, w)))), dataset && /* @__PURE__ */ import_react.default.createElement("div", { className: "mt-5 space-y-3" }, /* @__PURE__ */ import_react.default.createElement(
    UploadedFile,
    {
      icon: FileCheckCorner,
      name: dataset.fileName,
      meta: `${dataset.rows.length.toLocaleString("fr-FR")} enregistrements \xB7 ${dataset.columns.length} colonnes \u2014 analys\xE9es r\xE9ellement`,
      tint: "#E4F5EC",
      fg: "#256B45",
      onDelete: () => onDatasetParsed(null)
    }
  ), dataset.columns.some((c) => c.isGeo) ? /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-start gap-2 rounded-xl p-3 border border-black/5", style: { background: "#FDF1DA" } }, /* @__PURE__ */ import_react.default.createElement(MapPin, { size: 16, style: { color: "#8A5A00" }, className: "mt-0.5" }), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs", style: { color: "#8A5A00" } }, /* @__PURE__ */ import_react.default.createElement("span", { className: "font-medium" }, dataset.columns.filter((c) => c.isGeo).length, " colonne(s) de g\xE9olocalisation d\xE9tect\xE9e(s)"), " ", "(", dataset.columns.filter((c) => c.isGeo).map((c) => c.name).join(", "), ")")) : /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl p-3 border border-black/5 bg-gray-50 text-xs text-gray-500" }, "Aucune colonne de g\xE9olocalisation d\xE9tect\xE9e dans ce fichier."))), step === 3 && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Contexte de l'\xE9tude"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, "Ces informations cadrent l'interpr\xE9tation narrative du rapport final."), /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Objectif de l'\xE9tude"), /* @__PURE__ */ import_react.default.createElement(
    "textarea",
    {
      className: "w-full text-sm rounded-xl border border-gray-200 p-3 mb-5 resize-none focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD },
      rows: 2,
      value: objectif,
      onChange: (e) => setObjectif(e.target.value)
    }
  ), /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Zone g\xE9ographique"), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-3 mb-3" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-[11px] text-gray-500 block mb-1" }, "D\xE9partement"), /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: departement,
      onChange: (e) => {
        setDepartement(e.target.value);
        setCommunes([]);
      },
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2 bg-white",
      style: { "--tw-ring-color": GOLD }
    },
    BENIN_DEPARTEMENTS.map((d) => /* @__PURE__ */ import_react.default.createElement("option", { key: d.departement, value: d.departement }, d.departement))
  )), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-end" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] text-gray-400" }, communes.length, " commune", communes.length > 1 ? "s" : "", " s\xE9lectionn\xE9e", communes.length > 1 ? "s" : "", " au total"))), /* @__PURE__ */ import_react.default.createElement("label", { className: "text-[11px] text-gray-500 block mb-1" }, "Communes de ", departement), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-2 mb-2" }, communesDuDepartement.map((c) => /* @__PURE__ */ import_react.default.createElement(Chip, { key: c, label: c, active: communes.includes(c), onClick: () => toggle(communes, setCommunes, c) }))), communes.length > 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-1.5 mb-5 pt-2 border-t border-gray-100" }, communes.map((c) => /* @__PURE__ */ import_react.default.createElement("span", { key: c, className: "text-[11px] px-2 py-1 rounded-full flex items-center gap-1", style: { background: "#EBEEF7", color: NAVY } }, c, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => toggle(communes, setCommunes, c), className: "hover:text-red-500" }, /* @__PURE__ */ import_react.default.createElement(X, { size: 11 }))))), /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Fili\xE8re(s) concern\xE9e(s)"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex flex-wrap gap-2 mb-3" }, availableFilieres.map((f) => /* @__PURE__ */ import_react.default.createElement(Chip, { key: f, label: f, active: filieres.includes(f), onClick: () => toggle(filieres, setFilieres, f), color: filiereColor(f) }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 mb-5" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "text",
      value: customFiliereInput,
      onChange: (e) => setCustomFiliereInput(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addCustomFiliere();
        }
      },
      placeholder: "Ajouter une autre fili\xE8re\u2026",
      className: "flex-1 text-sm rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement("button", { onClick: addCustomFiliere, type: "button", className: "px-3 py-2 rounded-xl text-xs font-medium text-white", style: { background: NAVY } }, /* @__PURE__ */ import_react.default.createElement(Plus, { size: 13 }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "P\xE9riode de r\xE9f\xE9rence"), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: periodeDebut,
      onChange: (e) => setPeriodeDebut(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-gray-400 text-xs" }, "\u2192"), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "date",
      value: periodeFin,
      onChange: (e) => setPeriodeFin(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("label", { className: "text-xs font-medium text-gray-600 block mb-1.5" }, "Unit\xE9 d'analyse"), /* @__PURE__ */ import_react.default.createElement(
    "select",
    {
      value: uniteAnalyse,
      onChange: (e) => setUniteAnalyse(e.target.value),
      className: "w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    },
    /* @__PURE__ */ import_react.default.createElement("option", null, "Exploitation agricole"),
    /* @__PURE__ */ import_react.default.createElement("option", null, "M\xE9nage"),
    /* @__PURE__ */ import_react.default.createElement("option", null, "Parcelle"),
    /* @__PURE__ */ import_react.default.createElement("option", null, "Commune")
  )))), step === 4 && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mb-1" }, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold", style: { color: NAVY } }, "Indicateurs de performance"), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => setEditingIndicateur({ id: null, nom: "", formule: "", seuil: "" }),
      className: "text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white",
      style: { background: NAVY }
    },
    /* @__PURE__ */ import_react.default.createElement(Plus, { size: 14 }),
    " Ajouter un indicateur"
  )), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, "Ces indicateurs seront mis en regard des analyses bivari\xE9es et de l'enrichissement climatique (Module 7)."), editingIndicateur && /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl border-2 p-3 mb-3", style: { borderColor: GOLD, background: "#FFFDF7" } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "grid grid-cols-2 gap-2 mb-2" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      placeholder: "Nom de l'indicateur",
      value: editingIndicateur.nom,
      onChange: (e) => setEditingIndicateur({ ...editingIndicateur, nom: e.target.value }),
      className: "text-sm rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      placeholder: "Seuil de r\xE9f\xE9rence (ex. 75 %)",
      value: editingIndicateur.seuil,
      onChange: (e) => setEditingIndicateur({ ...editingIndicateur, seuil: e.target.value }),
      className: "text-sm rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  )), /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      placeholder: "Formule de calcul",
      value: editingIndicateur.formule,
      onChange: (e) => setEditingIndicateur({ ...editingIndicateur, formule: e.target.value }),
      className: "w-full text-sm rounded-lg border border-gray-200 p-2 mb-2 focus:outline-none focus:ring-2",
      style: { "--tw-ring-color": GOLD }
    }
  ), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: saveIndicateur, className: "px-3 py-1.5 rounded-lg text-xs font-medium text-white", style: { background: "#256B45" } }, /* @__PURE__ */ import_react.default.createElement(Check, { size: 12, className: "inline mr-1 -mt-0.5" }), " Enregistrer"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setEditingIndicateur(null), className: "px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600" }, "Annuler"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "space-y-3" }, indicateurs.map((kpi) => /* @__PURE__ */ import_react.default.createElement("div", { key: kpi.id, className: "flex items-center gap-3 rounded-xl border border-gray-100 p-3" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0", style: { background: "#EBEEF7" } }, /* @__PURE__ */ import_react.default.createElement(ChartColumn, { size: 15, style: { color: NAVY } })), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "text-sm font-medium text-gray-800" }, kpi.nom), /* @__PURE__ */ import_react.default.createElement("div", { className: "text-[11px] text-gray-400" }, kpi.formule)), /* @__PURE__ */ import_react.default.createElement("span", { className: "text-[11px] font-medium px-2 py-1 rounded-full", style: { background: "#FDF1DA", color: "#8A5A00" } }, "Seuil : ", kpi.seuil || "ND"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setEditingIndicateur(kpi), className: "text-gray-300 hover:text-blue-500" }, /* @__PURE__ */ import_react.default.createElement(Pencil, { size: 14 })), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setIndicateurs(indicateurs.filter((k) => k.id !== kpi.id)), className: "text-gray-300 hover:text-red-400" }, /* @__PURE__ */ import_react.default.createElement(Trash2, { size: 15 })))), indicateurs.length === 0 && /* @__PURE__ */ import_react.default.createElement("div", { className: "text-xs text-gray-400 italic text-center py-4" }, "Aucun indicateur d\xE9fini \u2014 cliquez sur \xAB Ajouter un indicateur \xBB."))), step === 5 && /* @__PURE__ */ import_react.default.createElement(Card, null, /* @__PURE__ */ import_react.default.createElement("h2", { className: "font-serif font-semibold mb-1", style: { color: NAVY } }, "Cartographie automatique des variables"), /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs text-gray-400 mb-5" }, dataset ? `Types d\xE9tect\xE9s r\xE9ellement \xE0 partir de ${dataset.fileName} (${dataset.rows.length} lignes).` : "Aucun fichier import\xE9 \xE0 l'\xE9tape 2 \u2014 exemple illustratif ci-dessous."), /* @__PURE__ */ import_react.default.createElement("div", { className: "rounded-xl overflow-hidden border border-gray-100" }, /* @__PURE__ */ import_react.default.createElement("table", { className: "w-full text-sm" }, /* @__PURE__ */ import_react.default.createElement("thead", null, /* @__PURE__ */ import_react.default.createElement("tr", { className: "text-left text-[11px] text-gray-400 uppercase bg-gray-50" }, /* @__PURE__ */ import_react.default.createElement("th", { className: "px-4 py-2.5 font-medium" }, "Colonne de la base"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-4 py-2.5 font-medium" }, "Type d\xE9tect\xE9"), /* @__PURE__ */ import_react.default.createElement("th", { className: "px-4 py-2.5 font-medium" }, "Statut"))), /* @__PURE__ */ import_react.default.createElement("tbody", null, (dataset ? dataset.columns.map((c) => ({
    q: c.name,
    type: c.type,
    status: c.isGeo ? "geo" : c.type === "Texte libre" ? "warn" : "ok"
  })) : [
    { q: "sup_semee_ha", type: "Quantitative continue", status: "ok" },
    { q: "filiere", type: "Nominale", status: "ok" },
    { q: "commune", type: "Nominale", status: "ok" },
    { q: "geo_lat / geo_lon", type: "G\xE9olocalisation", status: "geo" },
    { q: "satisf_intrants", type: "Ordinale", status: "warn" }
  ]).map((r) => /* @__PURE__ */ import_react.default.createElement("tr", { key: r.q, className: "border-t border-gray-50" }, /* @__PURE__ */ import_react.default.createElement("td", { className: "px-4 py-3 text-gray-800 font-mono text-xs" }, r.q), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-4 py-3 text-gray-500" }, r.type), /* @__PURE__ */ import_react.default.createElement("td", { className: "px-4 py-3" }, r.status === "ok" && /* @__PURE__ */ import_react.default.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full", style: { background: "#E4F5EC", color: "#256B45" } }, /* @__PURE__ */ import_react.default.createElement(Check, { size: 11 }), " Confirm\xE9"), r.status === "geo" && /* @__PURE__ */ import_react.default.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full", style: { background: "#EBEEF7", color: NAVY } }, /* @__PURE__ */ import_react.default.createElement(MapPin, { size: 11 }), " G\xE9o d\xE9tect\xE9e"), r.status === "warn" && /* @__PURE__ */ import_react.default.createElement("span", { className: "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full", style: { background: "#FDF1DA", color: "#8A5A00" } }, /* @__PURE__ */ import_react.default.createElement(CircleAlert, { size: 11 }), " \xC0 v\xE9rifier")))))))), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center justify-between mt-6" }, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => setStep(Math.max(1, step - 1)),
      disabled: step === 1,
      className: "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 disabled:opacity-0 bg-white border border-gray-200 text-gray-600"
    },
    /* @__PURE__ */ import_react.default.createElement(ChevronLeft, { size: 15 }),
    " Pr\xE9c\xE9dent"
  ), step < 5 ? /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: () => setStep(step + 1),
      className: "px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 text-white shadow-md",
      style: { background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }
    },
    "Suivant ",
    /* @__PURE__ */ import_react.default.createElement(ChevronRight, { size: 15 })
  ) : submitted ? /* @__PURE__ */ import_react.default.createElement("div", { className: "flex items-center gap-2 text-sm font-medium", style: { color: "#256B45" } }, /* @__PURE__ */ import_react.default.createElement(Check, { size: 16 }), " Projet soumis \u2014 visible dans le tableau de bord administrateur") : /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: async () => {
        if (isGuest || !isSupabaseConfigured) {
          setSubmitError("Cr\xE9ez un compte pour soumettre un projet r\xE9el (mode d\xE9monstration : rien n'est enregistr\xE9).");
          return;
        }
        setSubmitting(true);
        setSubmitError("");
        const { error } = await supabase.from("projets").insert({
          user_id: userId,
          user_email: userEmail,
          titre: objectif,
          thematiques: filieres,
          communes,
          statut: "soumis",
          periode_debut: periodeDebut || null,
          periode_fin: periodeFin || null,
          unite_analyse: uniteAnalyse,
          indicateurs
        });
        setSubmitting(false);
        if (error) setSubmitError(error.message);
        else setSubmitted(true);
      },
      disabled: submitting,
      className: "px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 text-white shadow-md disabled:opacity-60",
      style: { background: `linear-gradient(135deg, #3E9C6B, #256B45)` }
    },
    /* @__PURE__ */ import_react.default.createElement(Check, { size: 15 }),
    " ",
    submitting ? "Envoi en cours\u2026" : "Lancer les analyses"
  )), submitError && /* @__PURE__ */ import_react.default.createElement("p", { className: "text-xs mt-3 text-right", style: { color: "#B3413A" } }, submitError)))));
}
export {
  ImportWizard as default
};
/*! Bundled license information:

papaparse/papaparse.min.js:
  (* @license
  Papa Parse
  v5.6.0
  https://github.com/mholt/PapaParse
  License: MIT
  *)
*/
