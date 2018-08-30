"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = controller;

var _react = _interopRequireDefault(require("./generators/components/react"));

var _markdown = _interopRequireDefault(require("./generators/pages/markdown"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Controls which generator to call based on the answers gathered from the prompt
 * @module controller
 * @function
 * @param {Answers} answers - Object of answers gathered from the cli prompt
 * @returns {undefined} - Side effects only
 * @license MIT
 * @author Sean W. Lawrence
 */
function controller(answers) {
  var type = answers.type;

  switch (type) {
    case 'component':
      (0, _react.default)(answers);
      break;

    case 'markdown':
      (0, _markdown.default)(answers);
      break;

    case 'Open source project':
      break;

    case 'Markdown page':
      break;

    case 'Test':
      break;

    default:
      break;
  }
}