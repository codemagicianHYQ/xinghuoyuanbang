(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subpages/task/task_detail/task_detail"],{

/***/ 558:
/*!*************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/main.js?{"page":"subpages%2Ftask%2Ftask_detail%2Ftask_detail"} ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _task_detail = _interopRequireDefault(__webpack_require__(/*! ./subpages/task/task_detail/task_detail.vue */ 559));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_task_detail.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 559:
/*!****************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./task_detail.vue?vue&type=template&id=7e5ace0a&scoped=true& */ 560);
/* harmony import */ var _task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./task_detail.vue?vue&type=script&lang=js& */ 562);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./task_detail.vue?vue&type=style&index=0&id=7e5ace0a&lang=scss&scoped=true& */ 564);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 48);

var renderjs





/* normalize component */

var component = Object(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "7e5ace0a",
  null,
  false,
  _task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "subpages/task/task_detail/task_detail.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 560:
/*!***********************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue?vue&type=template&id=7e5ace0a&scoped=true& ***!
  \***********************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_detail.vue?vue&type=template&id=7e5ace0a&scoped=true& */ 561);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_template_id_7e5ace0a_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 561:
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue?vue&type=template&id=7e5ace0a&scoped=true& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
    _vm.task && _vm.task.id
      ? _vm.taskTypeLabel(_vm.task.taskType || _vm.task.type)
      : null
  var m1 =
    _vm.task &&
    _vm.task.id &&
    _vm.task.taskType === "借物品" &&
    _vm.task.borrowMode === "lend"
      ? _vm.getAvailableTimeRange() || "未设置"
      : null
  var m2 =
    _vm.task &&
    _vm.task.id &&
    _vm.task.taskType === "借物品" &&
    !(_vm.task.borrowMode === "lend")
      ? _vm.getBorrowTimeRange() || "未设置"
      : null
  var m3 =
    _vm.task &&
    _vm.task.id &&
    !(_vm.task.taskType === "借物品") &&
    _vm.task.deadline
      ? _vm.formatDeadline(_vm.task.deadline)
      : null
  var m4 =
    _vm.task && _vm.task.id && _vm.task.description
      ? _vm.cleanHtmlContent(_vm.task.description)
      : null
  var g0 =
    _vm.task && _vm.task.id
      ? _vm.task.confirmImages && _vm.task.confirmImages.length > 0
      : null
  var g1 =
    _vm.task && _vm.task.id ? _vm.task.remarks && _vm.task.remarks.trim() : null
  var m5 = _vm.task && _vm.task.id ? _vm.getTaskLocation(_vm.task) : null
  var m6 =
    _vm.task && _vm.task.id && _vm.task.publisher && _vm.task.publisher.gender
      ? _vm.getGenderText(_vm.task.publisher.gender)
      : null
  var m7 =
    _vm.task && _vm.task.id && _vm.task.acceptor && _vm.task.acceptor.gender
      ? _vm.getGenderText(_vm.task.acceptor.gender)
      : null
  var m8 =
    _vm.task &&
    _vm.task.id &&
    _vm.task.requiredGender !== undefined &&
    _vm.task.requiredGender !== 0
      ? _vm.getGenderText(_vm.task.requiredGender)
      : null
  var m9 = _vm.task && _vm.task.id ? _vm.getOrderNumberDisplay() : null
  var m10 =
    _vm.task && _vm.task.id && _vm.task.createdAt
      ? _vm.formatDateTime(_vm.task.createdAt)
      : null
  var m11 =
    _vm.task && _vm.task.id && _vm.task.acceptedAt
      ? _vm.formatDateTime(_vm.task.acceptedAt)
      : null
  var m12 =
    _vm.task && _vm.task.id && _vm.task.publisherConfirmedTime
      ? _vm.formatDateTime(_vm.task.publisherConfirmedTime)
      : null
  var m13 =
    _vm.task &&
    _vm.task.id &&
    _vm.task &&
    _vm.task.status === "open" &&
    !_vm.isPublisher
      ? _vm.getBorrowButtonText(_vm.task)
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
        g0: g0,
        g1: g1,
        m5: m5,
        m6: m6,
        m7: m7,
        m8: m8,
        m9: m9,
        m10: m10,
        m11: m11,
        m12: m12,
        m13: m13,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 562:
/*!*****************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_detail.vue?vue&type=script&lang=js& */ 563);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 563:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue?vue&type=script&lang=js& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ 13));
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
      isLoading: false,
      afterSalesInfo: null,
      // 售后申请信息
      statusTextMap: {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "等待发布者确认",
        publisher_confirmed: "已完成",
        completed: "已完成",
        cancelled: "已取消"
      },
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
    // 是否为接单员
    isAcceptor: function isAcceptor() {
      return this.userInfo && this.task && this.userInfo.id === this.task.acceptorId;
    },
    // 判断是否应该显示图片
    shouldShowImages: function shouldShowImages() {
      var _this$userInfo;
      if (!this.task) {
        return false;
      }
      if (this.task.isVirtualOrder) {
        return false;
      }
      if (!this.task.images || this.task.images.length === 0) {
        return false;
      }

      // 调试信息
      console.log("shouldShowImages 调试信息:", {
        taskType: this.task.taskType,
        isPublisher: this.isPublisher,
        isAcceptor: this.isAcceptor,
        taskStatus: this.task.status,
        userId: (_this$userInfo = this.userInfo) === null || _this$userInfo === void 0 ? void 0 : _this$userInfo.id,
        publisherId: this.task.publisherId,
        acceptorId: this.task.acceptorId
      });

      // 借物品任务的图片所有人都可见
      if (this.task.taskType === "借物品") {
        return true;
      }

      // 其他任务的图片按原逻辑显示
      // 如果是发布者，总是可见
      if (this.isPublisher) {
        console.log("发布者可见图片");
        return true;
      }

      // 如果任务已接单，接单员可见
      if (this.task.status === "assigned" || this.task.status === "acceptor_done" || this.task.status === "publisher_confirmed" || this.task.status === "completed") {
        console.log("任务已接单，接单员可见");
        return true;
      }

      // 未接单时，只有发布者可见
      console.log("未接单，非发布者，不可见");
      return false;
    },
    // 是否有售后申请
    hasAfterSales: function hasAfterSales() {
      return this.afterSalesInfo !== null && this.afterSalesInfo.status !== "cancelled";
    },
    // 售后申请状态
    afterSalesStatus: function afterSalesStatus() {
      return this.afterSalesInfo ? this.afterSalesInfo.status : null;
    },
    // 是否可以撤销售后申请
    canCancelAfterSales: function canCancelAfterSales() {
      return this.afterSalesInfo && this.afterSalesInfo.status === "pending";
    },
    // 判断是否应该显示确认凭证图片
    shouldShowConfirmImages: function shouldShowConfirmImages() {
      if (!this.task || !this.task.confirmImages || this.task.confirmImages.length === 0) {
        return false;
      }

      // 确认凭证图片只有发布者和接单员可见
      // 如果是发布者，总是可见
      if (this.isPublisher) {
        return true;
      }

      // 如果是接单员，总是可见
      if (this.isAcceptor) {
        return true;
      }

      // 其他情况不可见
      return false;
    },
    // 格式化任务详情显示，处理借用时长undefined问题
    formattedSpecifics: function formattedSpecifics() {
      if (!this.task || !this.task.specifics) return "";
      var specifics = this.task.specifics;

      // 调试信息 - 查看原始数据
      console.log("原始 specifics:", specifics);
      console.log("任务类型:", this.task.taskType);

      // 处理敏感信息的可见性
      specifics = this.processSensitiveInfo(specifics);

      // 处理包裹大小的替换
      specifics = specifics.replace(/包裹大小: small/g, "包裹大小: 小件").replace(/包裹大小: medium/g, "包裹大小: 中件").replace(/包裹大小: large/g, "包裹大小: 大件");

      // 处理借用时长undefined的问题
      if (this.task.taskType === "借物品") {
        console.log("检测到借物品任务，开始处理借用时长");

        // 更全面的undefined检测，包括直接的文本"undefined"
        var hasUndefinedDuration = specifics.includes("借用时长: undefined") || specifics.includes("借用时长：undefined") || specifics.includes("借用时长:undefined") || specifics.includes("借用时长：undefined") || specifics.includes("undefined") ||
        // 更宽泛的检测
        /借用时长[：:\s]*undefined/.test(specifics);
        console.log("是否包含undefined借用时长:", hasUndefinedDuration);
        if (hasUndefinedDuration) {
          console.log("发现undefined，开始提取日期");

          // 先尝试从开始日期和归还日期计算
          var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
          var returnDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);

          // 如果没有找到"开始日期"，尝试"借用日期"
          if (!startDateMatch) {
            startDateMatch = specifics.match(/借用日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
          }

          // 如果还没有找到，尝试从任务的其他字段获取
          if (!startDateMatch || !returnDateMatch) {
            // 检查任务的其他字段
            if (this.task.startDate) {
              startDateMatch = [null, this.task.startDate.split("T")[0]];
            }
            if (this.task.endDate) {
              returnDateMatch = [null, this.task.endDate.split("T")[0]];
            }
            if (this.task.deadline) {
              returnDateMatch = [null, this.task.deadline.split("T")[0]];
            }
          }
          console.log("开始日期匹配:", startDateMatch);
          console.log("归还日期匹配:", returnDateMatch);
          if (startDateMatch && returnDateMatch) {
            var startDate = new Date(startDateMatch[1]);
            var returnDate = new Date(returnDateMatch[1]);
            console.log("开始日期:", startDate);
            console.log("归还日期:", returnDate);
            if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
              var diffTime = Math.abs(returnDate - startDate);
              var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              console.log("计算得出天数:", diffDays);

              // 更全面的替换，处理各种可能的格式
              specifics = specifics.replace(/借用时长[：:]\s*undefined/g, "\u501F\u7528\u65F6\u957F: ".concat(diffDays, "\u5929")).replace(/借用时长[：:]\s*undefined天/g, "\u501F\u7528\u65F6\u957F: ".concat(diffDays, "\u5929")).replace(/undefined/g, "".concat(diffDays, "\u5929")); // 直接替换undefined

              console.log("替换后的 specifics:", specifics);
            }
          } else {
            console.log("无法提取日期，使用默认值");
            // 如果无法从日期计算，直接替换为默认值
            specifics = specifics.replace(/借用时长[：:]\s*undefined/g, "借用时长: 请联系发布者确认").replace(/undefined/g, "请联系发布者确认");
          }
        }
      }
      return specifics;
    },
    // 单独计算借用时长信息
    borrowDurationInfo: function borrowDurationInfo() {
      if (!this.task || this.task.taskType !== "借物品" || !this.task.specifics) {
        return null;
      }
      var specifics = this.task.specifics;
      console.log("借用时长计算: 任务详情", specifics);

      // 尝试提取开始日期和归还日期
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      var returnDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      console.log("借用时长计算: 开始日期匹配", startDateMatch);
      console.log("借用时长计算: 归还日期匹配", returnDateMatch);
      if (startDateMatch && returnDateMatch) {
        var startDate = new Date(startDateMatch[1]);
        var returnDate = new Date(returnDateMatch[1]);
        console.log("借用时长计算: 开始日期对象", startDate);
        console.log("借用时长计算: 归还日期对象", returnDate);
        if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
          var diffTime = returnDate - startDate;
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          console.log("借用时长计算: 时间差(毫秒)", diffTime);
          console.log("借用时长计算: 计算天数", diffDays);
          return "".concat(diffDays, "\u5929 (").concat(startDateMatch[1], " \u81F3 ").concat(returnDateMatch[1], ")");
        }
      }
      return null;
    },
    showTaskImagesSection: function showTaskImagesSection() {
      if (!this.task) {
        return false;
      }
      if (this.task.isVirtualOrder) {
        return true;
      }
      return Array.isArray(this.task.images) && this.task.images.length > 0;
    }
  }),
  onLoad: function onLoad(options) {
    // 检查用户登录状态
    var token = uni.getStorageSync("userAuthToken_xh");
    if (!token) {
      uni.showModal({
        title: "请先登录",
        content: "您需要先登录才能查看任务详情",
        showCancel: false,
        confirmText: "去登录",
        success: function success() {
          uni.navigateTo({
            url: "/pages/login/login"
          });
        }
      });
      return;
    }

    // 支持多种参数名：id, taskId, orderId, orderNumber
    this.taskId = options.id || options.taskId || options.orderId;
    var orderNumber = options.orderNumber;
    console.log("🔍 任务详情页面 - 接收到的参数:", options);
    console.log("🔍 任务详情页面 - 解析后的taskId:", this.taskId, "类型:", (0, _typeof2.default)(this.taskId));
    console.log("🔍 任务详情页面 - 订单号:", orderNumber);
    console.log("🔍 任务详情页面 - 参数检查:", {
      hasId: !!options.id,
      hasTaskId: !!options.taskId,
      hasOrderId: !!options.orderId,
      hasOrderNumber: !!options.orderNumber
    });
    if (this.taskId) {
      // 先获取任务信息，检查是否为学习伙伴任务
      this.checkTaskTypeAndRedirect();
    } else if (orderNumber) {
      // 如果有订单号，先通过订单号查找任务
      this.findTaskByOrderNumber(orderNumber);
    } else {
      console.error("任务详情页面 - 无效的任务ID，参数:", options);
      uni.showToast({
        title: "无效的任务ID",
        icon: "none"
      });
      uni.navigateBack();
    }
  },
  onShow: function onShow() {
    // 每次页面显示时刷新数据，确保从编辑页面返回时显示最新内容
    if (this.taskId) {
      this.fetchTaskDetail();
      this.fetchAfterSalesInfo();
    }
  },
  methods: {
    // 处理敏感信息的可见性
    processSensitiveInfo: function processSensitiveInfo(specifics) {
      var _this$userInfo2;
      if (!specifics) return specifics;

      // 调试信息
      console.log("processSensitiveInfo 调试信息:", {
        isPublisher: this.isPublisher,
        isAcceptor: this.isAcceptor,
        taskStatus: this.task.status,
        userId: (_this$userInfo2 = this.userInfo) === null || _this$userInfo2 === void 0 ? void 0 : _this$userInfo2.id,
        publisherId: this.task.publisherId,
        acceptorId: this.task.acceptorId
      });

      // 定义敏感信息字段
      var sensitiveFields = ["取件码", "取件地址", "联系电话", "手机号", "验证码", "密码", "身份证号"];

      // 如果是发布者或接单员，显示所有信息
      if (this.isPublisher || this.isAcceptor) {
        console.log("发布者或接单员，显示所有信息");
        return specifics;
      }

      // 如果任务已完成，显示所有信息
      if (this.task.status === "completed" || this.task.status === "publisher_confirmed") {
        console.log("任务已完成，显示所有信息");
        return specifics;
      }

      // 其他情况，隐藏敏感信息
      console.log("隐藏敏感信息");
      var processedSpecifics = specifics;
      sensitiveFields.forEach(function (field) {
        // 匹配 "字段名: 值" 格式
        var regex = new RegExp("".concat(field, "[\uFF1A:]\\s*([^\\n\\r]+)"), "g");
        processedSpecifics = processedSpecifics.replace(regex, "".concat(field, ": [\u4EC5\u53D1\u5E03\u8005\u548C\u63A5\u5355\u5458\u53EF\u89C1]"));
      });
      return processedSpecifics;
    },
    // 预览图片
    previewImage: function previewImage(current, index) {
      if (!this.task || !this.task.images || this.task.images.length === 0) {
        return;
      }
      uni.previewImage({
        current: index,
        urls: this.task.images
      });
    },
    // 预览确认凭证图片
    previewConfirmImage: function previewConfirmImage(current, index) {
      if (!this.task || !this.task.confirmImages || this.task.confirmImages.length === 0) {
        return;
      }
      uni.previewImage({
        current: index,
        urls: this.task.confirmImages
      });
    },
    taskTypeLabel: function taskTypeLabel(type) {
      var map = {
        取快递: "取快递",
        帮我买: "帮我买",
        取奶茶: "取奶茶/咖啡",
        "取奶茶/咖啡": "取奶茶/咖啡",
        代上课: "代上课",
        校园跑腿: "校园跑腿",
        其他服务: "其他服务",
        借物品: "借物品",
        express: "取快递",
        buy: "帮我买",
        tea_coffee: "取奶茶/咖啡",
        class_attendance: "代上课",
        campus_errand: "校园跑腿",
        other: "其他服务",
        borrow: "借物品",
        lend: "借物品"
      };
      if (!type) {
        return "未知类型";
      }
      return map[type] || type;
    },
    // 通过订单号查找任务
    findTaskByOrderNumber: function findTaskByOrderNumber(orderNumber) {
      var _this = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var res;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                console.log("通过订单号查找任务:", orderNumber);
                _context.next = 4;
                return (0, _request.default)({
                  url: "/tasks/order/".concat(orderNumber),
                  method: "GET"
                });
              case 4:
                res = _context.sent;
                console.log("通过订单号查找到的任务:", res);
                if (res && res.id) {
                  // 找到任务，设置taskId并继续正常流程
                  _this.taskId = res.id;
                  _this.checkTaskTypeAndRedirect();
                } else {
                  uni.showToast({
                    title: "未找到对应的任务",
                    icon: "none"
                  });
                  uni.navigateBack();
                }
                _context.next = 14;
                break;
              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                console.error("通过订单号查找任务失败:", _context.t0);
                uni.showToast({
                  title: "查找任务失败",
                  icon: "none"
                });
                uni.navigateBack();
              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 9]]);
      }))();
    },
    // 检查任务类型并重定向
    checkTaskTypeAndRedirect: function checkTaskTypeAndRedirect() {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var res;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                console.log("🔍 开始检查任务类型，taskId:", _this2.taskId, "类型:", (0, _typeof2.default)(_this2.taskId));
                console.log("🔍 API请求URL:", "/tasks/".concat(_this2.taskId));
                _context2.next = 5;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this2.taskId),
                  method: "GET"
                });
              case 5:
                res = _context2.sent;
                console.log("🔍 获取到的任务信息:", res);
                console.log("🔍 任务类型:", res === null || res === void 0 ? void 0 : res.taskType);

                // 后端直接返回任务对象，检查taskType字段
                if (!(res && res.taskType === "学习伙伴")) {
                  _context2.next = 12;
                  break;
                }
                console.log("检测到学习伙伴任务，重定向到专用详情页面");
                // 如果是学习伙伴任务，直接跳转到专用的学习伙伴详情页面
                uni.redirectTo({
                  url: "/subpages/campus-interact/detail?id=".concat(_this2.taskId)
                });
                return _context2.abrupt("return");
              case 12:
                console.log("非学习伙伴任务，继续正常流程");
                // 如果不是学习伙伴任务，继续正常的加载流程
                _this2.fetchTaskDetail();
                _this2.ensureUserInfoLoaded();
                _context2.next = 22;
                break;
              case 17:
                _context2.prev = 17;
                _context2.t0 = _context2["catch"](0);
                console.error("检查任务类型失败:", _context2.t0);
                // 如果检查失败，显示错误并返回
                uni.showToast({
                  title: "获取任务信息失败",
                  icon: "none"
                });
                setTimeout(function () {
                  uni.navigateBack();
                }, 1500);
              case 22:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 17]]);
      }))();
    },
    fetchTaskDetail: function fetchTaskDetail() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var res;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _this3.isLoading = true;
                _context3.prev = 1;
                _context3.next = 4;
                return (0, _request.default)({
                  url: "/tasks/".concat(_this3.taskId),
                  method: "GET"
                });
              case 4:
                res = _context3.sent;
                // 确保数据完整性
                if (res && res.id) {
                  console.log("任务详情页面 - 设置task前的状态:", _this3.task ? _this3.task.status : "null");
                  _this3.task = res;
                  console.log("任务详情页面 - 设置task后的状态:", _this3.task.status);
                  console.log("任务详情页面 - 获取到的任务信息:", res);
                  console.log("任务详情页面 - 任务状态:", res.status);
                  console.log("任务详情页面 - 发布者ID:", res.publisherId);
                  console.log("任务详情页面 - 发布者信息:", res.publisher);
                  console.log("任务详情页面 - 当前用户信息:", _this3.userInfo);
                  console.log("任务详情页面 - 是否为发布者:", _this3.isPublisher);
                  console.log("任务详情页面 - out_trade_no:", res.out_trade_no);
                  console.log("任务详情页面 - borrowMode:", res.borrowMode);
                  console.log("任务详情页面 - specifics:", res.specifics);
                  console.log("任务详情页面 - 订单号格式化后:", _this3.formatOrderNumber(res.out_trade_no));

                  // 强制触发重新渲染
                  _this3.$nextTick(function () {
                    console.log("任务详情页面 - nextTick后的状态:", _this3.task.status);
                  });
                } else {
                  console.error("任务详情页面 - 返回数据不完整:", res);
                  uni.showToast({
                    title: "任务数据不完整",
                    icon: "none"
                  });
                }
                _context3.next = 12;
                break;
              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](1);
                console.error("获取任务详情失败:", _context3.t0);
                uni.showToast({
                  title: "加载失败",
                  icon: "none"
                });
              case 12:
                _context3.prev = 12;
                _this3.isLoading = false;
                return _context3.finish(12);
              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[1, 8, 12, 15]]);
      }))();
    },
    getStatusDisplay: function getStatusDisplay(task) {
      console.log("getStatusDisplay - 输入task:", task);
      if (!task) {
        return "加载中...";
      }
      var status = task.status;
      console.log("getStatusDisplay - 原始状态:", status, "类型:", (0, _typeof2.default)(status));
      if (!status || status === "undefined" || status === "null") {
        return "待接单";
      }
      var statusMap = {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "等待发布者确认",
        publisher_confirmed: "已完成",
        completed: "已完成",
        cancelled: "已取消"
      };
      var result = statusMap[status] || status || "未知";
      console.log("getStatusDisplay - 输出结果:", result);
      return result;
    },
    getMetaText: function getMetaText() {
      if (!this.task) {
        return "类型: 加载中 | 状态: 加载中";
      }
      var taskType = this.task.taskType || this.task.type || "未知";
      var status = this.statusTextMap[this.task.status] || "未知";
      return "\u7C7B\u578B: ".concat(taskType, " | \u72B6\u6001: ").concat(status);
    },
    formatDeadline: function formatDeadline(deadline) {
      if (!deadline) return "";
      var date = new Date(deadline);

      // 将截止时间往后延长30分钟（自动取消时间）
      var autoCancelTime = new Date(date.getTime() + 30 * 60 * 1000);
      var month = (autoCancelTime.getMonth() + 1).toString().padStart(2, "0");
      var day = autoCancelTime.getDate().toString().padStart(2, "0");
      var hour = autoCancelTime.getHours().toString().padStart(2, "0");
      var minute = autoCancelTime.getMinutes().toString().padStart(2, "0");
      return "".concat(month, "/").concat(day, " ").concat(hour, ":").concat(minute);
    },
    // 获取借物品按钮文本
    getBorrowButtonText: function getBorrowButtonText(task) {
      if (task.taskType !== "借物品") {
        return "立即接单";
      }

      // 根据借物品的借出/借进模式显示不同按钮
      if (task.borrowMode === "lend") {
        return "我要借";
      } else if (task.borrowMode === "borrow") {
        return "借给Ta";
      }

      // 默认情况
      return "立即接单";
    },
    // 从任务详情中解析押金金额
    getDepositAmount: function getDepositAmount() {
      if (!this.task || !this.task.specifics) {
        var _this$task;
        console.log("getDepositAmount: 任务或详情为空", {
          task: this.task,
          specifics: (_this$task = this.task) === null || _this$task === void 0 ? void 0 : _this$task.specifics
        });
        return "0";
      }
      var specifics = this.task.specifics;
      console.log("getDepositAmount: 解析specifics", specifics);
      var depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log("getDepositAmount: 押金匹配结果", depositMatch);
      return depositMatch ? depositMatch[1] : "0";
    },
    // 从任务详情中解析日租金金额
    getDailyRentAmount: function getDailyRentAmount() {
      if (!this.task || !this.task.specifics) {
        console.log("getDailyRentAmount: 任务或详情为空");
        return "0";
      }
      var specifics = this.task.specifics;
      console.log("getDailyRentAmount: 解析specifics", specifics);
      var rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log("getDailyRentAmount: 日租金匹配结果", rentMatch);
      return rentMatch ? rentMatch[1] : "0";
    },
    // 计算总费用（押金 + 租金）
    getTotalCost: function getTotalCost() {
      var deposit = parseFloat(this.getDepositAmount()) || 0;
      var dailyRent = parseFloat(this.getDailyRentAmount()) || 0;

      // 计算借用天数
      var days = this.getBorrowDays();
      var totalRent = dailyRent * days;
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
      console.log("任务详情页面 - 借用天数计算:", {
        startDate: this.borrowStartDate,
        endDate: this.borrowEndDate,
        days: this.borrowDays
      });
    },
    // 获取借出者提供的可用时间段
    getAvailableTimeRange: function getAvailableTimeRange() {
      if (!this.task || !this.task.specifics) return null;
      var specifics = this.task.specifics;
      console.log("任务详情页面 - getAvailableTimeRange: 解析specifics", specifics);

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
      console.log("任务详情页面 - getAvailableTimeRange: 开始日期匹配", startDateMatch);
      console.log("任务详情页面 - getAvailableTimeRange: 结束日期匹配", endDateMatch);
      if (startDateMatch && endDateMatch) {
        return "".concat(startDateMatch[1], " \u81F3 ").concat(endDateMatch[1]);
      }
      return null;
    },
    // 获取借进模式的借用时间段
    getBorrowTimeRange: function getBorrowTimeRange() {
      if (!this.task || !this.task.specifics) return null;
      var specifics = this.task.specifics;
      console.log("任务详情页面 - getBorrowTimeRange: 解析specifics", specifics);

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
      console.log("任务详情页面 - getBorrowTimeRange: 开始日期匹配", startDateMatch);
      console.log("任务详情页面 - getBorrowTimeRange: 结束日期匹配", endDateMatch);
      if (startDateMatch && endDateMatch) {
        return "".concat(startDateMatch[1], " \u81F3 ").concat(endDateMatch[1]);
      }
      return null;
    },
    // 获取可借用天数
    getAvailableDays: function getAvailableDays() {
      if (!this.task || !this.task.specifics) return 0;
      var specifics = this.task.specifics;
      console.log("任务详情页面 - getAvailableDays: 解析specifics", specifics);

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
      console.log("任务详情页面 - getAvailableDays: 开始日期匹配", startDateMatch);
      console.log("任务详情页面 - getAvailableDays: 结束日期匹配", endDateMatch);
      if (startDateMatch && endDateMatch) {
        var startDate = new Date(startDateMatch[1]);
        var endDate = new Date(endDateMatch[1]);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          var diffTime = Math.abs(endDate - startDate);
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期
          console.log("任务详情页面 - getAvailableDays: 计算天数", diffDays);
          return diffDays;
        }
      }
      console.log("任务详情页面 - getAvailableDays: 未匹配到有效日期，返回0");
      return 0;
    },
    // 获取可用开始日期
    getAvailableStartDate: function getAvailableStartDate() {
      if (!this.task || !this.task.specifics) return new Date().toISOString().split("T")[0];
      var specifics = this.task.specifics;
      console.log("任务详情页面 - getAvailableStartDate: 解析specifics", specifics);

      // 尝试多种匹配模式
      var startDateMatch = specifics.match(/开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("任务详情页面 - getAvailableStartDate: 开始日期匹配结果", startDateMatch);
      if (startDateMatch) {
        console.log("任务详情页面 - getAvailableStartDate: 返回开始日期", startDateMatch[1]);
        return startDateMatch[1];
      }
      console.log("任务详情页面 - getAvailableStartDate: 未匹配到开始日期，返回今天");
      return new Date().toISOString().split("T")[0];
    },
    // 获取可用结束日期
    getAvailableEndDate: function getAvailableEndDate() {
      if (!this.task || !this.task.specifics) return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      var specifics = this.task.specifics;
      console.log("任务详情页面 - getAvailableEndDate: 解析specifics", specifics);

      // 尝试多种匹配模式
      var endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(/可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log("任务详情页面 - getAvailableEndDate: 结束日期匹配结果", endDateMatch);
      if (endDateMatch) {
        console.log("任务详情页面 - getAvailableEndDate: 返回结束日期", endDateMatch[1]);
        return endDateMatch[1];
      }
      console.log("任务详情页面 - getAvailableEndDate: 未匹配到结束日期，返回一年后");
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    },
    acceptTask: function acceptTask() {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var currentUserInfo, isRider, refreshedUserInfo, updatedIsRider;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(_this4.task && _this4.task.taskType === "学习伙伴")) {
                  _context4.next = 3;
                  break;
                }
                uni.showToast({
                  title: "学习伙伴活动请使用专用加入功能",
                  icon: "none"
                });
                return _context4.abrupt("return");
              case 3:
                // 获取当前用户信息
                currentUserInfo = _this4.userInfo || _this4.$store.state.userInfo;
                console.log("任务详情页面 - 当前用户信息:", currentUserInfo);

                // 检查是否为接单员
                isRider = currentUserInfo && (currentUserInfo.role === "rider" || currentUserInfo.riderApplicationStatus === "approved");
                console.log("任务详情页面 - 用户角色:", currentUserInfo && currentUserInfo.role);
                console.log("任务详情页面 - 接单员申请状态:", currentUserInfo && currentUserInfo.riderApplicationStatus);
                console.log("任务详情页面 - 是否为接单员:", isRider);

                // 如果用户信息不完整，尝试重新获取
                if (!(!currentUserInfo || !currentUserInfo.role && !currentUserInfo.riderApplicationStatus)) {
                  _context4.next = 32;
                  break;
                }
                console.log("任务详情页面 - 用户信息不完整，尝试重新获取");
                _context4.prev = 11;
                _context4.next = 14;
                return _this4.$store.dispatch("fetchCurrentUserInfo");
              case 14:
                refreshedUserInfo = _context4.sent;
                console.log("任务详情页面 - 重新获取的用户信息:", refreshedUserInfo);

                // 重新检查权限
                updatedIsRider = refreshedUserInfo && (refreshedUserInfo.role === "rider" || refreshedUserInfo.riderApplicationStatus === "approved");
                console.log("任务详情页面 - 重新检查 - 用户角色:", refreshedUserInfo && refreshedUserInfo.role);
                console.log("任务详情页面 - 重新检查 - 接单员申请状态:", refreshedUserInfo && refreshedUserInfo.riderApplicationStatus);
                console.log("任务详情页面 - 重新检查 - 是否为接单员:", updatedIsRider);
                if (updatedIsRider) {
                  _context4.next = 23;
                  break;
                }
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
              case 23:
                _context4.next = 30;
                break;
              case 25:
                _context4.prev = 25;
                _context4.t0 = _context4["catch"](11);
                console.error("任务详情页面 - 重新获取用户信息失败:", _context4.t0);
                uni.showToast({
                  title: "获取用户信息失败",
                  icon: "none"
                });
                return _context4.abrupt("return");
              case 30:
                _context4.next = 35;
                break;
              case 32:
                if (isRider) {
                  _context4.next = 35;
                  break;
                }
                // 用户信息完整但不是接单员
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
              case 35:
                // 跳转到订单确认页面
                uni.navigateTo({
                  url: "/subpages/task/task_confirm/task_confirm?id=".concat(_this4.taskId)
                });
              case 36:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[11, 25]]);
      }))();
    },
    goToAfterSales: function goToAfterSales() {
      // 检查任务类型，学习伙伴任务不应该跳转到售后页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动不支持售后功能",
          icon: "none"
        });
        return;
      }
      uni.navigateTo({
        url: "/pages/after_sales/after_sales?id=".concat(this.taskId)
      });
    },
    // 获取售后申请信息
    fetchAfterSalesInfo: function fetchAfterSalesInfo() {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var res, taskAfterSales;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (_this5.taskId) {
                  _context5.next = 2;
                  break;
                }
                return _context5.abrupt("return");
              case 2:
                _context5.prev = 2;
                _context5.next = 5;
                return (0, _request.default)({
                  url: "/after-sales/user",
                  method: "GET"
                });
              case 5:
                res = _context5.sent;
                if (res && res.success && res.data && res.data.list && res.data.list.length > 0) {
                  // 从用户的售后申请列表中查找该任务的申请
                  taskAfterSales = res.data.list.find(function (item) {
                    return item.taskId == _this5.taskId;
                  });
                  if (taskAfterSales) {
                    _this5.afterSalesInfo = taskAfterSales;
                    _this5.$forceUpdate();
                  } else {
                    _this5.afterSalesInfo = null;
                  }
                } else {
                  _this5.afterSalesInfo = null;
                }
                _context5.next = 13;
                break;
              case 9:
                _context5.prev = 9;
                _context5.t0 = _context5["catch"](2);
                console.error("获取售后申请信息失败:", _context5.t0);
                _this5.afterSalesInfo = null;
              case 13:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[2, 9]]);
      }))();
    },
    // 查看售后申请
    viewAfterSales: function viewAfterSales() {
      if (!this.afterSalesInfo) return;
      uni.navigateTo({
        url: "/pages/after_sales/after_sales?id=".concat(this.taskId, "&view=true")
      });
    },
    // 撤销售后申请
    cancelAfterSales: function cancelAfterSales() {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (_this6.afterSalesInfo) {
                  _context7.next = 2;
                  break;
                }
                return _context7.abrupt("return");
              case 2:
                try {
                  uni.showModal({
                    title: "确认撤销",
                    content: "确定要撤销售后申请吗？",
                    success: function () {
                      var _success = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(res) {
                        var result;
                        return _regenerator.default.wrap(function _callee6$(_context6) {
                          while (1) {
                            switch (_context6.prev = _context6.next) {
                              case 0:
                                if (!res.confirm) {
                                  _context6.next = 5;
                                  break;
                                }
                                _context6.next = 3;
                                return (0, _request.default)({
                                  url: "/after-sales/".concat(_this6.afterSalesInfo.id, "/cancel"),
                                  method: "PUT"
                                });
                              case 3:
                                result = _context6.sent;
                                if (result && result.success) {
                                  uni.showToast({
                                    title: "撤销成功",
                                    icon: "success"
                                  });
                                  // 延迟一下再返回，让用户看到成功提示
                                  setTimeout(function () {
                                    uni.switchTab({
                                      url: "/pages/tasks"
                                    });
                                  }, 1500);
                                } else {
                                  uni.showToast({
                                    title: "撤销失败",
                                    icon: "none"
                                  });
                                }
                              case 5:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, _callee6);
                      }));
                      function success(_x) {
                        return _success.apply(this, arguments);
                      }
                      return success;
                    }()
                  });
                } catch (error) {
                  console.error("撤销售后申请失败:", error);
                  uni.showToast({
                    title: "撤销失败",
                    icon: "none"
                  });
                }
              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }))();
    },
    ensureUserInfoLoaded: function ensureUserInfoLoaded() {
      var _this7 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!(!_this7.userInfo || !_this7.userInfo.id)) {
                  _context8.next = 11;
                  break;
                }
                console.log("任务详情页面 - 用户信息未加载，尝试重新获取");
                _context8.prev = 2;
                _context8.next = 5;
                return _this7.$store.dispatch("fetchCurrentUserInfo");
              case 5:
                console.log("任务详情页面 - 用户信息重新获取完成");
                _context8.next = 11;
                break;
              case 8:
                _context8.prev = 8;
                _context8.t0 = _context8["catch"](2);
                console.error("任务详情页面 - 获取用户信息失败:", _context8.t0);
              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[2, 8]]);
      }))();
    },
    editTask: function editTask() {
      // 检查任务类型，学习伙伴任务不应该跳转到编辑任务页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用编辑功能",
          icon: "none"
        });
        return;
      }

      // 跳转到编辑任务页面
      uni.navigateTo({
        url: "/subpages/task/task_edit/task_edit?id=".concat(this.taskId)
      });
    },
    cancelTask: function cancelTask() {
      console.log("点击取消订单按钮，taskId:", this.taskId);

      // 直接跳转到取消订单页面，让取消订单页面自己处理数据获取
      try {
        console.log("准备跳转到订单取消页面，taskId:", this.taskId);
        uni.navigateTo({
          url: "/subpages/task/task_cancel/task_cancel?orderId=".concat(this.taskId),
          success: function success() {
            console.log("跳转成功");
          },
          fail: function fail(error) {
            console.error("跳转失败:", error);
            uni.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        console.error("跳转取消页面失败:", error);
        uni.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    },
    contactAcceptor: function contactAcceptor() {
      // 跳转到聊天页面联系接单员
      if (this.task && this.task.acceptor) {
        uni.navigateTo({
          url: "/pages/chat/chat?taskId=".concat(this.taskId, "&otherUserId=").concat(this.task.acceptor.id, "&title=").concat(encodeURIComponent("\u8054\u7CFB\u63A5\u5355\u5458 - ".concat(this.task.title)))
        });
      } else {
        uni.showToast({
          title: "接单员信息不完整",
          icon: "none"
        });
      }
    },
    processTask: function processTask() {
      // 检查任务类型，学习伙伴任务不应该跳转到订单处理页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用处理功能",
          icon: "none"
        });
        return;
      }

      // 跳转到订单处理页面
      uni.navigateTo({
        url: "/subpages/task/task_process/task_process?id=".concat(this.taskId)
      });
    },
    confirmTaskComplete: function confirmTaskComplete() {
      var _this8 = this;
      // 检查任务类型，学习伙伴任务不应该使用确认完成逻辑
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用完成功能",
          icon: "none"
        });
        return;
      }

      // 发布者确认完成任务
      var confirmContent = "确定要确认此任务已完成吗？确认后将打款给接单员。";

      // 借物品任务根据模式显示不同内容
      if (this.task && this.task.taskType === "借物品") {
        if (this.task.borrowMode === "lend") {
          // 借出模式：押金退还给借入者，租金给发布者
          confirmContent = "确定要确认此借物品任务已完成吗？确认后押金将退还给借入者，租金将打款到您的余额。";
        } else if (this.task.borrowMode === "borrow") {
          // 借进模式：押金退还给发布者，租金给借出者
          confirmContent = "确定要确认此借物品任务已完成吗？确认后押金将退还给您，租金将打款到借出者余额。";
        }
      }
      uni.showModal({
        title: "确认完成",
        content: confirmContent,
        success: function () {
          var _success2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9(res) {
            var response, _this8$task, _this8$task2;
            return _regenerator.default.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    if (!res.confirm) {
                      _context9.next = 23;
                      break;
                    }
                    _context9.prev = 1;
                    _context9.next = 4;
                    return (0, _request.default)({
                      url: "/tasks/".concat(_this8.taskId, "/publisher-confirm-done"),
                      method: "POST"
                    });
                  case 4:
                    response = _context9.sent;
                    if (!response.message) {
                      _context9.next = 17;
                      break;
                    }
                    uni.showToast({
                      title: response.message,
                      icon: "success"
                    });

                    // 强制刷新任务信息
                    console.log("确认完成前任务状态:", (_this8$task = _this8.task) === null || _this8$task === void 0 ? void 0 : _this8$task.status);
                    _context9.next = 10;
                    return _this8.fetchTaskDetail();
                  case 10:
                    console.log("确认完成后任务状态:", (_this8$task2 = _this8.task) === null || _this8$task2 === void 0 ? void 0 : _this8$task2.status);

                    // 刷新售后申请信息
                    _context9.next = 13;
                    return _this8.fetchAfterSalesInfo();
                  case 13:
                    console.log("售后申请信息:", _this8.afterSalesInfo);

                    // 强制更新Vue响应式数据
                    _this8.$forceUpdate();

                    // 通知任务列表页面刷新
                    uni.$emit("taskStatusChanged", {
                      taskId: _this8.taskId,
                      newStatus: "publisher_confirmed",
                      action: "publisherConfirmed"
                    });

                    // 延迟跳转到任务列表页面
                    setTimeout(function () {
                      uni.switchTab({
                        url: "/pages/tasks"
                      });
                    }, 2000);
                  case 17:
                    _context9.next = 23;
                    break;
                  case 19:
                    _context9.prev = 19;
                    _context9.t0 = _context9["catch"](1);
                    console.error("确认完成任务失败:", _context9.t0);
                    uni.showToast({
                      title: _context9.t0.message || "确认失败",
                      icon: "none"
                    });
                  case 23:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9, null, [[1, 19]]);
          }));
          function success(_x2) {
            return _success2.apply(this, arguments);
          }
          return success;
        }()
      });
    },
    viewTaskDetail: function viewTaskDetail() {
      // 检查任务类型，学习伙伴任务不应该跳转到订单处理页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用查看功能",
          icon: "none"
        });
        return;
      }

      // 可以显示任务完成详情，或者跳转到订单处理页面查看历史
      uni.navigateTo({
        url: "/subpages/task/task_process/task_process?id=".concat(this.taskId)
      });
    },
    cleanHtmlContent: function cleanHtmlContent(html) {
      if (!html) return "";
      // 移除所有HTML标签
      return html.replace(/<[^>]*>/g, "");
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
    },
    getPackageSizeText: function getPackageSizeText(size) {
      // 现在包裹大小直接保存中文值，不需要映射
      return size || "中件";
    },
    // 处理订单号，去掉ORDER前缀
    getOrderNumber: function getOrderNumber(outTradeNo) {
      if (!outTradeNo) return "暂未生成";
      // 去掉ORDER前缀，只保留数字部分
      return outTradeNo.replace(/^ORDER\s*/, "");
    },
    // 获取订单号显示文本
    getOrderNumberDisplay: function getOrderNumberDisplay() {
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
            return this.getOrderNumber(this.task.out_trade_no);
          }
          return "借出后生成";
        }
        // 借进模式显示实际订单号
        if (this.task.borrowMode === "borrow" && this.task.out_trade_no) {
          return this.getOrderNumber(this.task.out_trade_no);
        }
        return "借出后生成";
      }
      if (!this.task.out_trade_no) return "暂未生成";
      return this.getOrderNumber(this.task.out_trade_no);
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
          return task.locationText || "搬运地点";
        case "学习伙伴":
          // 解析具体信息，提取活动地点
          if (task.specifics) {
            var activityMatch = task.specifics.match(/活动地点[:：]\s*([^,，\n]+)/);
            if (activityMatch) {
              return activityMatch[1].trim();
            }
          }
          return task.locationText || "活动地点";
        case "学习互助":
          // 解析具体信息，提取上课地点
          if (task.specifics) {
            var classLocationMatch = task.specifics.match(/上课地点[:：]\s*([^,，\n]+)/);
            if (classLocationMatch) {
              return classLocationMatch[1].trim();
            }
          }
          // 如果是线上课程
          if (task.specifics && task.specifics.includes("线上")) {
            return "线上课程";
          }
          return task.locationText || "教学楼";
        case "取快递":
        case "取外卖":
          // 解析具体信息，提取送达地址
          if (task.specifics) {
            var deliveryMatch = task.specifics.match(/送达地址[:：]\s*([^,，\n]+)/);
            if (deliveryMatch) {
              return "送：" + deliveryMatch[1].trim();
            }
          }
          return task.locationText ? "送：" + task.locationText : "快递点";
        case "帮我买":
          if (task.specifics) {
            var shopMatch = task.specifics.match(/购买地点[:：]\s*([^,，\n]+)/);
            if (shopMatch) {
              return shopMatch[1].trim();
            }
          }
          return task.locationText || "购买地点";
        case "借物品":
          // 解析具体信息，提取借还地点
          if (task.specifics) {
            var borrowMatch = task.specifics.match(/借还地点[:：]\s*([^,，\n]+)/);
            if (borrowMatch) {
              return borrowMatch[1].trim();
            }
          }
          return task.locationText || "借还地点";
        case "求资料":
          return "线上服务";
        case "其他服务":
          return task.locationText || "待定地点";
        default:
          // 如果地点为空或只有空格，显示默认地点
          if (!task.locationText || task.locationText.trim() === "" || task.locationText === "空") {
            return "待定地点";
          }
          return task.locationText;
      }
    },
    getGenderText: function getGenderText(gender) {
      if (gender === 1) return "男生";
      if (gender === 2) return "女生";
      return "未知";
    },
    formatOrderNumber: function formatOrderNumber(outTradeNo) {
      if (!outTradeNo) return "";
      // 去掉 ORDER 前缀，只保留数字部分
      var cleanOrderNo = outTradeNo.replace(/^ORDER\s*/, "");
      // 完整显示订单号
      return cleanOrderNo;
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 564:
/*!**************************************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue?vue&type=style&index=0&id=7e5ace0a&lang=scss&scoped=true& ***!
  \**************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./task_detail.vue?vue&type=style&index=0&id=7e5ace0a&lang=scss&scoped=true& */ 565);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_task_detail_vue_vue_type_style_index_0_id_7e5ace0a_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 565:
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/task/task_detail/task_detail.vue?vue&type=style&index=0&id=7e5ace0a&lang=scss&scoped=true& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[558,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subpages/task/task_detail/task_detail.js.map