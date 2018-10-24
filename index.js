const Do = require('do-notation');

const monad = (
  chain, // Chain m => m a -> (a -> m b) -> m b
  ap, // ap :: Apply f => f a -> f (a -> b) -> f b
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

let ID = monad(
 (ma) => (amb) => amb(ma.value),
 (fa) => (fab) => fab(fa));

// ID.ap("hello")(ID.of(console.log));
// ID.map("hello")(console.log);

Do(function*() {
  let greet = yield ID.of("hello");
  let name = yield ID.of("world");
  console.log(greet, name);
});
