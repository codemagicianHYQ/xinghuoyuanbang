(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["subpages/community/select-community"],{

/***/ 631:
/*!*********************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/main.js?{"page":"subpages%2Fcommunity%2Fselect-community"} ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _selectCommunity = _interopRequireDefault(__webpack_require__(/*! ./subpages/community/select-community.vue */ 632));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_selectCommunity.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 632:
/*!**************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/community/select-community.vue ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./select-community.vue?vue&type=template&id=e631b2ea&scoped=true& */ 633);
/* harmony import */ var _select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./select-community.vue?vue&type=script&lang=js& */ 635);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./select-community.vue?vue&type=style&index=0&id=e631b2ea&lang=scss&scoped=true& */ 637);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 48);

var renderjs





/* normalize component */

var component = Object(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "e631b2ea",
  null,
  false,
  _select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "subpages/community/select-community.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 633:
/*!*********************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/community/select-community.vue?vue&type=template&id=e631b2ea&scoped=true& ***!
  \*********************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./select-community.vue?vue&type=template&id=e631b2ea&scoped=true& */ 634);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_template_id_e631b2ea_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 634:
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/community/select-community.vue?vue&type=template&id=e631b2ea&scoped=true& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  var m0 = _vm.currentCommunity
    ? _vm.getCommunityAddress(_vm.currentCommunity)
    : null
  var l0 =
    _vm.isLocationSearch || _vm.isSearchMode
      ? _vm.__map(_vm.displayedCommunities, function (community, __i0__) {
          var $orig = _vm.__get_orig(community)
          var m1 = _vm.getCommunityTypeText(community.type)
          var m2 = _vm.getCommunityAddress(community)
          return {
            $orig: $orig,
            m1: m1,
            m2: m2,
          }
        })
      : null
  var l1 = _vm.showSearchModal
    ? _vm.__map(_vm.searchResults, function (community, __i1__) {
        var $orig = _vm.__get_orig(community)
        var m3 = _vm.getCommunityTypeText(community.type)
        var m4 = _vm.getCommunityAddress(community)
        return {
          $orig: $orig,
          m3: m3,
          m4: m4,
        }
      })
    : null
  if (!_vm._isMounted) {
    _vm.e0 = function ($event) {
      _vm.showSearchModal = true
    }
    _vm.e1 = function ($event) {
      _vm.showSearchModal = false
    }
    _vm.e2 = function ($event) {
      _vm.showSearchModal = false
    }
  }
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        m0: m0,
        l0: l0,
        l1: l1,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 635:
/*!***************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/community/select-community.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./select-community.vue?vue&type=script&lang=js& */ 636);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 636:
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/community/select-community.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 38));
var _request = _interopRequireDefault(__webpack_require__(/*! @/common/request.js */ 41));
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _default = {
  name: "SelectCommunity",
  data: function data() {
    return {
      currentCommunity: null,
      displayedCommunities: [],
      searchResults: [],
      searchKeyword: "",
      loading: false,
      locationLoading: false,
      showSearchModal: false,
      isLocationSearch: false,
      isSearchMode: false,
      // 是否处于搜索模式
      page: 1,
      hasMore: true,
      provinces: [],
      currentLocation: null,
      showNearbyTip: false // 是否显示附近暂无社区的提示
    };
  },
  onLoad: function onLoad() {
    this.loadCurrentCommunity();
    // 不再自动加载社区列表，用户需要主动选择查找附近社区或搜索社区
    this.loadProvinces();
  },
  methods: {
    // 加载当前选择的社区
    loadCurrentCommunity: function loadCurrentCommunity() {
      var savedCommunity = uni.getStorageSync("selectedCommunity");
      if (savedCommunity) {
        this.currentCommunity = savedCommunity;
      }
    },
    // 加载社区列表
    loadCommunities: function loadCommunities() {
      var _this = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var res, _this$displayedCommun;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _this.loading = true;
                // 重置附近社区提示
                _this.showNearbyTip = false;
                _context.next = 5;
                return (0, _request.default)({
                  url: "/campuses",
                  method: "GET",
                  data: {
                    page: _this.page,
                    limit: 20
                  }
                });
              case 5:
                res = _context.sent;
                if (res.success) {
                  if (_this.page === 1) {
                    _this.displayedCommunities = res.data.campuses;
                  } else {
                    (_this$displayedCommun = _this.displayedCommunities).push.apply(_this$displayedCommun, (0, _toConsumableArray2.default)(res.data.campuses));
                  }
                  _this.hasMore = res.data.campuses.length === 20;
                }
                _context.next = 13;
                break;
              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                console.error("加载社区列表失败:", _context.t0);
                uni.showToast({
                  title: "加载社区列表失败",
                  icon: "none"
                });
              case 13:
                _context.prev = 13;
                _this.loading = false;
                return _context.finish(13);
              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 9, 13, 16]]);
      }))();
    },
    // 加载更多社区
    loadMoreCommunities: function loadMoreCommunities() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.loadCommunities();
      }
    },
    // 加载省份列表
    loadProvinces: function loadProvinces() {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var res;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return (0, _request.default)({
                  url: "/campuses/provinces",
                  method: "GET"
                });
              case 3:
                res = _context2.sent;
                if (res.success) {
                  _this2.provinces = res.data;
                }
                _context2.next = 10;
                break;
              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2["catch"](0);
                console.error("加载省份列表失败:", _context2.t0);
              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 7]]);
      }))();
    },
    // 获取当前位置
    getCurrentLocation: function getCurrentLocation() {
      var _this3 = this;
      this.locationLoading = true;
      this.isLocationSearch = true; // 标记为定位查找模式

      // 如果有当前选择的社区，使用社区位置；否则获取用户GPS位置
      if (this.currentCommunity && this.currentCommunity.latitude && this.currentCommunity.longitude) {
        console.log("使用当前社区位置查找附近社区:", this.currentCommunity.name);
        this.currentLocation = {
          latitude: this.currentCommunity.latitude,
          longitude: this.currentCommunity.longitude
        };
        this.findNearbyCommunities(this.currentCommunity.latitude, this.currentCommunity.longitude);
      } else {
        console.log("获取用户GPS位置查找附近社区");
        uni.getLocation({
          type: "gcj02",
          success: function success(res) {
            _this3.currentLocation = {
              latitude: res.latitude,
              longitude: res.longitude
            };
            _this3.findNearbyCommunities(res.latitude, res.longitude);
          },
          fail: function fail(error) {
            console.error("获取位置失败:", error);
            _this3.locationLoading = false;
            _this3.isLocationSearch = false; // 失败时重置标记
            uni.showToast({
              title: "获取位置失败，请手动选择",
              icon: "none"
            });
          }
        });
      }
    },
    // 查找附近社区
    findNearbyCommunities: function findNearbyCommunities(latitude, longitude) {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var requestData, res;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                // 设置定位搜索模式
                _this4.isLocationSearch = true;
                _this4.isSearchMode = false; // 重置搜索模式

                // 构建请求参数
                requestData = {
                  latitude: latitude,
                  longitude: longitude,
                  radius: 5000,
                  // 5公里
                  limit: 20
                }; // 如果有当前选择的社区，排除它
                if (_this4.currentCommunity && _this4.currentCommunity.id) {
                  requestData.excludeId = _this4.currentCommunity.id;
                  console.log("排除当前社区:", _this4.currentCommunity.name, "ID:", _this4.currentCommunity.id);
                }
                _context3.next = 7;
                return (0, _request.default)({
                  url: "/campuses/nearby",
                  method: "GET",
                  data: requestData
                });
              case 7:
                res = _context3.sent;
                if (res.success) {
                  // 只有在5公里内确实有社区时才显示社区列表
                  if (res.data.hasNearbyCommunities) {
                    _this4.displayedCommunities = res.data.campuses;
                    _this4.showNearbyTip = false;
                    uni.showToast({
                      title: "已为您推荐附近社区",
                      icon: "success"
                    });
                  } else {
                    // 5公里内没有社区时，清空列表并显示提示
                    _this4.displayedCommunities = [];
                    _this4.showNearbyTip = true;
                    uni.showToast({
                      title: res.data.message || "附近暂无社区",
                      icon: "none",
                      duration: 3000
                    });
                  }
                  _this4.page = 1;
                  _this4.hasMore = false;
                }
                _context3.next = 15;
                break;
              case 11:
                _context3.prev = 11;
                _context3.t0 = _context3["catch"](0);
                console.error("查找附近社区失败:", _context3.t0);
                uni.showToast({
                  title: "查找附近社区失败",
                  icon: "none"
                });
              case 15:
                _context3.prev = 15;
                _this4.locationLoading = false;
                return _context3.finish(15);
              case 18:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[0, 11, 15, 18]]);
      }))();
    },
    // 搜索处理
    handleSearch: function handleSearch() {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var res;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (_this5.searchKeyword.trim()) {
                  _context4.next = 4;
                  break;
                }
                _this5.searchResults = [];
                _this5.isSearchMode = false;
                return _context4.abrupt("return");
              case 4:
                // 设置搜索模式
                _this5.isSearchMode = true;
                // 重置附近社区提示
                _this5.showNearbyTip = false;
                _context4.prev = 6;
                _context4.next = 9;
                return (0, _request.default)({
                  url: "/campuses",
                  method: "GET",
                  data: {
                    keyword: _this5.searchKeyword,
                    limit: 20
                  }
                });
              case 9:
                res = _context4.sent;
                if (res.success) {
                  _this5.searchResults = res.data.campuses;
                }
                _context4.next = 17;
                break;
              case 13:
                _context4.prev = 13;
                _context4.t0 = _context4["catch"](6);
                console.error("搜索失败:", _context4.t0);
                uni.showToast({
                  title: "搜索失败",
                  icon: "none"
                });
              case 17:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[6, 13]]);
      }))();
    },
    // 选择社区
    selectCommunity: function selectCommunity(community) {
      // 确保保存完整的社区信息
      var communityToSave = _objectSpread({}, community);
      console.log("选择社区:", communityToSave.name, "类型:", communityToSave.type, "是否校园版:", communityToSave.type === "school");

      // 保存选择的社区
      uni.setStorageSync("selectedCommunity", communityToSave);

      // 触发全局事件
      uni.$emit("communityChanged", communityToSave);

      // 重置所有搜索标记
      this.isLocationSearch = false;
      this.isSearchMode = false;
      this.showNearbyTip = false;

      // 显示成功提示
      uni.showToast({
        title: "\u5DF2\u9009\u62E9 ".concat(community.name),
        icon: "success"
      });

      // 延迟返回上一页
      setTimeout(function () {
        uni.navigateBack();
      }, 1500);
    },
    // 切换社区
    switchBuilding: function switchBuilding() {
      // 保存当前社区信息，用于排除
      var currentCommunityBackup = this.currentCommunity;

      // 清空当前选中的社区显示
      this.currentCommunity = null;
      this.isLocationSearch = true; // 设置为定位查找模式

      // 显示加载状态
      this.locationLoading = true;

      // 如果有备份的社区信息，使用其位置查找附近社区
      if (currentCommunityBackup && currentCommunityBackup.latitude && currentCommunityBackup.longitude) {
        console.log("切换社区：使用当前社区位置查找附近社区", currentCommunityBackup.name);
        this.currentLocation = {
          latitude: currentCommunityBackup.latitude,
          longitude: currentCommunityBackup.longitude
        };
        // 查找附近社区，排除当前社区
        this.findNearbyCommunitiesForSwitch(currentCommunityBackup.latitude, currentCommunityBackup.longitude, currentCommunityBackup.id);
      } else {
        // 如果没有社区位置信息，获取用户GPS位置
        this.getCurrentLocation();
      }
    },
    // 切换社区时查找附近社区（排除当前社区）
    findNearbyCommunitiesForSwitch: function findNearbyCommunitiesForSwitch(latitude, longitude, excludeId) {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var requestData, res;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                // 设置定位搜索模式
                _this6.isLocationSearch = true;
                _this6.isSearchMode = false; // 重置搜索模式

                // 构建请求参数
                requestData = {
                  latitude: latitude,
                  longitude: longitude,
                  radius: 5000,
                  // 5公里
                  limit: 20,
                  excludeId: excludeId // 排除当前社区
                };

                console.log("切换社区查找附近社区，排除ID:", excludeId);
                _context5.next = 7;
                return (0, _request.default)({
                  url: "/campuses/nearby",
                  method: "GET",
                  data: requestData
                });
              case 7:
                res = _context5.sent;
                if (res.success) {
                  // 只有在5公里内确实有社区时才显示社区列表
                  if (res.data.hasNearbyCommunities) {
                    _this6.displayedCommunities = res.data.campuses;
                    _this6.showNearbyTip = false;
                    uni.showToast({
                      title: "已为您推荐附近社区",
                      icon: "success"
                    });
                  } else {
                    // 5公里内没有社区时，清空列表并显示提示
                    _this6.displayedCommunities = [];
                    _this6.showNearbyTip = true;
                    uni.showToast({
                      title: res.data.message || "附近暂无社区",
                      icon: "none",
                      duration: 3000
                    });
                  }
                  _this6.page = 1;
                  _this6.hasMore = false;
                } else {
                  console.error("查找附近社区失败:", res.message);
                  _this6.displayedCommunities = [];
                  _this6.showNearbyTip = true;
                  uni.showToast({
                    title: res.message || "查找附近社区失败",
                    icon: "none"
                  });
                }
                _context5.next = 17;
                break;
              case 11:
                _context5.prev = 11;
                _context5.t0 = _context5["catch"](0);
                console.error("查找附近社区出错:", _context5.t0);
                _this6.displayedCommunities = [];
                _this6.showNearbyTip = true;
                uni.showToast({
                  title: "查找附近社区失败",
                  icon: "none"
                });
              case 17:
                _context5.prev = 17;
                _this6.locationLoading = false;
                return _context5.finish(17);
              case 20:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 11, 17, 20]]);
      }))();
    },
    // 获取社区类型文本
    getCommunityTypeText: function getCommunityTypeText(type) {
      return type === "school" ? "学校" : "社区";
    },
    // 获取社区地址文本
    getCommunityAddress: function getCommunityAddress(community) {
      if (!community) return "";
      var province = community.province,
        city = community.city,
        district = community.district;
      return "".concat(province, " ").concat(city).concat(district ? " ".concat(district) : "");
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 637:
/*!************************************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/subpages/community/select-community.vue?vue&type=style&index=0&id=e631b2ea&lang=scss&scoped=true& ***!
  \************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./select-community.vue?vue&type=style&index=0&id=e631b2ea&lang=scss&scoped=true& */ 638);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_select_community_vue_vue_type_style_index_0_id_e631b2ea_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 638:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/subpages/community/select-community.vue?vue&type=style&index=0&id=e631b2ea&lang=scss&scoped=true& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[631,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subpages/community/select-community.js.map