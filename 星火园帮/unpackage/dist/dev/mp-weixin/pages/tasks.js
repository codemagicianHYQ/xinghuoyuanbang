(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/tasks"],{

/***/ 107:
/*!*******************************************************************!*\
  !*** D:/Document/test/test/星火园帮/main.js?{"page":"pages%2Ftasks"} ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _tasks = _interopRequireDefault(__webpack_require__(/*! ./pages/tasks.vue */ 108));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_tasks.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 108:
/*!**************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/tasks.vue ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tasks.vue?vue&type=template&id=660dcfe5&scoped=true& */ 109);
/* harmony import */ var _tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tasks.vue?vue&type=script&lang=js& */ 111);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tasks.vue?vue&type=style&index=0&id=660dcfe5&lang=scss&scoped=true& */ 113);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 48);

var renderjs





/* normalize component */

var component = Object(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "660dcfe5",
  null,
  false,
  _tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/tasks.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 109:
/*!*********************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/tasks.vue?vue&type=template&id=660dcfe5&scoped=true& ***!
  \*********************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./tasks.vue?vue&type=template&id=660dcfe5&scoped=true& */ 110);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_template_id_660dcfe5_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 110:
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/pages/tasks.vue?vue&type=template&id=660dcfe5&scoped=true& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  var l0 = _vm.__map(_vm.filteredTasks, function (task, index) {
    var $orig = _vm.__get_orig(task)
    var m0 = _vm.taskTypeLabel(task.taskType) || "未知类型"
    var m1 = _vm.formatDeadline(task.deadline)
    var m2 = m1 ? _vm.formatDeadline(task.deadline) : null
    var m3 = _vm.getTaskLocation(task)
    var m4 = task.status === "open" ? _vm.getBorrowButtonText(task) : null
    return {
      $orig: $orig,
      m0: m0,
      m1: m1,
      m2: m2,
      m3: m3,
      m4: m4,
    }
  })
  var g0 = _vm.filteredTasks.length
  var g1 = !_vm.isLoadMore ? _vm.hasMore && _vm.filteredTasks.length > 0 : null
  var g2 = false ? undefined : null
  var g3 = false ? undefined : null
  var g4 =  true ? !_vm.hasMore && _vm.filteredTasks.length > 0 : undefined
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        l0: l0,
        g0: g0,
        g1: g1,
        g2: g2,
        g3: g3,
        g4: g4,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 111:
/*!***************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/tasks.vue?vue&type=script&lang=js& ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./tasks.vue?vue&type=script&lang=js& */ 112);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 112:
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/pages/tasks.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _request = _interopRequireDefault(__webpack_require__(/*! @/common/request.js */ 41));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var CustomTabBar = function CustomTabBar() {
  __webpack_require__.e(/*! require.ensure | custom-tab-bar/index */ "custom-tab-bar/index").then((function () {
    return resolve(__webpack_require__(/*! @/custom-tab-bar/index.vue */ 647));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = {
  components: {
    CustomTabBar: CustomTabBar
  },
  data: function data() {
    var _taskTypeClassMap;
    return {
      searchKeyword: "",
      typeIndex: 0,
      statusIndex: 0,
      locationIndex: 0,
      currentCommunity: null,
      // 当前选择的社区
      taskTypes: [{
        label: "全部类型",
        value: ""
      }, {
        label: "取快递",
        value: "取快递"
      }, {
        label: "取外卖",
        value: "取外卖"
      }, {
        label: "帮我买",
        value: "帮我买"
      }, {
        label: "学习互助",
        value: "学习互助"
      }, {
        label: "借物品",
        value: "借物品"
      }, {
        label: "倒垃圾",
        value: "倒垃圾"
      }, {
        label: "搬运服务",
        value: "搬运服务"
      }, {
        label: "其他服务",
        value: "其他服务"
      }, {
        label: "求资料",
        value: "求资料"
      }],
      statusOptions: [{
        label: "全部状态",
        value: ""
      }, {
        label: "待接单",
        value: "open"
      }, {
        label: "进行中",
        value: "assigned"
      }, {
        label: "待确认",
        value: "acceptor_done"
      }, {
        label: "已完成",
        value: "done"
      }],
      locationOptions: [{
        label: "地点",
        value: ""
      }, {
        label: "男生宿舍",
        value: "男生宿舍"
      }, {
        label: "女生宿舍",
        value: "女生宿舍"
      }, {
        label: "教学楼",
        value: "教学楼"
      }, {
        label: "其他区域",
        value: "其他区域"
      }],
      tasks: [],
      isLoading: false,
      acceptingId: null,
      lastFetchTime: 0,
      // 记录上次请求时间
      fetchDebounceTimer: null,
      // 防抖定时器
      // 分页相关
      currentPage: 1,
      pageSize: 20,
      hasMore: true,
      scrollTop: 0,
      isLoadMore: false,
      // 是否正在加载更多
      taskTypeClassMap: (_taskTypeClassMap = {
        取快递: "type-express",
        取外卖: "type-food",
        帮我买: "type-buy",
        学习互助: "type-class",
        借物品: "type-borrow",
        倒垃圾: "type-game",
        学习伙伴: "type-partner"
      }, (0, _defineProperty2.default)(_taskTypeClassMap, "\u5B66\u4E60\u4E92\u52A9", "type-write"), (0, _defineProperty2.default)(_taskTypeClassMap, "\u642C\u8FD0\u670D\u52A1", "type-move"), (0, _defineProperty2.default)(_taskTypeClassMap, "\u5176\u4ED6\u670D\u52A1", "type-help"), (0, _defineProperty2.default)(_taskTypeClassMap, "\u6C42\u8D44\u6599", "type-material"), (0, _defineProperty2.default)(_taskTypeClassMap, "express", "type-express"), (0, _defineProperty2.default)(_taskTypeClassMap, "buy", "type-buy"), (0, _defineProperty2.default)(_taskTypeClassMap, "class_attendance", "type-class"), (0, _defineProperty2.default)(_taskTypeClassMap, "campus_errand", "type-errand"), (0, _defineProperty2.default)(_taskTypeClassMap, "tea_coffee", "type-drink"), (0, _defineProperty2.default)(_taskTypeClassMap, "other", "type-other"), _taskTypeClassMap)
    };
  },
  computed: {
    sortedTasks: function sortedTasks() {
      try {
        // 确保tasks是数组
        if (!Array.isArray(this.tasks)) {
          return [];
        }

        // 按未接单、已接单、已完成分组排序，并预处理avatar、statusText、statusClass
        var statusTextMap = {
          open: "待接单",
          assigned: "进行中",
          doing: "进行中",
          acceptor_done: "待确认",
          publisher_confirmed: "已完成",
          completed: "已完成",
          done: "已完成",
          cancelled: "已取消"
        };
        var statusClassMap = {
          open: "status-open",
          assigned: "status-doing",
          doing: "status-done",
          acceptor_done: "status-waiting",
          publisher_confirmed: "status-done",
          completed: "status-done",
          done: "status-done",
          cancelled: "status-cancelled"
        };
        var withExtra = function withExtra(arr) {
          return arr.map(function (task) {
            try {
              return _objectSpread(_objectSpread({}, task), {}, {
                avatar: task.publisher && task.publisher.avatarUrl ? task.publisher.avatarUrl : "/static/images/default-avatar.png",
                statusText: statusTextMap[task.status] || "",
                statusClass: statusClassMap[task.status] || ""
              });
            } catch (error) {
              console.error("处理任务数据错误:", error);
              return _objectSpread(_objectSpread({}, task), {}, {
                avatar: "/static/images/default-avatar.png",
                statusText: "",
                statusClass: ""
              });
            }
          });
        };
        // 后端已经实现了新的过滤逻辑：保留所有待接单和进行中的订单，已完成的订单只保留5天内的
        // 前端不再需要额外的日期过滤
        var recentTasks = this.tasks;
        var open = recentTasks.filter(function (t) {
          return t && t.status === "open";
        });
        var assigned = recentTasks.filter(function (t) {
          return t && (t.status === "assigned" || t.status === "doing");
        });
        var waitingConfirm = recentTasks.filter(function (t) {
          return t && t.status === "acceptor_done";
        });
        // 计算5天前的日期
        var fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        var done = recentTasks.filter(function (t) {
          return t && (t.status === "done" || t.status === "completed" || t.status === "publisher_confirmed") &&
          // 额外的前端过滤：只显示5天内的已完成订单
          t.publisherConfirmedTime && new Date(t.publisherConfirmedTime) >= fiveDaysAgo;
        });

        // 检查是否有任务被过滤掉
        var totalFiltered = open.length + assigned.length + waitingConfirm.length + done.length;
        var unfiltered = recentTasks.filter(function (t) {
          var status = t && t.status;
          return !status || status !== "open" && status !== "assigned" && status !== "doing" && status !== "acceptor_done" && status !== "done" && status !== "completed" && status !== "publisher_confirmed";
        });

        // 检查被过滤掉的已完成订单
        var allDoneTasks = recentTasks.filter(function (t) {
          return t && (t.status === "done" || t.status === "completed" || t.status === "publisher_confirmed");
        });
        var filteredOutDoneTasks = allDoneTasks.filter(function (t) {
          return !(t.publisherConfirmedTime && new Date(t.publisherConfirmedTime) >= fiveDaysAgo);
        });
        if (filteredOutDoneTasks.length > 0) {
          // 已过滤掉超过5天的已完成订单
        }

        // 按照指定顺序排序：待接单 -> 进行中 -> 待确认 -> 已完成
        // 每个分组内部按创建时间倒序排列（最新的在前）
        var sortByCreatedAt = function sortByCreatedAt(a, b) {
          var dateA = new Date(a.createdAt || 0);
          var dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        };
        var tasksToShow = [].concat((0, _toConsumableArray2.default)(withExtra(open.sort(sortByCreatedAt))), (0, _toConsumableArray2.default)(withExtra(assigned.sort(sortByCreatedAt))), (0, _toConsumableArray2.default)(withExtra(waitingConfirm.sort(sortByCreatedAt))), (0, _toConsumableArray2.default)(withExtra(done.sort(sortByCreatedAt))));
        return tasksToShow;
      } catch (error) {
        console.error("排序任务列表错误:", error);
        return [];
      }
    },
    filteredTasks: function filteredTasks() {
      var _this = this;
      try {
        // 支持筛选和搜索
        var filtered = this.sortedTasks.filter(function (task) {
          try {
            if (!task) return false;
            var matchType = !(_this.taskTypes[_this.typeIndex] && _this.taskTypes[_this.typeIndex].value) || task.taskType === (_this.taskTypes[_this.typeIndex] && _this.taskTypes[_this.typeIndex].value);
            // 排除已取消的订单
            if (task.status === "cancelled") {
              return false;
            }
            var matchStatus = !(_this.statusOptions[_this.statusIndex] && _this.statusOptions[_this.statusIndex].value) || _this.statusOptions[_this.statusIndex] && _this.statusOptions[_this.statusIndex].value === "done" && (task.status === "done" || task.status === "completed" || task.status === "publisher_confirmed") || _this.statusOptions[_this.statusIndex] && _this.statusOptions[_this.statusIndex].value === "acceptor_done" && task.status === "acceptor_done" || _this.statusOptions[_this.statusIndex] && _this.statusOptions[_this.statusIndex].value !== "done" && _this.statusOptions[_this.statusIndex].value !== "acceptor_done" && task.status === (_this.statusOptions[_this.statusIndex] && _this.statusOptions[_this.statusIndex].value);
            var matchLocation = !(_this.locationOptions[_this.locationIndex] && _this.locationOptions[_this.locationIndex].value) || task.locationText && task.locationText.includes(_this.locationOptions[_this.locationIndex] && _this.locationOptions[_this.locationIndex].value);
            var matchKeyword = !_this.searchKeyword || task.title && task.title.includes(_this.searchKeyword) || task.locationText && task.locationText.includes(_this.searchKeyword);
            var result = matchType && matchStatus && matchLocation && matchKeyword;
            if (!result) {
              // 任务被过滤掉
            }
            return result;
          } catch (error) {
            console.error("筛选任务错误:", error);
            return false;
          }
        });
        return filtered;
      } catch (error) {
        console.error("过滤任务列表错误:", error);
        return [];
      }
    }
  },
  onLoad: function onLoad() {
    // 检查用户登录状态
    var token = uni.getStorageSync("userAuthToken_xh");
    if (!token) {
      uni.showModal({
        title: "请先登录",
        content: "您需要先登录才能查看任务大厅",
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
    try {
      // 加载当前选择的社区
      this.loadCurrentCommunity();

      // 重置分页状态
      this.resetPagination();

      // 直接调用数据获取方法，不使用防抖
      this.fetchTasksDirect();
    } catch (error) {
      console.error("订单页面onLoad错误:", error);
      uni.showToast({
        title: "页面加载失败",
        icon: "none"
      });
    }
  },
  onShow: function onShow() {
    // 同步tabBar状态
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSelected(1); // 订单页面对应索引1
    }

    try {
      // 重新加载当前选择的社区（可能在其他页面切换了）
      this.loadCurrentCommunity();

      // 页面显示时刷新数据，但增加间隔控制
      var now = Date.now();
      if (now - this.lastFetchTime > 5000) {
        // 5秒内不重复请求

        this.resetPagination();
        this.fetchTasksDirect();
      }
    } catch (error) {
      console.error("订单页面onShow错误:", error);
    }
  },
  onUnload: function onUnload() {
    // 清理防抖定时器
    if (this.fetchDebounceTimer) {
      clearTimeout(this.fetchDebounceTimer);
      this.fetchDebounceTimer = null;
    }
    // 移除社区变化监听
    uni.$off("communityChanged", this.handleCommunityChanged);
  },
  mounted: function mounted() {
    // 监听社区变化事件
    uni.$on("communityChanged", this.handleCommunityChanged);
    // 监听任务状态变化事件
    uni.$on("taskStatusChanged", this.handleTaskStatusChanged);
  },
  beforeDestroy: function beforeDestroy() {
    // 移除社区变化监听
    uni.$off("communityChanged", this.handleCommunityChanged);
    // 移除任务状态变化监听
    uni.$off("taskStatusChanged", this.handleTaskStatusChanged);
  },
  onPullDownRefresh: function onPullDownRefresh() {
    // 重置分页状态
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoadMore = false;
    this.isLoading = false;
    this.lastFetchTime = 0;

    // 清除防抖定时器
    if (this.fetchDebounceTimer) {
      clearTimeout(this.fetchDebounceTimer);
      this.fetchDebounceTimer = null;
    }

    // 直接调用数据获取方法
    this.fetchTasksDirect().finally(function () {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    // 点击加载更多
    loadMore: function loadMore() {
      // 如果正在加载或没有更多数据，则不执行
      if (this.isLoadMore || this.isLoading || !this.hasMore) {
        return;
      }

      // 增加页码并加载更多数据
      this.currentPage++;
      this.fetchTasksDirect(true);
    },
    // 英文类型转中文
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
        lend: "借物品",
        "": ""
      };
      if (!type) {
        return "未知类型";
      }
      return map[type] || type;
    },
    // 获取任务类型对应的CSS类名
    getTaskTypeClass: function getTaskTypeClass(type) {
      var _typeClassMap;
      var typeClassMap = (_typeClassMap = {
        取快递: "type-express",
        取外卖: "type-food",
        帮我买: "type-buy",
        学习互助: "type-class",
        借物品: "type-borrow",
        倒垃圾: "type-game"
      }, (0, _defineProperty2.default)(_typeClassMap, "\u5B66\u4E60\u4E92\u52A9", "type-write"), (0, _defineProperty2.default)(_typeClassMap, "\u642C\u8FD0\u670D\u52A1", "type-move"), (0, _defineProperty2.default)(_typeClassMap, "\u5176\u4ED6\u670D\u52A1", "type-help"), (0, _defineProperty2.default)(_typeClassMap, "\u6C42\u8D44\u6599", "type-material"), (0, _defineProperty2.default)(_typeClassMap, "express", "type-express"), (0, _defineProperty2.default)(_typeClassMap, "buy", "type-buy"), (0, _defineProperty2.default)(_typeClassMap, "class_attendance", "type-class"), (0, _defineProperty2.default)(_typeClassMap, "campus_errand", "type-errand"), (0, _defineProperty2.default)(_typeClassMap, "tea_coffee", "type-drink"), (0, _defineProperty2.default)(_typeClassMap, "other", "type-other"), _typeClassMap);
      return typeClassMap[type] || "type-default";
    },
    // 获取借物品按钮文本
    getBorrowButtonText: function getBorrowButtonText(task) {
      if (task.taskType !== "借物品") {
        return "我要接单";
      }

      // 根据借物品的借出/借进模式显示不同按钮
      if (task.borrowMode === "lend") {
        return "我要借";
      } else if (task.borrowMode === "borrow") {
        return "借给Ta";
      }

      // 默认情况
      return "我要接单";
    },
    // 获取任务地点显示文本
    getTaskLocation: function getTaskLocation(task) {
      if (!task) return "未知地点";
      var taskType = task.taskType || "";

      // 根据任务类型优化地点显示
      switch (taskType) {
        case "游戏陪玩":
          return "线上游戏";
        case "搬运服务":
          // 解析具体信息，提取起始地点
          if (task.specifics) {
            var startLocationMatch = task.specifics.match(/起始地点[:：]\s*([^,，\n]+)/);
            if (startLocationMatch) {
              return startLocationMatch[1].trim();
            }
          }
          return task.locationText || "搬运地点";
        case "学习互助":
          return "线上服务";
        case "课程代替":
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
    // 直接获取任务数据，不使用防抖（用于下拉刷新）
    fetchTasksDirect: function fetchTasksDirect() {
      var _arguments = arguments,
        _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var isLoadMore, selectedVersion, fiveDaysAgo, completedStartDate, requestData, queryString, res, statusCount, completedTasks, newTasks, totalItems;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                isLoadMore = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : false;
                if (!(!_this2.currentCommunity || !_this2.currentCommunity.id)) {
                  _context.next = 5;
                  break;
                }
                console.log("未选择社区，跳过任务获取");
                if (isLoadMore) {
                  _this2.isLoadMore = false;
                } else {
                  _this2.isLoading = false;
                }
                return _context.abrupt("return");
              case 5:
                if (isLoadMore) {
                  _this2.isLoadMore = true;
                } else {
                  _this2.isLoading = true;
                }
                _this2.lastFetchTime = Date.now();
                _context.prev = 7;
                // 获取当前选择的版本
                selectedVersion = "campus"; // 计算最近5天的开始时间（用于已完成的订单）
                fiveDaysAgo = new Date();
                fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
                completedStartDate = fiveDaysAgo.toISOString().split("T")[0]; // YYYY-MM-DD格式
                // 请求订单数据，支持分页
                // 保留所有待接单和进行中的订单，已完成的订单只保留5天内的
                requestData = {
                  completedStartDate: completedStartDate,
                  // 已完成订单的开始时间
                  page: _this2.currentPage,
                  limit: _this2.pageSize,
                  version: selectedVersion,
                  // 添加版本参数
                  _t: Date.now() // 添加时间戳防止缓存
                }; // 如果选择了社区，添加社区ID过滤

                if (_this2.currentCommunity && _this2.currentCommunity.id) {
                  requestData.communityId = _this2.currentCommunity.id;
                }

                // 构建查询字符串
                queryString = Object.keys(requestData).map(function (key) {
                  return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(requestData[key]));
                }).join("&");
                _context.next = 17;
                return (0, _request.default)({
                  url: "/tasks?".concat(queryString),
                  method: "GET"
                });
              case 17:
                res = _context.sent;
                // 检查返回的所有订单
                if (res && res.tasks) {
                  statusCount = {};
                  res.tasks.forEach(function (task) {
                    statusCount[task.status] = (statusCount[task.status] || 0) + 1;
                  });

                  // 检查返回的已完成订单
                  completedTasks = res.tasks.filter(function (task) {
                    return task.status === "completed" || task.status === "finished" || task.status === "publisher_confirmed";
                  });
                  completedTasks.forEach(function (task) {
                    var publisherConfirmedTime = task.publisherConfirmedTime;
                    var filterDate = new Date(completedStartDate + "T00:00:00.000Z");
                    var isWithin5Days = publisherConfirmedTime && new Date(publisherConfirmedTime) >= filterDate;
                  });

                  // 检查所有订单的详细信息

                  res.tasks.forEach(function (task) {});
                }

                // 处理返回的数据
                newTasks = [];
                totalItems = 0;
                if (res && Array.isArray(res.tasks)) {
                  newTasks = res.tasks;
                  totalItems = res.totalItems || res.tasks.length;
                } else if (res && Array.isArray(res)) {
                  newTasks = res;
                  totalItems = res.length;
                } else {
                  newTasks = [];
                  totalItems = 0;
                }

                // 如果没有数据，记录日志但不添加测试数据
                if (newTasks.length === 0) {
                  totalItems = 0;
                }

                // 如果是加载更多，则追加数据
                if (isLoadMore) {
                  _this2.tasks = [].concat((0, _toConsumableArray2.default)(_this2.tasks), (0, _toConsumableArray2.default)(newTasks));
                } else {
                  // 使用Vue.set确保响应式更新
                  _this2.$set(_this2, "tasks", newTasks);
                }

                // 判断是否还有更多数据
                // 如果返回的数据少于pageSize，说明没有更多数据了
                _this2.hasMore = newTasks.length >= _this2.pageSize;

                // 如果总数小于等于当前已加载的数量，强制设置为false
                if (totalItems > 0 && _this2.tasks.length >= totalItems) {
                  _this2.hasMore = false;
                }

                // 调试信息
                console.log("分页调试信息:", {
                  isLoadMore: isLoadMore,
                  currentPage: _this2.currentPage,
                  pageSize: _this2.pageSize,
                  newTasksLength: newTasks.length,
                  totalTasks: _this2.tasks.length,
                  totalItems: totalItems,
                  hasMore: _this2.hasMore
                });

                // 强制更新视图和计算属性
                _this2.$forceUpdate();
                // 强制重新计算计算属性

                // 添加调试信息
                _context.next = 35;
                break;
              case 30:
                _context.prev = 30;
                _context.t0 = _context["catch"](7);
                console.error("下拉刷新获取任务列表失败:", _context.t0);
                if (!isLoadMore) {
                  _this2.tasks = [];
                }
                uni.showToast({
                  title: "刷新失败",
                  icon: "none"
                });
              case 35:
                _context.prev = 35;
                if (isLoadMore) {
                  _this2.isLoadMore = false;
                } else {
                  _this2.isLoading = false;
                }
                return _context.finish(35);
              case 38:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[7, 30, 35, 38]]);
      }))();
    },
    fetchTasks: function fetchTasks() {
      var _arguments2 = arguments,
        _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var isLoadMore, now;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                isLoadMore = _arguments2.length > 0 && _arguments2[0] !== undefined ? _arguments2[0] : false;
                if (!isLoadMore) {
                  _context3.next = 5;
                  break;
                }
                _context3.next = 4;
                return _this3.fetchTasksDirect(isLoadMore);
              case 4:
                return _context3.abrupt("return");
              case 5:
                // 防抖：如果距离上次请求时间小于2秒，则取消
                now = Date.now();
                if (!(_this3.lastFetchTime > 0 && now - _this3.lastFetchTime < 2000)) {
                  _context3.next = 9;
                  break;
                }
                console.log("请求过于频繁，已取消");
                return _context3.abrupt("return");
              case 9:
                // 清除之前的防抖定时器
                if (_this3.fetchDebounceTimer) {
                  clearTimeout(_this3.fetchDebounceTimer);
                }

                // 设置防抖定时器
                _this3.fetchDebounceTimer = setTimeout( /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
                  return _regenerator.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return _this3.fetchTasksDirect(isLoadMore);
                        case 2:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                })), 300); // 300ms防抖延迟
              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    onTypeChange: function onTypeChange(e) {
      this.typeIndex = Number(e.detail.value);
      this.resetPagination();
      this.fetchTasksDirect();
    },
    onStatusChange: function onStatusChange(e) {
      this.statusIndex = Number(e.detail.value);
      this.resetPagination();
      this.fetchTasksDirect();
    },
    onLocationChange: function onLocationChange(e) {
      this.locationIndex = Number(e.detail.value);
      this.resetPagination();
      this.fetchTasksDirect();
    },
    formatDeadline: function formatDeadline(deadline) {
      try {
        if (!deadline) return "";
        var d = new Date(deadline);
        if (isNaN(d.getTime())) return "";

        // 将截止时间往后延长30分钟（自动取消时间）
        var autoCancelTime = new Date(d.getTime() + 30 * 60 * 1000);
        return "".concat(autoCancelTime.getMonth() + 1, "/").concat(autoCancelTime.getDate(), " ").concat(autoCancelTime.getHours(), ":").concat(autoCancelTime.getMinutes().toString().padStart(2, "0"), " \u622A\u6B62");
      } catch (error) {
        console.error("格式化截止时间错误:", error);
        return "";
      }
    },
    goToDetail: function goToDetail(task) {
      try {
        if (!task || !task.id) {
          uni.showToast({
            title: "任务ID无效",
            icon: "none"
          });
          return;
        }

        // 判断用户身份和订单状态
        var currentUserId = this.userInfo && this.userInfo.id;
        var isPublisher = task.publisherId === currentUserId;
        var isAcceptor = task.acceptorId === currentUserId;
        var isAssigned = task.status === "assigned";

        // 如果是学习伙伴任务，跳转到校园论坛详情页面
        if (task.taskType === "学习伙伴") {
          uni.navigateTo({
            url: "/subpages/campus-interact/detail?id=".concat(task.id)
          });
          return;
        }

        // 如果是接单人且订单已分配，跳转到订单处理页面
        if (isAcceptor && isAssigned) {
          uni.navigateTo({
            url: "/subpages/task/task_process/task_process?id=".concat(task.id)
          });
        } else {
          // 其他情况跳转到任务详情页面（非找搭子任务）
          uni.navigateTo({
            url: "/subpages/task/task_detail/task_detail?id=".concat(task.id)
          });
        }
      } catch (error) {
        console.error("跳转任务详情页错误:", error);
        uni.showToast({
          title: "跳转失败",
          icon: "none"
        });
      }
    },
    acceptTask: function acceptTask(taskId) {
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                if (taskId) {
                  _context4.next = 4;
                  break;
                }
                uni.showToast({
                  title: "任务ID无效",
                  icon: "none"
                });
                return _context4.abrupt("return");
              case 4:
                // 跳转到订单确认页面
                uni.navigateTo({
                  url: "/subpages/task/task_confirm/task_confirm?id=".concat(taskId)
                });
                _context4.next = 11;
                break;
              case 7:
                _context4.prev = 7;
                _context4.t0 = _context4["catch"](0);
                console.error("跳转订单确认页面失败:", _context4.t0);
                uni.showToast({
                  title: "跳转失败",
                  icon: "none"
                });
              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[0, 7]]);
      }))();
    },
    // 重置分页状态
    resetPagination: function resetPagination() {
      this.currentPage = 1;
      this.hasMore = true; // 初始状态假设有更多数据
      this.isLoadMore = false;
      // 不清空tasks，让fetchTasks来处理数据更新
    },
    // 加载当前选择的社区
    loadCurrentCommunity: function loadCurrentCommunity() {
      try {
        var savedCommunity = uni.getStorageSync("selectedCommunity");
        if (savedCommunity) {
          this.currentCommunity = savedCommunity;
          console.log("任务大厅加载当前社区:", savedCommunity.name);
        } else {
          this.currentCommunity = null;
          console.log("任务大厅：未选择社区");
        }
      } catch (error) {
        console.error("加载当前社区失败:", error);
        this.currentCommunity = null;
      }
    },
    // 跳转到社区选择页面
    goToSelectCommunity: function goToSelectCommunity() {
      uni.navigateTo({
        url: "/subpages/community/select-community"
      });
    },
    // 处理社区变化事件
    handleCommunityChanged: function handleCommunityChanged(community) {
      console.log("任务大厅收到社区变化事件:", community);
      this.currentCommunity = community;
      // 重置分页并重新获取数据
      this.resetPagination();
      this.fetchTasksDirect();
    },
    // 处理任务状态变化事件
    handleTaskStatusChanged: function handleTaskStatusChanged(eventData) {
      var _this4 = this;
      console.log("任务大厅收到任务状态变化事件:", eventData);

      // 如果是发布者确认完成或接单员标记完成，刷新任务列表
      if (eventData.action === "publisherConfirmed" || eventData.action === "acceptorConfirmed") {
        var actionText = eventData.action === "publisherConfirmed" ? "已确认完成" : "已标记完成";
        console.log("\u4EFB\u52A1 ".concat(eventData.taskId, " ").concat(actionText, "\uFF0C\u5237\u65B0\u4EFB\u52A1\u5217\u8868"));

        // 延迟一点时间确保后端数据已更新
        setTimeout(function () {
          _this4.resetPagination();
          _this4.fetchTasksDirect();
        }, 500);
      }
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 113:
/*!************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/tasks.vue?vue&type=style&index=0&id=660dcfe5&lang=scss&scoped=true& ***!
  \************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./tasks.vue?vue&type=style&index=0&id=660dcfe5&lang=scss&scoped=true& */ 114);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_tasks_vue_vue_type_style_index_0_id_660dcfe5_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 114:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/pages/tasks.vue?vue&type=style&index=0&id=660dcfe5&lang=scss&scoped=true& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[107,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../.sourcemap/mp-weixin/pages/tasks.js.map