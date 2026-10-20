// Build-time only: preserve licensed font/logo bytes in every server runtime.
module.exports = function(source) {
  return 'export default ' + JSON.stringify('data:application/octet-stream;base64,' + source.toString('base64')) + ';'
}
module.exports.raw = true
