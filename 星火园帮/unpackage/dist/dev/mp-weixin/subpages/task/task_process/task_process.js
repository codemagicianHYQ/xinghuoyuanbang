(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subpages/task/task_process/task_process"],{

/***/ 582:
/*!***************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/main.js?{"page":"subpages%2Ftask%2Ftask_process%2Ftask_process"} ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _task_process = _interopRequireDefault(__webpack_require__(/*! ./subpages/task/task_process/task_process.vue */ 583));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_task_process.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 583:
/*!******************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./task_process.vue?vue&type=template&id=ebf512dc&scoped=true& */ 584);
/* harmony import */ var _task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./task_process.vue?vue&type=script&lang=js& */ 586);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./task_process.vue?vue&type=style&index=0&id=ebf512dc&scoped=true&lang=css& */ 588);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 48);

var renderjs





/* normalize component */

var component = Object(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "ebf512dc",
  null,
  false,
  _task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "subpages/task/task_process/task_process.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 584:
/*!*************************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue?vue&type=template&id=ebf512dc&scoped=true& ***!
  \*************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_process.vue?vue&type=template&id=ebf512dc&scoped=true& */ 585);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_template_id_ebf512dc_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 585:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue?vue&type=template&id=ebf512dc&scoped=true& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var m0 =
    _vm.task && _vm.task.deadline && _vm.task.deadline !== "null"
      ? _vm.formatDeadline(_vm.task.deadline)
      : null
  var m1 =
    _vm.task && _vm.task.locationText ? _vm.getTaskLocation(_vm.task) : null
  var m2 =
    _vm.task && _vm.task.publisherConfirmedTime
      ? _vm.formatDateTime(_vm.task.publisherConfirmedTime)
      : null
  var m3 =
    _vm.task &&
    _vm.task &&
    (_vm.task.publisher || _vm.task.acceptor) &&
    _vm.isPublisher
      ? _vm.getAcceptorAvatar()
      : null
  var m4 =
    _vm.task &&
    _vm.task &&
    (_vm.task.publisher || _vm.task.acceptor) &&
    !_vm.isPublisher
      ? _vm.getPublisherAvatar()
      : null
  var m5 =
    _vm.task &&
    _vm.task &&
    (_vm.task.publisher || _vm.task.acceptor) &&
    _vm.isPublisher
      ? _vm.getAcceptorName()
      : null
  var m6 =
    _vm.task &&
    _vm.task &&
    (_vm.task.publisher || _vm.task.acceptor) &&
    !_vm.isPublisher
      ? _vm.getPublisherName()
      : null
  var g0 =
    _vm.task && !_vm.isPublisher && _vm.task.status === "assigned"
      ? _vm.confirmImages.length
      : null
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        m0: m0,
        m1: m1,
        m2: m2,
        m3: m3,
        m4: m4,
        m5: m5,
        m6: m6,
        g0: g0,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 586:
/*!*******************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_process.vue?vue&type=script&lang=js& */ 587);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 587:
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 36));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 38));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _vuex = __webpack_require__(/*! vuex */ 50);
var _request = _interopRequireDefault(__webpack_require__(/*! @/common/request.js */ 41));
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _default = {
  name: "TaskProcess",
  data: function data() {
    return {
      taskId: null,
      task: null,
      isLoading: true,
      isCompleting: false,
      isConfirming: false,
      // 用于控制确认完成按钮的加载状态
      confirmImages: [],
      // 确认图片数组
      maxImages: 3 // 最大图片数量
    };
  },

  computed: _objectSpread(_objectSpread({}, (0, _vuex.mapState)(["userInfo"])), {}, {
    // 是否为发布者
    isPublisher: function isPublisher() {
      return this.task && this.userInfo && this.task.publisherId === this.userInfo.id;
    },
    // 任务状态相关计算属性
    statusText: function statusText() {
      if (!this.task) return "";
      var statusMap = {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "待确认",
        completed: "已完成",
        cancelled: "已取消",
        rejected: "已驳回"
      };
      return statusMap[this.task.status] || this.task.status;
    },
    statusClass: function statusClass() {
      if (!this.task) return "";
      return "status-".concat(this.task.status);
    },
    statusCardClass: function statusCardClass() {
      if (!this.task) return "";
      return "status-card-".concat(this.task.status);
    },
    statusIconType: function statusIconType() {
      if (!this.task) return "help";
      var iconMap = {
        open: "help",
        assigned: "gear",
        acceptor_done: "checkmarkempty",
        completed: "checkmarkempty",
        cancelled: "close",
        rejected: "close"
      };
      return iconMap[this.task.status] || "help";
    },
    statusIconColor: function statusIconColor() {
      if (!this.task) return "#999";
      var colorMap = {
        open: "#ff9500",
        assigned: "#007aff",
        acceptor_done: "#34c759",
        completed: "#34c759",
        cancelled: "#ff3b30",
        rejected: "#ff3b30"
      };
      return colorMap[this.task.status] || "#999";
    },
    statusTitle: function statusTitle() {
      if (!this.task) return "加载中...";
      var titleMap = {
        open: "等待接单",
        assigned: "任务进行中",
        acceptor_done: "等待确认",
        completed: "任务完成",
        cancelled: "任务取消",
        rejected: "任务驳回"
      };
      return titleMap[this.task.status] || "未知状态";
    },
    statusDescription: function statusDescription() {
      if (!this.task) return "正在加载任务信息...";
      var descMap = {
        open: "任务已发布，等待接单员接单",
        assigned: "接单员正在处理任务",
        acceptor_done: "接单员已完成任务，等待您确认",
        completed: "任务已完成，感谢使用",
        cancelled: "任务已被取消",
        rejected: "任务已被驳回"
      };
      return descMap[this.task.status] || "状态未知";
    },
    // 任务描述计算属性
    taskDescription: function taskDescription() {
      if (!this.task) return "请帮我取快递";

      // 如果有正常的描述内容
      if (this.task.description && this.task.description !== null && this.task.description !== "null" && this.task.description.trim() !== "") {
        return this.task.description;
      }

      // 如果没有描述，根据任务类型生成默认描述
      var typeDescriptions = {
        取快递: "请帮我取快递",
        取外卖: "请帮我取外卖",
        代购: "请帮我代购商品",
        代取: "请帮我代取物品",
        送货: "请帮我送货",
        跑腿: "请帮我跑腿办事",
        借物品: "请帮我借物品",
        学习伙伴: "寻学习伙伴"
      };
      return typeDescriptions[this.task.taskType] || "请帮我完成任务";
    },
    // 获取任务金额
    getTaskAmount: function getTaskAmount() {
      if (!this.task) return 0;

      // 对于借物品任务，计算实际支付金额（押金+租金）
      if (this.task.taskType === "借物品") {
        var specifics = this.task.specifics || "";

        // 解析押金
        var depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
        var deposit = depositMatch ? parseFloat(depositMatch[1]) : 0;

        // 解析日租金
        var rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
        var dailyRent = rentMatch ? parseFloat(rentMatch[1]) : 0;

        // 解析借用天数
        var dateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/);
        var days = 1;
        if (dateMatch) {
          var startDate = new Date(dateMatch[1]);
          var endDate = new Date(dateMatch[2]);
          var diffTime = Math.abs(endDate - startDate);
          days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        var totalRent = dailyRent * days;
        var totalAmount = deposit + totalRent;
        return totalAmount.toFixed(2);
      }

      // 其他任务类型直接返回rewardAmount
      var amount = this.task.rewardAmount || 0;
      return amount;
    },
    // 订单号计算属性
    orderNumber: function orderNumber() {
      if (!this.task) return "暂未生成";

      // 对于借物品任务，检查是否为借出模式
      if (this.task.taskType === "借物品") {
        // 借出模式：如果任务还未被接单（状态为open），显示"借出后生成"
        if (this.task.borrowMode === "lend") {
          if (this.task.status === "open") {
            return "借出后生成";
          }
          // 如果已经被接单且有订单号，显示实际订单号
          if (this.task.out_trade_no) {
            return this.formatOrderNumber(this.task.out_trade_no);
          }
          return "借出后生成";
        }
        // 借进模式显示实际订单号
        if (this.task.borrowMode === "borrow" && this.task.out_trade_no) {
          return this.formatOrderNumber(this.task.out_trade_no);
        }
        return "借出后生成";
      }
      if (!this.task.out_trade_no) return "暂未生成";
      return this.formatOrderNumber(this.task.out_trade_no);
    },
    // 创建时间计算属性
    createTime: function createTime() {
      if (!this.task || !this.task.createdAt) return "暂无";
      return this.formatDateTime(this.task.createdAt);
    },
    // 接单时间计算属性
    acceptTime: function acceptTime() {
      if (!this.task || !this.task.acceptedAt) return "暂无";
      return this.formatDateTime(this.task.acceptedAt);
    },
    // 驳回按钮文本计算属性
    rejectButtonText: function rejectButtonText() {
      if (!this.task) return "驳回订单";
      if (this.task.taskType === "借物品") {
        if (this.task.borrowMode === "lend") {
          // 借出模式：借入者取消订单
          return "取消订单";
        } else if (this.task.borrowMode === "borrow") {
          // 借进模式：借出者驳回订单
          return "驳回订单";
        }
      }
      // 其他任务类型
      return "驳回订单";
    },
    // 任务类型对应的CSS类计算属性
    taskTypeClass: function taskTypeClass() {
      if (!this.task || !this.task.taskType) return "task-type-default";
      var typeMap = {
        取快递: "task-type-express",
        取外卖: "task-type-takeaway",
        借物品: "task-type-borrow",
        代跑腿: "task-type-errand"
      };
      return typeMap[this.task.taskType] || "task-type-default";
    }
  }),
  onLoad: function onLoad(options) {
    var _this = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this.taskId = options.id;

              // 如果用户信息为空，尝试从store获取
              if (_this.userInfo) {
                _context.next = 10;
                break;
              }
              _context.prev = 2;
              _context.next = 5;
              return _this.$store.dispatch("fetchCurrentUserInfo");
            case 5:
              _context.next = 10;
              break;
            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](2);
              console.error("获取用户信息失败:", _context.t0);
            case 10:
              if (_this.taskId) {
                _this.fetchTaskDetail();
              } else {
                uni.showToast({
                  title: "无效的任务ID",
                  icon: "none"
                });
                _this.goBack();
              }
            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 7]]);
    }))();
  },
  onShow: function onShow() {
    // 页面显示时刷新任务数据，确保状态是最新的
    if (this.taskId) {
      this.fetchTaskDetail();
    }
  },
  methods: {
    fetchTaskDetail: function fetchTaskDetail() {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var res;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this2.isLoading = true;
                _context2.prev = 1;
                _context2.next = 4;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this2.taskId),
                  method: "GET"
                });
              case 4:
                res = _context2.sent;
                if (res) {
                  _this2.task = res;
                } else {
                  uni.showToast({
                    title: "获取任务信息失败",
                    icon: "none"
                  });
                }
                _context2.next = 12;
                break;
              case 8:
                _context2.prev = 8;
                _context2.t0 = _context2["catch"](1);
                console.error("获取任务详情失败:", _context2.t0);
                uni.showToast({
                  title: "获取任务信息失败",
                  icon: "none"
                });
              case 12:
                _context2.prev = 12;
                _this2.isLoading = false;
                return _context2.finish(12);
              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[1, 8, 12, 15]]);
      }))();
    },
    // 检查是否可以驳回订单（接单后10分钟内）
    canRejectTask: function canRejectTask() {
      if (!this.task || !this.task.acceptedAt) {
        return false;
      }
      var acceptTime = new Date(this.task.acceptedAt);
      var currentTime = new Date();
      var timeDiff = currentTime - acceptTime;
      var tenMinutes = 10 * 60 * 1000; // 10分钟的毫秒数

      return timeDiff <= tenMinutes;
    },
    // 处理驳回按钮点击
    handleRejectClick: function handleRejectClick() {
      if (!this.canRejectTask()) {
        uni.showToast({
          title: "接单后10分钟内才能驳回",
          icon: "none"
        });
        return;
      }
      this.rejectTask();
    },
    // 驳回订单
    rejectTask: function rejectTask() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                try {
                  uni.showModal({
                    title: "确认驳回",
                    content: "确定要驳回这个订单吗？",
                    success: function () {
                      var _success = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(res) {
                        var response;
                        return _regenerator.default.wrap(function _callee3$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                if (!res.confirm) {
                                  _context3.next = 16;
                                  break;
                                }
                                _this3.isLoading = true;
                                _context3.prev = 2;
                                _context3.next = 5;
                                return (0, _request.default)({
                                  url: "/tasks/".concat(_this3.taskId, "/reject"),
                                  method: "POST"
                                });
                              case 5:
                                response = _context3.sent;
                                if (response.message) {
                                  uni.showToast({
                                    title: response.message,
                                    icon: "success"
                                  });
                                  // 驳回成功后跳转回订单大厅
                                  setTimeout(function () {
                                    uni.navigateBack({
                                      delta: 1,
                                      // 返回上一页
                                      success: function success() {
                                        // 如果返回失败，则跳转到订单大厅
                                        uni.switchTab({
                                          url: "/pages/tasks/tasks"
                                        });
                                      },
                                      fail: function fail() {
                                        // 直接跳转到订单大厅
                                        uni.switchTab({
                                          url: "/pages/tasks/tasks"
                                        });
                                      }
                                    });
                                  }, 1500); // 延迟1.5秒让用户看到成功提示
                                }
                                _context3.next = 13;
                                break;
                              case 9:
                                _context3.prev = 9;
                                _context3.t0 = _context3["catch"](2);
                                console.error("驳回订单失败:", _context3.t0);
                                uni.showToast({
                                  title: _context3.t0.message || "驳回失败",
                                  icon: "none"
                                });
                              case 13:
                                _context3.prev = 13;
                                _this3.isLoading = false;
                                return _context3.finish(13);
                              case 16:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, _callee3, null, [[2, 9, 13, 16]]);
                      }));
                      function success(_x) {
                        return _success.apply(this, arguments);
                      }
                      return success;
                    }()
                  });
                } catch (error) {
                  console.error("驳回订单失败:", error);
                  uni.showToast({
                    title: "驳回失败",
                    icon: "none"
                  });
                }
              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    },
    // 接单员确认完成任务
    markAsComplete: function markAsComplete() {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var isOfflineTask, confirmResult, requestData, response, _this4$task, _this4$task2;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                // 检查是否为线下任务且需要必须上传图片
                isOfflineTask = _this4.isOfflineTask();
                if (!(isOfflineTask && _this4.confirmImages.length === 0)) {
                  _context5.next = 5;
                  break;
                }
                uni.showModal({
                  title: "提示",
                  content: "此任务需要上传完成凭证图片，请先上传图片后再标记完成",
                  showCancel: false,
                  confirmText: "知道了"
                });
                return _context5.abrupt("return");
              case 5:
                _context5.next = 7;
                return _this4.showConfirmDialog();
              case 7:
                confirmResult = _context5.sent;
                if (confirmResult) {
                  _context5.next = 10;
                  break;
                }
                return _context5.abrupt("return");
              case 10:
                _context5.next = 12;
                return _this4.requestNotificationAuth();
              case 12:
                _this4.isCompleting = true;

                // 构建请求数据
                requestData = {};
                if (_this4.confirmImages.length > 0) {
                  requestData.confirmImages = _this4.confirmImages;
                }
                _context5.next = 17;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this4.taskId, "/acceptor-confirm-done"),
                  method: "POST",
                  data: requestData
                });
              case 17:
                response = _context5.sent;
                if (!response.message) {
                  _context5.next = 26;
                  break;
                }
                uni.showToast({
                  title: response.message,
                  icon: "success"
                });

                // 强制刷新任务信息
                console.log("标记完成前任务状态:", (_this4$task = _this4.task) === null || _this4$task === void 0 ? void 0 : _this4$task.status);
                _context5.next = 23;
                return _this4.fetchTaskDetail();
              case 23:
                console.log("标记完成后任务状态:", (_this4$task2 = _this4.task) === null || _this4$task2 === void 0 ? void 0 : _this4$task2.status);

                // 通知任务列表页面刷新
                uni.$emit("taskStatusChanged", {
                  taskId: _this4.taskId,
                  newStatus: "acceptor_done",
                  action: "acceptorConfirmed"
                });

                // 延迟跳转回任务详情页面
                setTimeout(function () {
                  uni.navigateBack({
                    delta: 1
                  });
                }, 1500);
              case 26:
                _context5.next = 32;
                break;
              case 28:
                _context5.prev = 28;
                _context5.t0 = _context5["catch"](0);
                console.error("确认完成任务失败:", _context5.t0);
                uni.showToast({
                  title: _context5.t0.message || "确认失败",
                  icon: "none"
                });
              case 32:
                _context5.prev = 32;
                _this4.isCompleting = false;
                return _context5.finish(32);
              case 35:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 28, 32, 35]]);
      }))();
    },
    // 判断是否为线下任务
    isOfflineTask: function isOfflineTask() {
      if (!this.task || !this.task.taskType) {
        return false;
      }
      var offlineTaskTypes = ["取快递", "取外卖", "帮我买", "搬运服务"];
      return offlineTaskTypes.includes(this.task.taskType);
    },
    // 显示确认弹窗
    showConfirmDialog: function showConfirmDialog() {
      return new Promise(function (resolve) {
        uni.showModal({
          title: "确认完成",
          content: "确认该任务已完成吗？",
          confirmText: "确定",
          cancelText: "取消",
          success: function success(res) {
            resolve(res.confirm);
          },
          fail: function fail() {
            resolve(false);
          }
        });
      });
    },
    // 发布者确认任务完成
    confirmTaskComplete: function confirmTaskComplete() {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        var response, _this5$task, _this5$task2;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                _this5.isConfirming = true;
                _context6.next = 4;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this5.taskId, "/publisher-confirm-done"),
                  method: "POST"
                });
              case 4:
                response = _context6.sent;
                if (!response.message) {
                  _context6.next = 14;
                  break;
                }
                uni.showToast({
                  title: response.message,
                  icon: "success"
                });

                // 强制刷新任务信息
                console.log("确认完成前任务状态:", (_this5$task = _this5.task) === null || _this5$task === void 0 ? void 0 : _this5$task.status);
                _context6.next = 10;
                return _this5.fetchTaskDetail();
              case 10:
                console.log("确认完成后任务状态:", (_this5$task2 = _this5.task) === null || _this5$task2 === void 0 ? void 0 : _this5$task2.status);

                // 强制更新Vue响应式数据
                _this5.$forceUpdate();

                // 通知任务列表页面刷新
                uni.$emit("taskStatusChanged", {
                  taskId: _this5.taskId,
                  newStatus: "publisher_confirmed",
                  action: "publisherConfirmed"
                });

                // 延迟跳转到任务列表页面
                setTimeout(function () {
                  uni.switchTab({
                    url: "/pages/tasks"
                  });
                }, 2000);
              case 14:
                _context6.next = 20;
                break;
              case 16:
                _context6.prev = 16;
                _context6.t0 = _context6["catch"](0);
                console.error("确认任务完成失败:", _context6.t0);
                uni.showToast({
                  title: _context6.t0.message || "确认失败",
                  icon: "none"
                });
              case 20:
                _context6.prev = 20;
                _this5.isConfirming = false;
                return _context6.finish(20);
              case 23:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[0, 16, 20, 23]]);
      }))();
    },
    // 请求订阅消息授权
    requestNotificationAuth: function requestNotificationAuth() {
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var authRes, acceptedCount;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                _context7.next = 3;
                return uni.requestSubscribeMessage({
                  tmplIds: ["your_template_id_1", "your_template_id_2"]
                });
              case 3:
                authRes = _context7.sent;
                acceptedCount = Object.values(authRes).filter(function (status) {
                  return status === "accept";
                }).length;
                if (acceptedCount > 0) {
                  console.log("\u7528\u6237\u6388\u6743\u4E86 ".concat(acceptedCount, " \u4E2A\u6A21\u677F"));
                }
                _context7.next = 11;
                break;
              case 8:
                _context7.prev = 8;
                _context7.t0 = _context7["catch"](0);
                console.error("订阅消息授权失败:", _context7.t0);
              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, null, [[0, 8]]);
      }))();
    },
    // 联系发布者
    contactPublisher: function contactPublisher() {
      if (this.task && this.task.publisherId) {
        uni.navigateTo({
          url: "/pages/chat/chat?taskId=".concat(this.taskId, "&userId=").concat(this.task.publisherId)
        });
      }
    },
    // 联系接单员
    contactAcceptor: function contactAcceptor() {
      if (this.task && this.task.acceptorId) {
        uni.navigateTo({
          url: "/pages/chat/chat?taskId=".concat(this.taskId, "&userId=").concat(this.task.acceptorId)
        });
      }
    },
    // 选择图片
    chooseImage: function chooseImage() {
      var _this6 = this;
      if (this.confirmImages.length >= this.maxImages) {
        uni.showToast({
          title: "\u6700\u591A\u53EA\u80FD\u4E0A\u4F20".concat(this.maxImages, "\u5F20\u56FE\u7247"),
          icon: "none"
        });
        return;
      }
      uni.chooseImage({
        count: this.maxImages - this.confirmImages.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: function success(res) {
          _this6.uploadImages(res.tempFilePaths);
        },
        fail: function fail(error) {
          // 检查是否是用户取消了选择
          if (error.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了图片选择");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            console.error("选择图片失败:", error);
            uni.showToast({
              title: "选择图片失败",
              icon: "error"
            });
          }
        }
      });
    },
    // 上传图片
    uploadImages: function uploadImages(filePaths) {
      var _this7 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        var _iterator, _step, filePath;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _iterator = _createForOfIteratorHelper(filePaths);
                _context8.prev = 1;
                _iterator.s();
              case 3:
                if ((_step = _iterator.n()).done) {
                  _context8.next = 16;
                  break;
                }
                filePath = _step.value;
                _context8.prev = 5;
                _context8.next = 8;
                return _this7.uploadSingleImage(filePath);
              case 8:
                _context8.next = 14;
                break;
              case 10:
                _context8.prev = 10;
                _context8.t0 = _context8["catch"](5);
                console.error("上传图片失败:", _context8.t0);
                uni.showToast({
                  title: "上传图片失败",
                  icon: "none"
                });
              case 14:
                _context8.next = 3;
                break;
              case 16:
                _context8.next = 21;
                break;
              case 18:
                _context8.prev = 18;
                _context8.t1 = _context8["catch"](1);
                _iterator.e(_context8.t1);
              case 21:
                _context8.prev = 21;
                _iterator.f();
                return _context8.finish(21);
              case 24:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[1, 18, 21, 24], [5, 10]]);
      }))();
    },
    // 上传单张图片
    uploadSingleImage: function uploadSingleImage(filePath) {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt("return", new Promise(function (resolve, reject) {
                  uni.uploadFile({
                    url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/orderConfirm",
                    filePath: filePath,
                    name: "file",
                    header: {
                      Authorization: uni.getStorageSync("userAuthToken_xh") || ""
                    },
                    success: function success(res) {
                      try {
                        var data = JSON.parse(res.data);
                        console.log("上传响应数据:", data);

                        // 检查不同的成功响应格式
                        if (data.success && data.url) {
                          // 标准成功格式
                          _this8.confirmImages.push(data.url);
                          resolve(data.url);
                        } else if (data.url) {
                          // 只有url的情况
                          _this8.confirmImages.push(data.url);
                          resolve(data.url);
                        } else if (data.success && data.data) {
                          // 数据在data对象中的情况
                          var responseData = data.data;
                          var imageUrl = responseData.url || responseData.imageUrl || responseData.image || responseData.fileUrl || responseData.file;
                          if (imageUrl) {
                            _this8.confirmImages.push(imageUrl);
                            resolve(imageUrl);
                          } else {
                            console.log("data对象内容:", responseData);
                            reject(new Error("上传成功但未在data中找到图片URL"));
                          }
                        } else if (data.success) {
                          // 只有success的情况，可能url在其他字段
                          var _imageUrl = data.imageUrl || data.image || data.fileUrl || data.file;
                          if (_imageUrl) {
                            _this8.confirmImages.push(_imageUrl);
                            resolve(_imageUrl);
                          } else {
                            reject(new Error("上传成功但未返回图片URL"));
                          }
                        } else {
                          reject(new Error(data.message || "上传失败"));
                        }
                      } catch (error) {
                        console.error("解析上传响应失败:", error);
                        reject(new Error("解析响应数据失败"));
                      }
                    },
                    fail: function fail(error) {
                      reject(error);
                    }
                  });
                }));
              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }))();
    },
    // 预览图片
    previewImage: function previewImage(current) {
      uni.previewImage({
        current: current,
        urls: this.confirmImages
      });
    },
    // 删除图片
    removeImage: function removeImage(index) {
      this.confirmImages.splice(index, 1);
    },
    // 格式化截止时间
    formatDeadline: function formatDeadline(deadline) {
      if (!deadline) return "";
      try {
        var date = new Date(deadline);

        // 将截止时间往后延长30分钟（自动取消时间）
        var autoCancelTime = new Date(date.getTime() + 30 * 60 * 1000);
        var month = autoCancelTime.getMonth() + 1;
        var day = autoCancelTime.getDate();
        var hours = autoCancelTime.getHours().toString().padStart(2, "0");
        var minutes = autoCancelTime.getMinutes().toString().padStart(2, "0");
        return "".concat(month, "\u6708").concat(day, "\u65E5 ").concat(hours, ":").concat(minutes);
      } catch (error) {
        return deadline;
      }
    },
    // 格式化订单号
    formatOrderNumber: function formatOrderNumber(outTradeNo) {
      if (!outTradeNo || outTradeNo === null || outTradeNo === "null") return "";
      // 去掉 ORDER 前缀，只保留数字部分
      var cleanOrderNo = outTradeNo.replace(/^ORDER\s*/, "");
      // 完整显示订单号
      return cleanOrderNo;
    },
    // 格式化日期时间
    formatDateTime: function formatDateTime(dateTime) {
      if (!dateTime || dateTime === null || dateTime === "null") return "";
      try {
        var date = new Date(dateTime);
        if (isNaN(date.getTime())) return "";
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        var hour = String(date.getHours()).padStart(2, "0");
        var minute = String(date.getMinutes()).padStart(2, "0");
        return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hour, ":").concat(minute);
      } catch (error) {
        return dateTime;
      }
    },
    // 获取任务地点显示文本
    getTaskLocation: function getTaskLocation(task) {
      if (!task) return "未知地点";
      var taskType = task.taskType || "";

      // 根据任务类型优化地点显示
      switch (taskType) {
        case "倒垃圾":
          return "清理垃圾";
        case "搬运服务":
          // 解析具体信息，提取起始地点
          if (task.specifics) {
            var startLocationMatch = task.specifics.match(/起始地点[:：]\s*([^,，\n]+)/);
            if (startLocationMatch) {
              return startLocationMatch[1].trim();
            }
          }
          return task.locationText || "待确定";
        case "借物品":
          // 借物品任务显示借出地点
          if (task.specifics) {
            var locationMatch = task.specifics.match(/借出地点[:：]\s*([^,，\n]+)/);
            if (locationMatch) {
              return locationMatch[1].trim();
            }
          }
          return task.locationText || "待确定";
        default:
          return task.locationText || "待确定";
      }
    },
    // 返回上一页
    goBack: function goBack() {
      uni.navigateBack();
    },
    getPublisherAvatar: function getPublisherAvatar() {
      return this.task && this.task.publisher && this.task.publisher.avatarUrl || "/static/images/default-avatar.png";
    },
    getPublisherName: function getPublisherName() {
      return this.task && this.task.publisher && this.task.publisher.nickname || "匿名用户";
    },
    getAcceptorAvatar: function getAcceptorAvatar() {
      return this.task && this.task.acceptor && this.task.acceptor.avatarUrl || "/static/images/default-avatar.png";
    },
    getAcceptorName: function getAcceptorName() {
      return this.task && this.task.acceptor && this.task.acceptor.nickname || "匿名用户";
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 588:
/*!***************************************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue?vue&type=style&index=0&id=ebf512dc&scoped=true&lang=css& ***!
  \***************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_process.vue?vue&type=style&index=0&id=ebf512dc&scoped=true&lang=css& */ 589);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_process_vue_vue_type_style_index_0_id_ebf512dc_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 589:
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_process/task_process.vue?vue&type=style&index=0&id=ebf512dc&scoped=true&lang=css& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[582,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subpages/task/task_process/task_process.js.map