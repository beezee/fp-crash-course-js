const Do = require('do-notation');

const monad = (
  chain, // Chain m => m a -> (a -> m b) -> m b
  ap, // Apply f => f a -> f (a -> b) -> f b
  value
) => {
  const res = {
    of: (value) => monad(chain, ap, value),
    value
  };
  res.chain = chain(res);
  res.ap = ap(res);
  res.map = (ab) => ap(res)(res.of(ab));
  return res;
};

const ID = monad(
 (ma) => (amb) => amb(ma.value),
 (fa) => (fab) => fab.value(fa.value));

const Maybe = monad(
  (ma) => (amb) => ma.value ? amb(ma.value) : ma,
  (fa) => (fab) => (fab.value && fa.value) ?
    fab.value(fa.value) : fa);

const Either = (() => {
  const mkEither = (value) => {
    const Either = monad(
      (ma) => (amb) => ma.value.left ?
        ma : amb(ma.value.right),
      (fa) => (fab) => (fab.value.left || fa.value.left)
        ? fa : fab.value.right(fa.value.right),
      value);
    Either.of = (value) => mkEither({left: null, right: value});
    Either.left = (value) => mkEither({left: value, right: null});
    Either.map = (fn) => Either.ap(Either.of(fn));
    return Either;
  };
  return mkEither();
})();

ID.of("hello").ap(ID.of(console.log));
ID.of("hello").map(console.log);

Maybe.of("Just").ap(Maybe.of(console.log));
Maybe.of("Just").map(console.log);

Maybe.of(null).ap(Maybe.of(console.log));
Maybe.of(null).map(console.log);

Either.of("Right").ap(Either.of(console.log));
Either.of("Right").map(console.log);

Either.left("Left").ap(Either.of(console.log));
Either.left("Left").map(console.log);

const greet = (point) =>
  Do(function*() {
    let greet = yield point("hello");
    let name = yield point("world");
    return point([greet, name]);
  });

greet(ID.of).map(console.log);
greet(Maybe.of).map(console.log);
greet((x) => Maybe.of(null)).map(console.log);
console.log(greet((x) => Maybe.of(null)).value);
greet(Either.of).map(console.log);
greet(Either.left).map(console.log);
console.log(greet(Either.left).value);
