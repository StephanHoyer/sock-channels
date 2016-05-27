// usage
// makeSpy = spyThen(done)
// spyA = makeSpy('foo')
// spyB = makeSpy('bar')
//
// spyB('foo') // -> nothing happens
// spyB('foo') // -> done will be called

function identity (thing) {
  return thing
}

module.exports = function spyThen (then, options) {
  options = options || {}
  var called = []
  function checkDone () {
    if (called.every(identity)) {
      then()
    }
  }
  return function () {
    var pos = called.length
    called.push(false)
    var expectedArgs = Array.from(arguments)
    return function () {
      if (!options.allowMultipleCalls && called[pos]) {
        throw new Error('spy called twice')
      }
      if (expectedArgs.length > 0 || arguments > 0) {
        options.argCheck(Array.from(arguments), expectedArgs)
      }
      called[pos] = true
      checkDone()
    }
  }
}
