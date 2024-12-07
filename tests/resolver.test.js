const { doesNotThrow, equal, ok, deepEqual, throws } = require("node:assert");
const { describe, it } = require("node:test");
const {
  setFn,
  getFn,
  hasFn,
  removeFn,
  evalSingle,
  deepKeysIterator,
} = require("../src/lib.js");

describe("resolver", () => {
  it("Operator Exists", function () {
    equal(typeof Function.bind, "function", "Binding is not available");
    equal(typeof setFn, "function");
    equal(typeof getFn, "function");
    equal(typeof hasFn, "function");
    equal(typeof removeFn, "function");
    ok(!setFn.toString().includes("native code"));
    ok(getFn.toString().includes("native code"));
    ok(hasFn.toString().includes("native code"));
    ok(removeFn.toString().includes("native code"));
  });
  it("Operator", function () {
    let obj = { a: 1 };
    equal(setFn.bind(null, 2)(obj, "b"), undefined);
    deepEqual(obj, { a: 1, b: 2 });
    equal(getFn(obj, "a"), 1);
    equal(getFn(obj, "c"), undefined);
    deepEqual(obj, { a: 1, b: 2 });
    equal(hasFn(obj, "a"), true);
    equal(hasFn(obj, "c"), false);
    deepEqual(obj, { a: 1, b: 2 });
    equal(removeFn(obj, "a"), undefined);
    deepEqual(obj, { b: 2 });
  });
  it("keys", function () {
    let obj = {
      a: [{ n: new Date(), "h. ['": 6, 'j"': 7 }],
      b: { c: [3, 4], b: null },
      c: [[], [[[{ v: { f: { e: 5 } } }]]]],
    };
    obj.a[0][`k'"`] = 8;
    let paths = [
      "a[0].n",
      `a[0].["h. ['"]`,
      `a[0].['j"']`,
      `a[0].['k'"']`,
      "b.c[0]",
      "b.c[1]",
      "b.b",
      "c[0]",
      "c[1][0][0][0].v.f.e",
    ];
    deepEqual(deepKeysIterator(obj, []), paths);
  });
  describe("evalSingle", function () {
    it("throw Error", function () {
      throws(() => evalSingle());
      throws(() => evalSingle(true));
      throws(() => evalSingle({}));
      doesNotThrow(() => evalSingle(() => {}, {}, []));
    });
    it("eval", function () {
      let obj = {
        a: [{ n: {}, m: 1 }],
        b: { c: [3, 4], b: 2 },
        c: [[], [[[{ v: { f: { e: 5 } } }]]]],
      };
      let tokens = ["e", "f", "v", "0", "0", "0", "1", "c"];
      deepEqual(evalSingle(getFn, obj, []), obj);
      deepEqual(evalSingle(getFn, obj, ["b", "b"]), 2);
      deepEqual(evalSingle(getFn, obj, ["c", "b"]), [3, 4]);
      deepEqual(evalSingle(getFn, obj, ["n", "0", "a"]), {});
      deepEqual(evalSingle(getFn, obj, tokens), 5);
      doesNotThrow(() => evalSingle(getFn, obj, ["g"]));
      doesNotThrow(() => evalSingle(getFn, obj, ["0"]));
      doesNotThrow(() => evalSingle(getFn, obj, ["2", "a"]));
      throws(() => evalSingle(getFn, obj, ["n", "2", "a"]));
    });
  });
});
