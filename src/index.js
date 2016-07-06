let xs = require('xstream').default
let {loadCSS} = require('fg-loadcss')
let xsSA = require('@cycle/xstream-adapter').default

function createResponse$(url) {
  return xs.create({
    start: listener => {
      if (typeof url !== `string`) {
        listener.error(new Error(`Observable of requests given to CSS ` +
          `Driver must emit URL strings.`))
      }
      try {
        const cssLoad = loadCSS(url)      
        cssLoad.onloadcssdefined( (out) => {
          listener.next(url)
          listener.complete()
        })
      } catch (err) {
        listener.error(err)
      }
    },
    stop: () => {},
  })
}

function makeCssDriver() {
  function cssDriver(request$) {
    return request$.map(url => {
      let response$ = createResponse$(url)
      response$.request = url
      return response$
    })
  }
  cssDriver.streamAdapter = xsSA
  return cssDriver
}

module.exports = {
  /**
   * CSS Driver factory.
   *
   * This is a function which, when called, returns a CSS Driver for Cycle.js
   * apps. The driver is also a function, and it takes a stream of requests
   * (URL strings) as input, and generates a metastream of responses.
   *
   * **Requests**. The stream of requests should emit strings as the URL of the
   * remote resource over HTTP.
   *
   * **Responses**. A metastream is a stream of streams. The response metastream
   * emits streams of url's requested.
   *
   * @return {Function} the CSS Driver function
   * @function makeCssDriver
   */
  makeCssDriver,
}