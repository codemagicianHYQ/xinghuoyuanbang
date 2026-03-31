(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subpages/task/task_confirm/task_confirm"],{

/***/ 574:
/*!***************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/main.js?{"page":"subpages%2Ftask%2Ftask_confirm%2Ftask_confirm"} ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _task_confirm = _interopRequireDefault(__webpack_require__(/*! ./subpages/task/task_confirm/task_confirm.vue */ 575));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_task_confirm.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 575:
/*!******************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./task_confirm.vue?vue&type=template&id=86ef1b9c&scoped=true& */ 576);
/* harmony import */ var _task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./task_confirm.vue?vue&type=script&lang=js& */ 578);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./task_confirm.vue?vue&type=style&index=0&id=86ef1b9c&lang=scss&scoped=true& */ 580);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 48);

var renderjs





/* normalize component */

var component = Object(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "86ef1b9c",
  null,
  false,
  _task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "subpages/task/task_confirm/task_confirm.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 576:
/*!*************************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue?vue&type=template&id=86ef1b9c&scoped=true& ***!
  \*************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_confirm.vue?vue&type=template&id=86ef1b9c&scoped=true& */ 577);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_template_id_86ef1b9c_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 577:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue?vue&type=template&id=86ef1b9c&scoped=true& ***!
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
  var m0 = _vm.task
    ? _vm.cleanHtmlContent(_vm.task.description) || "暂无描述"
    : null
  var m1 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getAvailableTimeRange() || "未设置"
      : null
  var m2 =
    _vm.task &&
    _vm.task.taskType === "借物品" &&
    !(_vm.task.borrowMode === "lend")
      ? _vm.getBorrowTimeRange() || "未设置"
      : null
  var m3 =
    _vm.task && !(_vm.task.taskType === "借物品")
      ? _vm.formatDeadline(_vm.task.deadline)
      : null
  var m4 =
    _vm.task &&
    _vm.task.requiredGender !== undefined &&
    _vm.task.requiredGender !== 0
      ? _vm.getGenderText(_vm.task.requiredGender)
      : null
  var m5 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getAvailableStartDate()
      : null
  var m6 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getAvailableEndDate()
      : null
  var m7 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.borrowStartDate || _vm.getAvailableStartDate()
      : null
  var m8 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getAvailableEndDate()
      : null
  var m9 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getDepositAmount()
      : null
  var m10 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getDailyRentAmount()
      : null
  var m11 =
    _vm.task &&
    _vm.task.taskType === "借物品" &&
    _vm.task.borrowMode === "lend" &&
    _vm.borrowDays > 0
      ? _vm.getRentSubtotal()
      : null
  var m12 =
    _vm.task && _vm.task.taskType === "借物品" && _vm.task.borrowMode === "lend"
      ? _vm.getTotalCost()
      : null
  var m13 =
    _vm.task && _vm.task.out_trade_no
      ? _vm.formatOrderNumber(_vm.task.out_trade_no)
      : null
  var m14 =
    _vm.task && _vm.task.createdAt
      ? _vm.formatDateTime(_vm.task.createdAt)
      : null
  var m15 =
    _vm.task && _vm.task.acceptedAt
      ? _vm.formatDateTime(_vm.task.acceptedAt)
      : null
  var m16 =
    _vm.task && _vm.task.publisherConfirmedTime
      ? _vm.formatDateTime(_vm.task.publisherConfirmedTime)
      : null
  var m17 = _vm.task ? _vm.getPublisherAvatar() : null
  var m18 = _vm.task ? _vm.getPublisherName() : null
  var m19 =
    _vm.task && _vm.task.publisher && _vm.task.publisher.gender
      ? _vm.getGenderText(_vm.task.publisher.gender)
      : null
  var m20 = !_vm.isPublisher ? _vm.getBorrowButtonText(_vm.task) : null
  var m21 = !!_vm.isPublisher ? _vm.getPublisherTipText() : null
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
        m7: m7,
        m8: m8,
        m9: m9,
        m10: m10,
        m11: m11,
        m12: m12,
        m13: m13,
        m14: m14,
        m15: m15,
        m16: m16,
        m17: m17,
        m18: m18,
        m19: m19,
        m20: m20,
        m21: m21,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 578:
/*!*******************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_confirm.vue?vue&type=script&lang=js& */ 579);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 579:
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni, wx) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 36));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 38));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _request = _interopRequireDefault(__webpack_require__(/*! @/common/request.js */ 41));
var _vuex = __webpack_require__(/*! vuex */ 50);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _default = {
  data: function data() {
    return {
      taskId: null,
      task: null,
      isLoading: true,
      isAccepting: false,
      // 借用时间段选择
      borrowStartDate: "",
      borrowEndDate: "",
      borrowDays: 0
    };
  },
  computed: _objectSpread(_objectSpread({}, (0, _vuex.mapState)(["userInfo"])), {}, {
    isRiderUser: function isRiderUser() {
      return this.userInfo && (this.userInfo.role === "rider" || this.userInfo.riderApplicationStatus === "approved");
    },
    isPublisher: function isPublisher() {
      return this.userInfo && this.task && this.userInfo.id === this.task.publisherId;
    },
    platformFee: function platformFee() {
      if (!this.task) return "0.00";
      var total = parseFloat(this.task.rewardAmount);
      return (total * 0.1).toFixed(2);
    },
    actualEarnings: function actualEarnings() {
      if (!this.task) return "0.00";
      var total = parseFloat(this.task.rewardAmount);
      return (total * 0.9).toFixed(2);
    },
    // 解析借用时长
    borrowDuration: function borrowDuration() {
      if (!this.task || !this.task.specifics) return null;

      // 从specifics字段中提取借用时长
      var specifics = this.task.specifics;
      var durationMatch = specifics.match(/借用时长[：:]\s*(\d+天)/);
      if (durationMatch) {
        return durationMatch[1];
      }

      // 如果没有找到借用时长，尝试从开始日期和归还日期计算
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      var returnDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (startDateMatch && returnDateMatch) {
        var startDate = new Date(startDateMatch[1]);
        var returnDate = new Date(returnDateMatch[1]);
        if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
          var diffTime = Math.abs(returnDate - startDate);
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return "".concat(diffDays, "\u5929");
        }
      }
      return null;
    }
  }),
  onLoad: function onLoad(options) {
    this.taskId = options.id;
    if (this.taskId) {
      this.fetchTaskDetail();
    } else {
      uni.showToast({
        title: "无效的任务ID",
        icon: "none"
      });
      this.goBack();
    }
  },
  methods: {
    fetchTaskDetail: function fetchTaskDetail() {
      var _this = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var res;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.isLoading = true;
                _context.prev = 1;
                _context.next = 4;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this.taskId),
                  method: "GET"
                });
              case 4:
                res = _context.sent;
                _this.task = res;
                _context.next = 13;
                break;
              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](1);
                console.error("获取任务详情失败:", _context.t0);
                uni.showToast({
                  title: "加载失败",
                  icon: "none"
                });
                _this.goBack();
              case 13:
                _context.prev = 13;
                _this.isLoading = false;
                return _context.finish(13);
              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 8, 13, 16]]);
      }))();
    },
    formatDeadline: function formatDeadline(deadline) {
      try {
        if (!deadline) return "无截止时间";
        var d = new Date(deadline);
        if (isNaN(d.getTime())) return "时间格式错误";
        return "".concat(d.getFullYear(), "-").concat((d.getMonth() + 1).toString().padStart(2, "0"), "-").concat(d.getDate().toString().padStart(2, "0"), " ").concat(d.getHours().toString().padStart(2, "0"), ":").concat(d.getMinutes().toString().padStart(2, "0"));
      } catch (error) {
        console.error("格式化截止时间错误:", error);
        return "时间格式错误";
      }
    },
    goBack: function goBack() {
      uni.navigateBack();
    },
    // 获取借物品按钮文本
    getBorrowButtonText: function getBorrowButtonText(task) {
      if (!task) return "确认接单";
      if (task.taskType !== "借物品") {
        return "确认接单";
      }

      // 根据借物品的借出/借进模式显示不同按钮
      if (task.borrowMode === "lend") {
        return "我要借";
      } else if (task.borrowMode === "borrow") {
        return "借给Ta";
      }

      // 默认情况
      return "确认接单";
    },
    // 获取发布者提示文本
    getPublisherTipText: function getPublisherTipText() {
      if (!this.task) return "不能接自己的订单哦";
      if (this.task.taskType === "借物品") {
        return "不能借自己的物品哦";
      } else {
        return "不能接自己的订单哦";
      }
    },
    // 从任务详情中解析押金金额
    getDepositAmount: function getDepositAmount() {
      if (!this.task || !this.task.specifics) {
        var _this$task;
        console.log("订单确认页面 - getDepositAmount: 任务或详情为空", {
          task: this.task,
          specifics: (_this$task = this.task) === null || _this$task === void 0 ? void 0 : _this$task.specifics
        });
        return "0";
      }
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getDepositAmount: 解析specifics", specifics);
      var depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log("订单确认页面 - getDepositAmount: 押金匹配结果", depositMatch);
      return depositMatch ? depositMatch[1] : "0";
    },
    // 从任务详情中解析日租金金额
    getDailyRentAmount: function getDailyRentAmount() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getDailyRentAmount: 任务或详情为空");
        return "0";
      }
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getDailyRentAmount: 解析specifics", specifics);
      var rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log("订单确认页面 - getDailyRentAmount: 日租金匹配结果", rentMatch);
      return rentMatch ? rentMatch[1] : "0";
    },
    // 计算总费用（押金 + 租金）
    getTotalCost: function getTotalCost() {
      var deposit = parseFloat(this.getDepositAmount()) || 0;
      var dailyRent = parseFloat(this.getDailyRentAmount()) || 0;

      // 计算借用天数
      var days = this.getBorrowDays();
      var totalRent = dailyRent * days;
      console.log("订单确认页面 - getTotalCost: 计算详情", {
        deposit: deposit,
        dailyRent: dailyRent,
        days: days,
        totalRent: totalRent,
        borrowStartDate: this.borrowStartDate,
        borrowEndDate: this.borrowEndDate
      });
      return (deposit + totalRent).toFixed(2);
    },
    // 获取借用天数（从用户选择的时间段计算）
    getBorrowDays: function getBorrowDays() {
      if (!this.borrowStartDate || !this.borrowEndDate) {
        return 0;
      }
      var startDate = new Date(this.borrowStartDate);
      var endDate = new Date(this.borrowEndDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }

      // 计算天数差
      var diffTime = Math.abs(endDate - startDate);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期

      return diffDays > 0 ? diffDays : 0;
    },
    // 计算租金小计
    getRentSubtotal: function getRentSubtotal() {
      var dailyRent = parseFloat(this.getDailyRentAmount()) || 0;
      var days = this.getBorrowDays();
      return (dailyRent * days).toFixed(2);
    },
    // 开始时间选择
    onStartDateChange: function onStartDateChange(e) {
      this.borrowStartDate = e.detail.value;
      this.calculateBorrowDays();
    },
    // 结束时间选择
    onEndDateChange: function onEndDateChange(e) {
      this.borrowEndDate = e.detail.value;
      this.calculateBorrowDays();
    },
    // 计算借用天数
    calculateBorrowDays: function calculateBorrowDays() {
      this.borrowDays = this.getBorrowDays();
      console.log("借用天数计算:", {
        startDate: this.borrowStartDate,
        endDate: this.borrowEndDate,
        days: this.borrowDays
      });
    },
    // 获取借出者提供的可用时间段
    getAvailableTimeRange: function getAvailableTimeRange() {
      if (!this.task || !this.task.specifics) return null;
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getAvailableTimeRange: 解析specifics", specifics);

      // 尝试多种匹配模式
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      var endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(/可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("订单确认页面 - getAvailableTimeRange: 开始日期匹配", startDateMatch);
      console.log("订单确认页面 - getAvailableTimeRange: 结束日期匹配", endDateMatch);
      if (startDateMatch && endDateMatch) {
        return "".concat(startDateMatch[1], " \u81F3 ").concat(endDateMatch[1]);
      }
      return null;
    },
    // 获取借进模式的借用时间段
    getBorrowTimeRange: function getBorrowTimeRange() {
      if (!this.task || !this.task.specifics) return null;
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getBorrowTimeRange: 解析specifics", specifics);

      // 尝试多种匹配模式
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!startDateMatch) {
        // 尝试匹配"借用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      var endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"借用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(/借用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("订单确认页面 - getBorrowTimeRange: 开始日期匹配", startDateMatch);
      console.log("订单确认页面 - getBorrowTimeRange: 结束日期匹配", endDateMatch);
      if (startDateMatch && endDateMatch) {
        return "".concat(startDateMatch[1], " \u81F3 ").concat(endDateMatch[1]);
      }
      return null;
    },
    // 获取可借用天数
    getAvailableDays: function getAvailableDays() {
      if (!this.task || !this.task.specifics) return 0;
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getAvailableDays: 解析specifics", specifics);

      // 尝试多种匹配模式
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      var endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);

      // 如果没匹配到，尝试"可用时间"格式
      if (!startDateMatch) {
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      if (!endDateMatch) {
        endDateMatch = specifics.match(/可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/);
      }

      // 如果还没匹配到，尝试"借用时间"格式
      if (!startDateMatch) {
        startDateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      if (!endDateMatch) {
        endDateMatch = specifics.match(/借用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("订单确认页面 - getAvailableDays: 开始日期匹配", startDateMatch);
      console.log("订单确认页面 - getAvailableDays: 结束日期匹配", endDateMatch);
      if (startDateMatch && endDateMatch) {
        var startDate = new Date(startDateMatch[1]);
        var endDate = new Date(endDateMatch[1]);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          var diffTime = Math.abs(endDate - startDate);
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期
          console.log("订单确认页面 - getAvailableDays: 计算天数", diffDays);
          return diffDays;
        }
      }
      console.log("订单确认页面 - getAvailableDays: 未匹配到有效日期，返回0");
      return 0;
    },
    // 获取可用开始日期
    getAvailableStartDate: function getAvailableStartDate() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getAvailableStartDate: 任务或详情为空");
        return new Date().toISOString().split("T")[0];
      }
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getAvailableStartDate: 解析specifics", specifics);
      // 尝试多种匹配模式
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("订单确认页面 - getAvailableStartDate: 开始日期匹配结果", startDateMatch);
      if (startDateMatch) {
        console.log("订单确认页面 - getAvailableStartDate: 返回开始日期", startDateMatch[1]);
        return startDateMatch[1];
      }
      console.log("订单确认页面 - getAvailableStartDate: 未匹配到开始日期，返回今天");
      return new Date().toISOString().split("T")[0];
    },
    // 获取可用结束日期
    getAvailableEndDate: function getAvailableEndDate() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getAvailableEndDate: 任务或详情为空");
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      }
      var specifics = this.task.specifics;
      console.log("订单确认页面 - getAvailableEndDate: 解析specifics", specifics);
      // 尝试多种匹配模式
      var endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(/可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("订单确认页面 - getAvailableEndDate: 归还日期匹配结果", endDateMatch);
      if (endDateMatch) {
        console.log("订单确认页面 - getAvailableEndDate: 返回归还日期", endDateMatch[1]);
        return endDateMatch[1];
      }
      console.log("订单确认页面 - getAvailableEndDate: 未匹配到归还日期，返回一年后");
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    },
    // 处理借物品支付
    handleBorrowPayment: function handleBorrowPayment() {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var availableStartDate, availableEndDate, totalCost, deposit, dailyRent, days, totalRent, paymentRes, paymentResult, _paymentRes$paymentPa, acceptRes;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("订单确认页面 - handleBorrowPayment: 开始处理借物品支付", {
                  borrowStartDate: _this2.borrowStartDate,
                  borrowEndDate: _this2.borrowEndDate,
                  borrowDays: _this2.borrowDays
                });
                _context2.prev = 1;
                if (!(!_this2.borrowStartDate || !_this2.borrowEndDate)) {
                  _context2.next = 6;
                  break;
                }
                console.log("订单确认页面 - handleBorrowPayment: 未选择时间段");
                uni.showToast({
                  title: "请先选择借用时间段",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 6:
                if (!(_this2.borrowDays <= 0)) {
                  _context2.next = 9;
                  break;
                }
                uni.showToast({
                  title: "借用时间段无效",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 9:
                // 检查选择的时间是否在借出者提供的可用时间段内
                availableStartDate = _this2.getAvailableStartDate();
                availableEndDate = _this2.getAvailableEndDate();
                if (!(_this2.borrowStartDate < availableStartDate || _this2.borrowEndDate > availableEndDate)) {
                  _context2.next = 14;
                  break;
                }
                uni.showToast({
                  title: "选择的时间超出借出者提供的可用时间段",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 14:
                totalCost = parseFloat(_this2.getTotalCost());
                deposit = parseFloat(_this2.getDepositAmount());
                dailyRent = parseFloat(_this2.getDailyRentAmount());
                days = _this2.getBorrowDays();
                totalRent = dailyRent * days;
                console.log("借物品支付信息:", {
                  totalCost: totalCost,
                  deposit: deposit,
                  dailyRent: dailyRent,
                  days: days,
                  totalRent: totalRent,
                  startDate: _this2.borrowStartDate,
                  endDate: _this2.borrowEndDate
                });

                // 调用支付接口
                _context2.next = 22;
                return (0, _request.default)({
                  url: "/pay/unifiedOrder",
                  method: "POST",
                  data: {
                    amount: totalCost,
                    description: "\u501F\u7269\u54C1\u652F\u4ED8 - ".concat(_this2.task.title),
                    taskId: _this2.taskId,
                    paymentType: "borrow_item",
                    borrowInfo: {
                      deposit: deposit,
                      dailyRent: dailyRent,
                      days: days,
                      totalRent: totalRent,
                      itemName: _this2.task.title,
                      lenderId: _this2.task.publisherId,
                      startDate: _this2.borrowStartDate,
                      endDate: _this2.borrowEndDate
                    }
                  }
                });
              case 22:
                paymentRes = _context2.sent;
                if (!(paymentRes && paymentRes.paymentParams)) {
                  _context2.next = 35;
                  break;
                }
                _context2.next = 26;
                return _this2.wxPay(paymentRes.paymentParams);
              case 26:
                paymentResult = _context2.sent;
                if (!paymentResult.success) {
                  _context2.next = 34;
                  break;
                }
                _context2.next = 30;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this2.taskId, "/accept"),
                  method: "POST",
                  data: {
                    borrowInfo: {
                      startDate: _this2.borrowStartDate,
                      endDate: _this2.borrowEndDate,
                      out_trade_no: ((_paymentRes$paymentPa = paymentRes.paymentParams) === null || _paymentRes$paymentPa === void 0 ? void 0 : _paymentRes$paymentPa.out_trade_no) || null // 传递支付订单号
                    }
                  }
                });
              case 30:
                acceptRes = _context2.sent;
                if (acceptRes && acceptRes.message) {
                  uni.showToast({
                    title: "借物品成功！",
                    icon: "success",
                    duration: 2000
                  });

                  // 延迟跳转到订单处理页面
                  setTimeout(function () {
                    uni.redirectTo({
                      url: "/subpages/task/task_process/task_process?id=".concat(_this2.taskId)
                    });
                  }, 2000);
                }
                _context2.next = 35;
                break;
              case 34:
                uni.showToast({
                  title: "支付失败",
                  icon: "none"
                });
              case 35:
                _context2.next = 41;
                break;
              case 37:
                _context2.prev = 37;
                _context2.t0 = _context2["catch"](1);
                console.error("借物品支付失败:", _context2.t0);
                uni.showToast({
                  title: "支付失败，请重试",
                  icon: "none"
                });
              case 41:
                _context2.prev = 41;
                _this2.isAccepting = false;
                return _context2.finish(41);
              case 44:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[1, 37, 41, 44]]);
      }))();
    },
    // 微信支付
    wxPay: function wxPay(paymentParams) {
      return new Promise(function (resolve) {
        uni.requestPayment({
          provider: "wxpay",
          timeStamp: paymentParams.timeStamp + "",
          nonceStr: paymentParams.nonceStr,
          package: paymentParams.package,
          signType: paymentParams.signType,
          paySign: paymentParams.paySign,
          success: function success(res) {
            console.log("支付成功:", res);
            resolve({
              success: true,
              result: res
            });
          },
          fail: function fail(err) {
            console.error("支付失败:", err);
            resolve({
              success: false,
              error: err
            });
          }
        });
      });
    },
    // 请求通知授权
    requestNotificationAuth: function requestNotificationAuth() {
      return new Promise( /*#__PURE__*/function () {
        var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(resolve) {
          var hasAuthorized;
          return _regenerator.default.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  // 先检查是否已经授权过
                  hasAuthorized = uni.getStorageSync("hasAuthorizedSubscription");
                  if (!(hasAuthorized === true)) {
                    _context3.next = 5;
                    break;
                  }
                  console.log("用户已经授权过订阅消息，跳过授权弹窗");
                  resolve(true);
                  return _context3.abrupt("return");
                case 5:
                  uni.showModal({
                    title: "开启消息通知",
                    content: "为了及时接收订单相关通知（送达、完成等），请授权接收订阅消息",
                    confirmText: "去授权",
                    cancelText: "暂不开启",
                    success: function success(res) {
                      if (res.confirm) {
                        wx.requestSubscribeMessage({
                          tmplIds: ["58VecsBQtioKWF8uBfXjhtSyX2MmzNcXqaZUQJk_oe4",
                          // 接单通知（发布者收）
                          "Buc3PRwms6j6QV5dPjzJwo0QmCGts5OU9x8TTxyhxc4",
                          // 送达通知（发布者收）
                          "e4Jkk2iypweLiPMBqQbWgbx189wjq3hZGG6An-_sS5A" // 完成通知（接单员收）
                          ],

                          success: function success(authRes) {
                            console.log("订阅消息授权结果:", authRes);
                            var acceptedCount = Object.values(authRes).filter(function (status) {
                              return status === "accept";
                            }).length;
                            if (acceptedCount > 0) {
                              // 保存授权状态
                              uni.setStorageSync("hasAuthorizedSubscription", true);
                              uni.setStorageSync("orderNotificationSetting", true);
                              uni.showToast({
                                title: "\u5DF2\u6388\u6743".concat(acceptedCount, "\u4E2A\u901A\u77E5"),
                                icon: "success"
                              });
                            } else {
                              uni.setStorageSync("hasAuthorizedSubscription", false);
                            }
                            resolve(true);
                          },
                          fail: function fail(err) {
                            console.log("订阅消息授权失败:", err);
                            resolve(false);
                          }
                        });
                      } else {
                        resolve(false);
                      }
                    }
                  });
                case 6:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    },
    confirmAccept: function confirmAccept() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var res, errorMessage;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log("订单确认页面 - confirmAccept: 开始处理", {
                  taskType: _this3.task.taskType,
                  borrowMode: _this3.task.borrowMode,
                  isRiderUser: _this3.isRiderUser,
                  isPublisher: _this3.isPublisher
                });

                // 检查是否是发布者
                if (!_this3.isPublisher) {
                  _context4.next = 5;
                  break;
                }
                console.log("订单确认页面 - confirmAccept: 用户是发布者，不能接单");
                uni.showToast({
                  title: _this3.getPublisherTipText(),
                  icon: "none"
                });
                return _context4.abrupt("return");
              case 5:
                if (_this3.isRiderUser) {
                  _context4.next = 9;
                  break;
                }
                console.log("订单确认页面 - confirmAccept: 用户不是接单员");
                uni.showModal({
                  title: "提示",
                  content: "您还未成为接单员，快去申请吧！",
                  confirmText: "去申请",
                  success: function success(res) {
                    if (res.confirm) {
                      uni.navigateTo({
                        url: "/subpages/profile/apply-rider"
                      });
                    }
                  }
                });
                return _context4.abrupt("return");
              case 9:
                _this3.isAccepting = true;
                _context4.prev = 10;
                _context4.next = 13;
                return _this3.requestNotificationAuth();
              case 13:
                if (!(_this3.task.taskType === "借物品" && _this3.task.borrowMode === "lend")) {
                  _context4.next = 18;
                  break;
                }
                console.log("订单确认页面 - confirmAccept: 调用借物品支付");
                _context4.next = 17;
                return _this3.handleBorrowPayment();
              case 17:
                return _context4.abrupt("return");
              case 18:
                _context4.next = 20;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this3.taskId, "/accept"),
                  method: "POST"
                });
              case 20:
                res = _context4.sent;
                if (res && res.message) {
                  uni.showToast({
                    title: "接单成功！",
                    icon: "success",
                    duration: 2000
                  });

                  // 接单成功后引导用户授权通知
                  setTimeout(function () {
                    _this3.requestNotificationAuth();
                  }, 1000);

                  // 延迟跳转到订单处理页面
                  setTimeout(function () {
                    uni.redirectTo({
                      url: "/subpages/task/task_process/task_process?id=".concat(_this3.taskId)
                    });
                  }, 3000);
                }
                _context4.next = 31;
                break;
              case 24:
                _context4.prev = 24;
                _context4.t0 = _context4["catch"](10);
                console.error("接单失败:", _context4.t0);

                // 增强错误信息处理
                errorMessage = "接单失败";
                if (_context4.t0 && _context4.t0.data) {
                  // 从响应数据中获取具体错误信息
                  if (_context4.t0.data.message) {
                    errorMessage = _context4.t0.data.message;
                  } else if (_context4.t0.data.error) {
                    errorMessage = _context4.t0.data.error;
                  } else if (typeof _context4.t0.data === "string") {
                    errorMessage = _context4.t0.data;
                  }
                } else if (_context4.t0 && _context4.t0.message) {
                  errorMessage = _context4.t0.message;
                }

                // 针对特定错误类型进行友好提示
                if (errorMessage.includes("自己") || errorMessage.includes("发布者")) {
                  errorMessage = "不能接自己发布的订单哦";
                } else if (errorMessage.includes("已接") || errorMessage.includes("assigned")) {
                  errorMessage = "该订单已被其他用户接单";
                } else if (errorMessage.includes("权限") || errorMessage.includes("permission")) {
                  errorMessage = "您没有接单权限，请先申请成为接单员";
                } else if (errorMessage.includes("状态") || errorMessage.includes("status")) {
                  errorMessage = "订单状态不允许接单";
                }
                uni.showToast({
                  title: errorMessage,
                  icon: "none",
                  duration: 3000
                });
              case 31:
                _context4.prev = 31;
                _this3.isAccepting = false;
                return _context4.finish(31);
              case 34:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[10, 24, 31, 34]]);
      }))();
    },
    getPublisherAvatar: function getPublisherAvatar() {
      return this.task && this.task.publisher && this.task.publisher.avatarUrl || "/static/images/default-avatar.png";
    },
    getPublisherName: function getPublisherName() {
      return this.task && this.task.publisher && this.task.publisher.nickname || "匿名用户";
    },
    cleanHtmlContent: function cleanHtmlContent(html) {
      if (!html) return "";
      // 移除所有HTML标签，只保留文本内容
      return html.replace(/<[^>]*>/g, "");
    },
    getGenderText: function getGenderText(gender) {
      if (gender === 1) return "男生";
      if (gender === 2) return "女生";
      return "未知";
    },
    formatOrderNumber: function formatOrderNumber(outOrderNo) {
      if (!outOrderNo) return "";
      // 去掉 ORDER 前缀，只保留数字部分
      var cleanOrderNo = outOrderNo.replace(/^ORDER\s*/, "");
      // 完整显示订单号
      return cleanOrderNo;
    },
    formatDateTime: function formatDateTime(dateTime) {
      if (!dateTime) return "";
      try {
        var date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          return dateTime;
        }
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        var hour = String(date.getHours()).padStart(2, "0");
        var minute = String(date.getMinutes()).padStart(2, "0");
        return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hour, ":").concat(minute);
      } catch (error) {
        return dateTime;
      }
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"]))

/***/ }),

/***/ 580:
/*!****************************************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue?vue&type=style&index=0&id=86ef1b9c&lang=scss&scoped=true& ***!
  \****************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_confirm.vue?vue&type=style&index=0&id=86ef1b9c&lang=scss&scoped=true& */ 581);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_confirm_vue_vue_type_style_index_0_id_86ef1b9c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 581:
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_confirm/task_confirm.vue?vue&type=style&index=0&id=86ef1b9c&lang=scss&scoped=true& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[574,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subpages/task/task_confirm/task_confirm.js.map