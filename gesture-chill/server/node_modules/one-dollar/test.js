'use strict'

const assert = require('assert')
const OneDollar = require('./')

;(function verboseAPI_caret_near () {
  const recognizer = new OneDollar.DollarRecognizer()
  const result = recognizer.Recognize([
    new OneDollar.Point(1, 2),
    new OneDollar.Point(10, 3),
    new OneDollar.Point(12, 27),
    new OneDollar.Point(3, 25),
    new OneDollar.Point(0, 0)
  ])

  assert.equal(result.Name, 'caret')
  assert.ok(result.Score < 1 && result.Score > 0.75)
})()

;(function verboseAPI_caret_exact () {
  const recognizer = new OneDollar.DollarRecognizer()
  const result = recognizer.Recognize([
    new OneDollar.Point(0, 0),
    new OneDollar.Point(10, 0),
    new OneDollar.Point(10, 10),
    new OneDollar.Point(0, 10),
    new OneDollar.Point(0, 0)
  ])

  assert.equal(result.Name, 'caret')
  assert.ok(result.Score < 1 && result.Score > 0.75)
})()

;(function verboseAPI_noMatch () {
  const recognizer = new OneDollar.DollarRecognizer()
  const result = recognizer.Recognize([
    new OneDollar.Point(0, 0),
    new OneDollar.Point(20, 0)
  ])

  assert.deepEqual(result, { Name: 'No match.', Score: 0 })
})()

;(function shortAPI_caret () {
  const result = OneDollar()([[1, 2], [10, 3], [12, 27], [3, 25], [0, 0]])

  assert.equal(result.name, 'caret')
  assert.ok(result.score < 1 && result.score > 0.75)
})()

;(function shortAPI_noMatch () {
  const result = OneDollar()([[0, 0], [20,0]])

  assert.deepEqual(result, { name: 'nomatch', score: 0 })
})()
