(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/chat/chat"],{

/***/ 91:
/*!*************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/main.js?{"page":"pages%2Fchat%2Fchat"} ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 30);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _chat = _interopRequireDefault(__webpack_require__(/*! ./pages/chat/chat.vue */ 92));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_chat.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 92:
/*!******************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/chat/chat.vue ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chat.vue?vue&type=template&id=bf16e7f4&scoped=true& */ 93);
/* harmony import */ var _chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chat.vue?vue&type=script&lang=js& */ 95);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chat.vue?vue&type=style&index=0&id=bf16e7f4&lang=scss&scoped=true& */ 97);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 48);

var renderjs





/* normalize component */

var component = Object(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "bf16e7f4",
  null,
  false,
  _chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/chat/chat.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 93:
/*!*************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/chat/chat.vue?vue&type=template&id=bf16e7f4&scoped=true& ***!
  \*************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./chat.vue?vue&type=template&id=bf16e7f4&scoped=true& */ 94);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_template_id_bf16e7f4_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 94:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/pages/chat/chat.vue?vue&type=template&id=bf16e7f4&scoped=true& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  var m0 = _vm.currentTask
    ? _vm.getTaskStatusText(_vm.currentTask.status)
    : null
  var l0 = _vm.__map(_vm.messages, function (message, __i0__) {
    var $orig = _vm.__get_orig(message)
    var m1 = _vm.getUserAvatar(message)
    var m2 =
      !(message.messageType === "text" || !message.messageType) &&
      !(message.messageType === "recall") &&
      !(message.messageType === "address") &&
      !(message.messageType === "image") &&
      message.messageType === "location"
        ? _vm.getLocationName(message.content)
        : null
    var m3 =
      !(message.messageType === "text" || !message.messageType) &&
      !(message.messageType === "recall") &&
      !(message.messageType === "address") &&
      !(message.messageType === "image") &&
      message.messageType === "location"
        ? _vm.getLocationAddress(message.content)
        : null
    var m4 = _vm.formatTime(message.createdAt)
    return {
      $orig: $orig,
      m1: m1,
      m2: m2,
      m3: m3,
      m4: m4,
    }
  })
  var g0 = !_vm.isTaskCompleted
    ? !_vm.inputMessage.trim() || _vm.isSending
    : null
  var g1 =
    _vm.campusResourceId && !_vm.taskId
      ? !_vm.inputMessage.trim() || _vm.isSending
      : null
  var m5 = _vm.showMessageMenu
    ? _vm.canRecallMessage(_vm.selectedMessage)
    : null
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        m0: m0,
        l0: l0,
        g0: g0,
        g1: g1,
        m5: m5,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 95:
/*!*******************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/chat/chat.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./chat.vue?vue&type=script&lang=js& */ 96);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 96:
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/pages/chat/chat.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 38));
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _request = _interopRequireDefault(__webpack_require__(/*! @/common/request.js */ 41));
var _vuex = __webpack_require__(/*! vuex */ 50);
var _simpleMessageBadge = _interopRequireDefault(__webpack_require__(/*! @/common/simpleMessageBadge.js */ 44));
var _realtimeMessageManager = _interopRequireDefault(__webpack_require__(/*! @/common/realtimeMessageManager.js */ 40));
var _methods;
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _default = {
  data: function data() {
    return {
      taskId: null,
      campusResourceId: null,
      otherUserId: null,
      chatTitle: "聊天",
      messages: [],
      inputMessage: "",
      isSending: false,
      isLoading: false,
      scrollTop: 9999999,
      currentPage: 1,
      hasMore: true,
      pollingTimer: null,
      lastMessageId: 0,
      isPageActive: true,
      pollingErrorCount: 0,
      // 新增功能相关状态
      isUploading: false,
      uploadProgress: 0,
      currentTask: null,
      showFunctionMenu: false,
      userAtBottom: true,
      // 用户是否在聊天底部
      isTaskCompleted: false,
      // 任务是否已完成
      // 长按消息菜单相关状态
      showMessageMenu: false,
      selectedMessage: null // 当前选中的消息
    };
  },

  computed: _objectSpread(_objectSpread({}, (0, _vuex.mapState)(["userInfo"])), {}, {
    currentUserId: function currentUserId() {
      var userId = this.userInfo && this.userInfo.id;
      return userId;
    }
  }),
  onLoad: function onLoad(options) {
    var _this = this;
    // 兼容任务聊天、学习伙伴聊天与二手市集聊天
    var normalize = function normalize(v) {
      return v && v !== "null" && v !== "undefined" ? v : null;
    };
    this.taskId = normalize(options.taskId);
    this.campusResourceId = normalize(options.campusResourceId);
    this.otherUserId = options.otherUserId || options.receiverId;
    // 修复URL解码问题
    this.chatTitle = options.title ? decodeURIComponent(options.title) : "聊天";
    console.log("=== 聊天页面开始加载 ===");
    console.log("聊天页面加载参数:", {
      taskId: this.taskId,
      campusResourceId: this.campusResourceId,
      otherUserId: this.otherUserId,
      chatTitle: this.chatTitle
    });
    if (this.taskId || this.findPartnerId || this.otherUserId) {
      // 立即设置滚动位置到底部
      this.scrollTop = 9999999;
      this.loadMessages().then(function () {
        // 消息加载完成后，确保滚动到底部
        _this.$nextTick(function () {
          setTimeout(function () {
            _this.scrollToBottom();
          }, 500);
          // 再次确保滚动到底部
          setTimeout(function () {
            _this.scrollToBottom();
          }, 1000);
        });

        // 消息加载完成后，标记消息为已读
        console.log("准备调用markMessagesAsRead方法");
        _this.markMessagesAsRead().then(function () {
          // 标记完成后，触发实时消息管理器重新检查，更新红点状态
          console.log("消息标记为已读完成，触发重新检查");
          setTimeout(function () {
            _realtimeMessageManager.default.checkNewMessages();
          }, 1000);
        });
      });
      // 禁用chat.vue的轮询，统一使用realtimeMessageManager
      // this.startMessagePolling();
      // 添加实时消息监听
      _realtimeMessageManager.default.addListener(this.onRealtimeMessage);
      // 获取任务信息
      if (this.taskId) {
        this.loadTaskInfo();
      }
      // 启用消息徽章自动刷新（极简版本不需要自动刷新）
      console.log("极简消息红点管理器已启用");
    } else {
      console.error("关联ID不存在，无法加载聊天");
      uni.showToast({
        title: "关联ID不存在",
        icon: "none"
      });
    }
  },
  onShow: function onShow() {
    var _this2 = this;
    // 页面显示时恢复轮询，但不重新加载消息
    this.isPageActive = true;
    this.pollingErrorCount = 0;
    // 禁用chat.vue的轮询，统一使用realtimeMessageManager
    // if (!this.pollingTimer && this.taskId) {
    //   this.startMessagePolling();
    // }

    // 监听键盘事件
    this.setupKeyboardListeners();

    // 只在任务状态可能发生变化时才重新加载任务信息
    // 避免频繁请求导致429错误
    if (this.taskId && !this.currentTask) {
      this.loadTaskInfo();
    }

    // 页面显示时滚动到最新消息
    if (this.messages.length > 0) {
      this.$nextTick(function () {
        setTimeout(function () {
          _this2.scrollToBottom();
        }, 300);
      });
    }

    // 检查是否有临时保存的地址内容
    var tempAddressContent = uni.getStorageSync("tempAddressContent");
    if (tempAddressContent) {
      this.inputMessage = tempAddressContent;
      uni.removeStorageSync("tempAddressContent");
    }

    // 检查是否有从地址选择页面返回的地址（参考快递平台页面的逻辑）
    var selectedAddress = uni.getStorageSync("selectedAddress");
    if (selectedAddress) {
      this.inputMessage = "\u6211\u7684\u5730\u5740\uFF1A".concat(selectedAddress);
      uni.removeStorageSync("selectedAddress");
    }
  },
  onHide: function onHide() {
    // 页面隐藏时停止轮询
    this.isPageActive = false;
    this.stopMessagePolling();

    // 移除键盘监听
    this.removeKeyboardListeners();
  },
  onUnload: function onUnload() {
    this.stopMessagePolling();
    // 移除实时消息监听
    _realtimeMessageManager.default.removeListener(this.onRealtimeMessage);
    // 禁用消息徽章自动刷新（极简版本不需要）
    console.log("极简消息红点管理器已禁用");
  },
  methods: (_methods = {
    loadMessages: function loadMessages() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        var params, res;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this3.isLoading = true;
                _context.prev = 1;
                params = {
                  page: _this3.currentPage,
                  limit: 50
                }; // 按用户ID加载消息，而不是按任务ID
                if (_this3.otherUserId) {
                  params.otherUserId = _this3.otherUserId;
                } else if (_this3.taskId) {
                  params.taskId = _this3.taskId;
                } else if (_this3.findPartnerId) {
                  params.findPartnerId = _this3.findPartnerId;
                }
                _context.next = 6;
                return (0, _request.default)({
                  url: "/chats/messages",
                  method: "GET",
                  data: params
                });
              case 6:
                res = _context.sent;
                if (res && res.messages) {
                  console.log("加载消息成功，数量:", res.messages.length);
                  if (_this3.currentPage === 1) {
                    _this3.messages = res.messages.reverse();
                    // 设置最后消息ID，用于轮询新消息
                    if (_this3.messages.length > 0) {
                      _this3.lastMessageId = Math.max.apply(Math, (0, _toConsumableArray2.default)(_this3.messages.map(function (msg) {
                        return msg.id;
                      })));
                    }
                    // 首次加载完成后滚动到底部
                    _this3.$nextTick(function () {
                      setTimeout(function () {
                        _this3.scrollToBottom();
                      }, 300);
                      // 再次确保滚动到底部
                      setTimeout(function () {
                        _this3.scrollToBottom();
                      }, 600);
                    });
                  } else {
                    _this3.messages = [].concat((0, _toConsumableArray2.default)(res.messages.reverse()), (0, _toConsumableArray2.default)(_this3.messages));
                  }
                  _this3.hasMore = res.messages.length === 50;
                }
                _context.next = 14;
                break;
              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](1);
                console.error("加载消息失败:", _context.t0);
                // 如果是第一次加载失败，显示友好提示
                if (_this3.currentPage === 1) {
                  uni.showModal({
                    title: "连接失败",
                    content: "无法加载聊天记录，请检查网络连接后重试",
                    showCancel: false,
                    confirmText: "重试",
                    success: function success() {
                      _this3.loadMessages();
                    }
                  });
                } else {
                  uni.showToast({
                    title: "加载失败",
                    icon: "none"
                  });
                }
              case 14:
                _context.prev = 14;
                _this3.isLoading = false;
                return _context.finish(14);
              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 10, 14, 17]]);
      }))();
    },
    // 添加新方法：刷新最新消息（不重置分页）
    refreshLatestMessages: function refreshLatestMessages() {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var params, res, newMessages;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                params = {
                  page: 1,
                  limit: 20
                };
                if (_this4.taskId) params.taskId = _this4.taskId;
                if (_this4.campusResourceId) params.campusResourceId = _this4.campusResourceId;
                _context2.next = 6;
                return (0, _request.default)({
                  url: "/chats/messages",
                  method: "GET",
                  data: params
                });
              case 6:
                res = _context2.sent;
                if (res && res.messages) {
                  newMessages = res.messages.reverse(); // 只更新消息列表，不重置分页状态
                  _this4.messages = newMessages;
                  // 更新最后消息ID
                  if (_this4.messages.length > 0) {
                    _this4.lastMessageId = Math.max.apply(Math, (0, _toConsumableArray2.default)(_this4.messages.map(function (msg) {
                      return msg.id;
                    })));
                  }
                  _this4.hasMore = res.messages.length === 20;
                }
                _context2.next = 13;
                break;
              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](0);
                console.error("刷新最新消息失败:", _context2.t0);
              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 10]]);
      }))();
    },
    // 选择相册图片
    chooseImage: function chooseImage() {
      var _this5 = this;
      console.log("chooseImage 方法被调用");
      this.showFunctionMenu = false;
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album"],
        success: function success(res) {
          console.log("选择图片成功:", res);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            _this5.compressAndUploadImage(res.tempFilePaths[0]);
          } else {
            console.error("没有获取到图片路径");
            uni.showToast({
              title: "获取图片失败",
              icon: "none"
            });
          }
        },
        fail: function fail(err) {
          console.error("选择图片失败:", err);
          // 检查是否是用户取消了选择
          if (err.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了图片选择");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            uni.showToast({
              title: "选择图片失败",
              icon: "none"
            });
          }
        }
      });
    },
    // 拍照
    takePhoto: function takePhoto() {
      var _this6 = this;
      console.log("takePhoto 方法被调用");
      this.showFunctionMenu = false;
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        success: function success(res) {
          console.log("拍照成功:", res);
          if (res.tempFilePaths && res.tempFilePaths.length > 0) {
            _this6.compressAndUploadImage(res.tempFilePaths[0]);
          } else {
            console.error("没有获取到图片路径");
            uni.showToast({
              title: "获取图片失败",
              icon: "none"
            });
          }
        },
        fail: function fail(err) {
          console.error("拍照失败:", err);
          // 检查是否是用户取消了拍照
          if (err.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了拍照");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            uni.showToast({
              title: "拍照失败",
              icon: "none"
            });
          }
        }
      });
    },
    // 选择位置
    chooseLocation: function chooseLocation() {
      var _this7 = this;
      this.showFunctionMenu = false;
      uni.chooseLocation({
        success: function success(res) {
          _this7.sendLocationMessage(res);
        },
        fail: function fail(err) {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            console.error("选择位置失败:", err);
            if (err.errMsg.includes("auth deny")) {
              uni.showModal({
                title: "位置权限被拒绝",
                content: "请在设置中开启位置权限，以便发送位置信息",
                showCancel: false,
                confirmText: "知道了"
              });
            } else {
              uni.showToast({
                title: "选择位置失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    // 上传图片
    uploadImage: function uploadImage(filePath) {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var uploadResult, result, imageUrl, _result;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("uploadImage 方法被调用，文件路径:", filePath);
                if (!_this8.isUploading) {
                  _context3.next = 4;
                  break;
                }
                console.log("正在上传中，跳过本次上传");
                return _context3.abrupt("return");
              case 4:
                _this8.isUploading = true;
                _this8.uploadProgress = 0;
                _context3.prev = 6;
                // 显示上传进度
                uni.showLoading({
                  title: "上传中...",
                  mask: true
                });
                console.log("开始上传图片到服务器");

                // 上传图片到服务器
                _context3.next = 11;
                return new Promise(function (resolve, reject) {
                  // 获取用户token
                  var token = uni.getStorageSync("userToken");
                  var headers = {};
                  if (token) {
                    headers.token = token;
                  }
                  console.log("上传请求头:", headers);
                  console.log("上传URL: https://xinghuoyuanbang.top/campushelper/api/v1/upload/chat");
                  var uploadTask = uni.uploadFile({
                    url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/chat",
                    filePath: filePath,
                    name: "file",
                    formData: {},
                    header: headers,
                    success: function success(res) {
                      console.log("上传成功，响应:", res);
                      resolve(res);
                    },
                    fail: function fail(err) {
                      console.error("上传失败:", err);
                      reject(new Error(err.errMsg || "上传失败"));
                    }
                  });

                  // 监听上传进度
                  uploadTask.onProgressUpdate(function (res) {
                    console.log("上传进度:", res.progress + "%");
                    _this8.uploadProgress = res.progress;
                  });
                });
              case 11:
                uploadResult = _context3.sent;
                console.log("上传完成，检查响应状态");

                // 检查响应状态
                if (!(uploadResult.statusCode !== 200)) {
                  _context3.next = 15;
                  break;
                }
                throw new Error("\u4E0A\u4F20\u5931\u8D25\uFF0C\u72B6\u6001\u7801: ".concat(uploadResult.statusCode));
              case 15:
                if (uploadResult.data) {
                  _context3.next = 17;
                  break;
                }
                throw new Error("服务器没有返回数据");
              case 17:
                console.log("服务器返回数据:", uploadResult.data);

                // 解析上传结果
                _context3.prev = 18;
                result = JSON.parse(uploadResult.data);
                console.log("解析后的结果:", result);
                _context3.next = 27;
                break;
              case 23:
                _context3.prev = 23;
                _context3.t0 = _context3["catch"](18);
                console.error("解析响应数据失败:", _context3.t0);
                throw new Error("服务器响应格式错误");
              case 27:
                // 处理不同的响应格式
                imageUrl = null;
                if (result && result.url) {
                  // 直接返回URL的格式
                  imageUrl = result.url;
                } else if (result && result.data && result.data.url) {
                  // 嵌套在data中的格式
                  imageUrl = result.data.url;
                } else if (result && result.success && result.data && result.data.url) {
                  // 完整的成功响应格式
                  imageUrl = result.data.url;
                }
                if (!imageUrl) {
                  _context3.next = 35;
                  break;
                }
                console.log("上传成功，图片URL:", imageUrl);
                // 发送图片消息
                _context3.next = 33;
                return _this8.sendImageMessage(imageUrl);
              case 33:
                _context3.next = 37;
                break;
              case 35:
                console.error("上传结果中没有URL:", result);
                throw new Error(((_result = result) === null || _result === void 0 ? void 0 : _result.message) || "上传失败");
              case 37:
                _context3.next = 43;
                break;
              case 39:
                _context3.prev = 39;
                _context3.t1 = _context3["catch"](6);
                console.error("上传图片失败:", _context3.t1);
                // 显示错误提示
                uni.showToast({
                  title: "\u4E0A\u4F20\u5931\u8D25: ".concat(_context3.t1.message),
                  icon: "none",
                  duration: 3000
                });
              case 43:
                _context3.prev = 43;
                // 确保状态重置和loading隐藏
                _this8.isUploading = false;
                _this8.uploadProgress = 0;

                // 安全地隐藏loading
                try {
                  uni.hideLoading();
                } catch (hideError) {
                  console.warn("隐藏loading失败:", hideError);
                }
                return _context3.finish(43);
              case 48:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[6, 39, 43, 48], [18, 23]]);
      }))();
    },
    // 发送图片消息
    sendImageMessage: function sendImageMessage(imageUrl) {
      var _this9 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var tempId, tempMessage, messageData, res, index, _index;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                console.log("sendImageMessage 方法被调用，图片URL:", imageUrl);

                // 创建临时图片消息
                tempId = "temp_".concat(Date.now(), "_").concat(Math.random());
                tempMessage = {
                  id: tempId,
                  content: imageUrl,
                  messageType: "image",
                  senderId: _this9.currentUserId,
                  receiverId: _this9.otherUserId,
                  createdAt: new Date().toISOString(),
                  isTemp: true,
                  tempId: tempId
                };
                console.log("创建临时消息:", tempMessage);

                // 立即显示
                _this9.messages.push(tempMessage);
                _this9.scrollToBottomImmediate();

                // 发送到后端
                messageData = {
                  receiverId: _this9.otherUserId,
                  content: imageUrl,
                  messageType: "image"
                }; // 如果有当前任务，关联到任务；否则按用户ID发送
                if (_this9.currentTask && _this9.currentTask.id) {
                  messageData.taskId = _this9.currentTask.id;
                } else if (_this9.taskId) {
                  messageData.taskId = _this9.taskId;
                } else if (_this9.campusResourceId) {
                  messageData.campusResourceId = _this9.campusResourceId;
                }
                console.log("发送消息数据:", messageData);
                _context4.next = 12;
                return (0, _request.default)({
                  url: "/chats/send",
                  method: "POST",
                  data: messageData
                });
              case 12:
                res = _context4.sent;
                console.log("发送图片消息的响应:", res);

                // 如果后端返回了消息，替换临时消息
                if (res && res.message) {
                  console.log("后端返回的消息:", res.message);
                  console.log("消息内容:", res.message.content);
                  console.log("消息类型:", res.message.messageType);
                  index = _this9.messages.findIndex(function (msg) {
                    return msg.tempId === tempId;
                  });
                  if (index !== -1) {
                    console.log("找到临时消息，索引:", index);

                    // 确保后端返回的消息有有效的内容
                    if (res.message.content && res.message.content.trim()) {
                      _this9.messages[index] = res.message;
                    } else {
                      console.log("后端返回的消息内容为空，保持临时消息");
                      _this9.messages[index].isTemp = false;
                    }
                  } else {
                    console.log("未找到临时消息");
                  }
                } else {
                  // 后端没有返回消息，保持临时消息
                  console.log("后端没有返回消息，保持临时消息");
                  _index = _this9.messages.findIndex(function (msg) {
                    return msg.tempId === tempId;
                  });
                  if (_index !== -1) {
                    _this9.messages[_index].isTemp = false;
                  }
                }

                // 强制更新视图
                _this9.$forceUpdate();

                // 确保消息发送后滚动到底部
                _this9.$nextTick(function () {
                  _this9.scrollToBottomImmediate();
                });
                console.log("图片消息发送完成");
                _context4.next = 25;
                break;
              case 20:
                _context4.prev = 20;
                _context4.t0 = _context4["catch"](0);
                console.error("发送图片消息失败:", _context4.t0);
                // 发送失败，移除临时消息
                _this9.messages = _this9.messages.filter(function (msg) {
                  return !msg.isTemp;
                });
                uni.showToast({
                  title: "发送失败",
                  icon: "none"
                });
              case 25:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[0, 20]]);
      }))();
    },
    // 发送位置消息
    sendLocationMessage: function sendLocationMessage(locationInfo) {
      var _this10 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var locationContent, tempId, tempMessage, messageData, res, index, _index2;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                locationContent = JSON.stringify({
                  name: locationInfo.name,
                  address: locationInfo.address,
                  latitude: locationInfo.latitude,
                  longitude: locationInfo.longitude
                }); // 创建临时位置消息，立即显示
                tempId = "temp_".concat(Date.now(), "_").concat(Math.random());
                tempMessage = {
                  id: tempId,
                  content: locationContent,
                  messageType: "location",
                  senderId: _this10.currentUserId,
                  receiverId: _this10.otherUserId,
                  createdAt: new Date().toISOString(),
                  isTemp: true,
                  tempId: tempId
                }; // 立即显示
                _this10.messages.push(tempMessage);
                _this10.scrollToBottomImmediate();
                messageData = {
                  receiverId: _this10.otherUserId,
                  content: locationContent,
                  messageType: "location"
                }; // 如果有当前任务，关联到任务；否则按用户ID发送
                if (_this10.currentTask && _this10.currentTask.id) {
                  messageData.taskId = _this10.currentTask.id;
                } else if (_this10.taskId) {
                  messageData.taskId = _this10.taskId;
                } else if (_this10.campusResourceId) {
                  messageData.campusResourceId = _this10.campusResourceId;
                }
                _context5.next = 10;
                return (0, _request.default)({
                  url: "/chats/send",
                  method: "POST",
                  data: messageData
                });
              case 10:
                res = _context5.sent;
                console.log("发送图片消息的响应:", res);

                // 如果后端返回了消息，替换临时消息
                if (res && res.message) {
                  console.log("后端返回的消息:", res.message);
                  console.log("消息内容:", res.message.content);
                  console.log("消息类型:", res.message.messageType);
                  index = _this10.messages.findIndex(function (msg) {
                    return msg.tempId === tempId;
                  });
                  if (index !== -1) {
                    console.log("找到临时消息，索引:", index);

                    // 确保后端返回的消息有有效的内容
                    if (res.message.content && res.message.content.trim()) {
                      _this10.messages[index] = res.message;
                    } else {
                      console.log("后端返回的消息内容为空，保持临时消息");
                      _this10.messages[index].isTemp = false;
                    }
                  } else {
                    console.log("未找到临时消息");
                  }
                } else {
                  // 后端没有返回消息，保持临时消息
                  console.log("后端没有返回消息，保持临时消息");
                  _index2 = _this10.messages.findIndex(function (msg) {
                    return msg.tempId === tempId;
                  });
                  if (_index2 !== -1) {
                    _this10.messages[_index2].isTemp = false;
                  }
                }

                // 强制更新视图
                _this10.$forceUpdate();

                // 确保消息发送后滚动到底部
                _this10.$nextTick(function () {
                  _this10.scrollToBottomImmediate();
                });
                _context5.next = 22;
                break;
              case 17:
                _context5.prev = 17;
                _context5.t0 = _context5["catch"](0);
                console.error("发送位置消息失败:", _context5.t0);
                // 发送失败，移除临时消息
                _this10.messages = _this10.messages.filter(function (msg) {
                  return !msg.isTemp;
                });
                uni.showToast({
                  title: "发送失败",
                  icon: "none"
                });
              case 22:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 17]]);
      }))();
    },
    // 预览图片
    previewImage: function previewImage(imageUrl) {
      // 获取聊天中所有的图片消息
      var imageMessages = this.messages.filter(function (msg) {
        return msg.messageType === "image" && msg.content;
      });
      if (imageMessages.length === 0) {
        uni.showToast({
          title: "没有可预览的图片",
          icon: "none"
        });
        return;
      }

      // 提取所有图片URL
      var imageUrls = imageMessages.map(function (msg) {
        return msg.content;
      });

      // 找到当前点击的图片在数组中的位置
      var currentIndex = imageUrls.indexOf(imageUrl);
      uni.previewImage({
        urls: imageUrls,
        current: currentIndex >= 0 ? currentIndex : 0,
        // 微信小程序不支持 loop 和 indicator 选项，已移除
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function success(data) {
            console.log("选中了第" + (data.tapIndex + 1) + "个按钮");
          },
          fail: function fail(err) {
            console.log(err.errMsg);
          }
        }
      });
    },
    // 处理图片加载错误
    handleImageError: function handleImageError(e) {
      console.error("图片加载失败:", e);

      // 尝试从多个来源获取图片URL
      var imageUrl = null;
      var messageId = null;
      if (e.target && e.target.src) {
        imageUrl = e.target.src;
      } else if (e.target && e.target.dataset && e.target.dataset.url) {
        imageUrl = e.target.dataset.url;
      } else {
        // 尝试从消息对象中获取URL
        if (e.target && e.target.dataset && e.target.dataset.messageId) {
          messageId = e.target.dataset.messageId;
          var message = this.messages.find(function (msg) {
            return (msg.id || msg.tempId) === messageId;
          });
          if (message && message.content) {
            imageUrl = message.content;
          }
        }
      }
      if (imageUrl) {
        // 测试图片URL是否可以访问
        this.testImageUrl(imageUrl);
      }
      uni.showToast({
        title: "图片加载失败",
        icon: "none",
        duration: 3000
      });
    },
    // 测试图片URL是否可以访问
    testImageUrl: function testImageUrl(url) {
      uni.request({
        url: url,
        method: "HEAD",
        success: function success(res) {
          console.log("图片URL测试成功:", res.statusCode);
        },
        fail: function fail(err) {
          console.error("图片URL测试失败:", err.errMsg);
        }
      });
    },
    // 强制刷新图片
    forceRefreshImage: function forceRefreshImage(messageId) {
      // 找到对应的消息
      var messageIndex = this.messages.findIndex(function (msg) {
        return msg.id === messageId || msg.tempId === messageId;
      });
      if (messageIndex !== -1) {
        var message = this.messages[messageIndex];
        if (message.content && message.messageType === "image") {
          // 强制更新图片URL，添加时间戳参数
          var originalUrl = message.content;
          var separator = originalUrl.includes("?") ? "&" : "?";
          var newUrl = "".concat(originalUrl).concat(separator, "t=").concat(Date.now());

          // 更新消息内容
          this.messages[messageIndex].content = newUrl;

          // 强制更新视图
          this.$forceUpdate();
        }
      }
    },
    // 获取位置名称
    getLocationName: function getLocationName(locationContent) {
      try {
        var location = JSON.parse(locationContent);
        return location.name || "未知位置";
      } catch (error) {
        return "未知位置";
      }
    },
    // 获取位置地址
    getLocationAddress: function getLocationAddress(locationContent) {
      try {
        var location = JSON.parse(locationContent);
        return location.address || "地址未知";
      } catch (error) {
        return "地址未知";
      }
    },
    // 打开位置
    openLocation: function openLocation(locationContent) {
      try {
        var location = JSON.parse(locationContent);
        uni.openLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          address: location.address,
          scale: 18
        });
      } catch (error) {
        console.error("打开位置失败:", error);
        uni.showToast({
          title: "打开位置失败",
          icon: "none"
        });
      }
    },
    // 处理回车确认，防止重复发送
    handleConfirm: function handleConfirm() {
      // 如果正在发送中，忽略回车确认
      if (this.isSending) return;
      this.sendMessage();
    },
    // 压缩并上传图片
    compressAndUploadImage: function compressAndUploadImage(filePath) {
      var _this11 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        var compressedPath;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                console.log("compressAndUploadImage 方法被调用，文件路径:", filePath);
                _context6.prev = 1;
                // 显示压缩中提示
                uni.showLoading({
                  title: "压缩图片中...",
                  mask: true
                });

                // 使用微信小程序原生的图片压缩
                _context6.next = 5;
                return _this11.compressImage(filePath);
              case 5:
                compressedPath = _context6.sent;
                console.log("图片压缩完成，压缩后路径:", compressedPath);

                // 隐藏loading
                uni.hideLoading();

                // 上传压缩后的图片
                _context6.next = 10;
                return _this11.uploadImage(compressedPath);
              case 10:
                _context6.next = 19;
                break;
              case 12:
                _context6.prev = 12;
                _context6.t0 = _context6["catch"](1);
                uni.hideLoading();
                console.error("图片压缩失败:", _context6.t0);
                // 如果压缩失败，直接上传原图
                console.log("压缩失败，尝试上传原图:", filePath);
                _context6.next = 19;
                return _this11.uploadImage(filePath);
              case 19:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[1, 12]]);
      }))();
    },
    // 压缩图片 - 使用微信小程序原生API
    compressImage: function compressImage(filePath) {
      return new Promise(function (resolve, reject) {
        // 使用uni.compressImage进行压缩
        uni.compressImage({
          src: filePath,
          quality: 80,
          // 压缩质量80%
          success: function success(res) {
            resolve(res.tempFilePath);
          },
          fail: function fail(err) {
            console.error("压缩失败，使用原图:", err);
            // 压缩失败时返回原图路径
            resolve(filePath);
          }
        });
      });
    },
    // 图片加载成功
    handleImageLoad: function handleImageLoad(e) {
      // 微信小程序中e.target.src可能为undefined，尝试从多个来源获取URL
      var imageUrl = null;
      var messageId = null;
      if (e.target && e.target.src) {
        imageUrl = e.target.src;
      } else if (e.target && e.target.dataset && e.target.dataset.url) {
        imageUrl = e.target.dataset.url;
      } else {
        // 尝试从消息对象中获取URL
        if (e.target && e.target.dataset && e.target.dataset.messageId) {
          messageId = e.target.dataset.messageId;
          var message = this.messages.find(function (msg) {
            return (msg.id || msg.tempId) === messageId;
          });
          if (message && message.content) {
            imageUrl = message.content;
          }
        }
      }

      // 验证URL是否有效
      if (imageUrl && !this.isValidImageUrl(imageUrl)) {
        console.warn("图片URL格式可能有问题:", imageUrl);
      }
    },
    // 验证图片URL是否有效
    isValidImageUrl: function isValidImageUrl(url) {
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return false;
      }

      // 微信小程序环境中的简单URL验证
      return url.startsWith("https://") && (url.includes("xinghuoyuanbang") || url.includes("files"));
    }
  }, (0, _defineProperty2.default)(_methods, "handleImageError", function handleImageError(e) {
    console.error("图片加载失败:", e);
    console.error("图片URL:", e.target.src);
    uni.showToast({
      title: "图片加载失败",
      icon: "none"
    });
  }), (0, _defineProperty2.default)(_methods, "sendMessage", function sendMessage() {
    var _this12 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
      var messageContent, recentMessage, isAddressMessage, messageType, messageData, tempMessage, body, res;
      return _regenerator.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!(!_this12.inputMessage.trim() || _this12.isSending)) {
                _context7.next = 2;
                break;
              }
              return _context7.abrupt("return");
            case 2:
              // 防止重复发送相同内容
              messageContent = _this12.inputMessage.trim();
              recentMessage = _this12.messages[_this12.messages.length - 1];
              if (!(recentMessage && recentMessage.content === messageContent && recentMessage.senderId === _this12.currentUserId && Date.now() - new Date(recentMessage.createdAt).getTime() < 3000)) {
                _context7.next = 7;
                break;
              }
              console.log("检测到重复发送，忽略");
              return _context7.abrupt("return");
            case 7:
              _this12.isSending = true;

              // 判断是否为地址消息
              isAddressMessage = messageContent.startsWith("我的地址：");
              messageType = isAddressMessage ? "address" : "text"; // 使用新的消息管理方法
              messageData = {
                content: messageContent,
                senderId: _this12.currentUserId,
                receiverId: _this12.otherUserId,
                createdAt: new Date().toISOString(),
                messageType: messageType
              }; // 发送新消息（立即显示临时消息）
              tempMessage = _this12.sendNewMessage(messageData);
              _this12.inputMessage = "";
              _context7.prev = 13;
              body = {
                receiverId: _this12.otherUserId,
                content: messageContent,
                messageType: messageType
              }; // 如果有当前任务，关联到任务；否则按用户ID发送
              if (_this12.currentTask && _this12.currentTask.id) {
                body.taskId = _this12.currentTask.id;
              } else if (_this12.taskId) {
                body.taskId = _this12.taskId;
              } else if (_this12.campusResourceId) {
                body.campusResourceId = _this12.campusResourceId;
              }
              _context7.next = 18;
              return (0, _request.default)({
                url: "/chats/send",
                method: "POST",
                data: body
              });
            case 18:
              res = _context7.sent;
              if (res && res.message) {
                // 替换临时消息为真实消息
                _this12.replaceTempMessage(tempMessage.tempId, res.message);
                // 发送成功后滚动到底部
                _this12.$nextTick(function () {
                  _this12.scrollToBottom();
                });
              }

              // 发送消息成功后，不立即检查新消息
              // 因为发送者不应该看到自己发送消息的红点
              // 延迟一段时间后再检查，让接收者有足够时间查看消息
              _context7.next = 27;
              break;
            case 22:
              _context7.prev = 22;
              _context7.t0 = _context7["catch"](13);
              console.error("发送消息失败:", _context7.t0);
              // 移除临时消息
              _this12.removeTempMessage(tempMessage.tempId);
              uni.showToast({
                title: "发送失败，请重试",
                icon: "none",
                duration: 2000
              });
            case 27:
              _context7.prev = 27;
              _this12.isSending = false;
              return _context7.finish(27);
            case 30:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, null, [[13, 22, 27, 30]]);
    }))();
  }), (0, _defineProperty2.default)(_methods, "scrollToBottom", function scrollToBottom() {
    var _this13 = this;
    this.$nextTick(function () {
      if (_this13.messages.length > 0) {
        // 使用一个足够大的固定值滚动到底部
        _this13.scrollTop = 999999;
        console.log("滚动到底部，scrollTop:", _this13.scrollTop, "消息数量:", _this13.messages.length);

        // 如果scrollTop不够大，尝试使用更大的值
        setTimeout(function () {
          _this13.scrollTop = 9999999;
          console.log("再次滚动到底部，scrollTop:", _this13.scrollTop);
        }, 100);
      }
    });
  }), (0, _defineProperty2.default)(_methods, "scrollToBottomImmediate", function scrollToBottomImmediate() {
    if (this.messages.length > 0) {
      // 直接滚动到底部
      this.scrollTop = 9999999;
      console.log("立即滚动到底部，scrollTop:", this.scrollTop, "消息数量:", this.messages.length);
    }
  }), (0, _defineProperty2.default)(_methods, "addNewMessage", function addNewMessage(message) {
    this.messages.push(message);
    this.renderMessages();
    // 发送消息时强制滚动到底部
    this.forceScrollToBottom();
  }), (0, _defineProperty2.default)(_methods, "renderMessages", function renderMessages() {
    // 消息去重
    this.deduplicateMessages();

    // 懒加载优化
    this.optimizeMessageList();

    // Vue的响应式系统会自动重新渲染
    console.log("\u6E32\u67D3\u6D88\u606F\u5217\u8868\uFF0C\u5F53\u524D\u6D88\u606F\u6570\u91CF: ".concat(this.messages.length));
  }), (0, _defineProperty2.default)(_methods, "onNewMessage", function onNewMessage(newMessage) {
    var _this14 = this;
    // 检查是否是自己发送的消息（避免重复显示）
    if (newMessage.senderId === this.currentUserId) {
      console.log("忽略自己发送的消息，避免重复显示");
      return;
    }

    // 添加到消息列表末尾
    this.messages.push(newMessage);
    this.renderMessages();

    // 智能滚动：只有在用户当前在底部时才自动滚动
    this.isUserAtBottom().then(function (shouldScrollToBottom) {
      if (shouldScrollToBottom) {
        _this14.scrollToBottom();
      }
    });

    // 更新消息徽章状态
    console.log("收到新消息，调用onNewMessage");
    _simpleMessageBadge.default.onNewMessage();

    // 显示新消息提示
    uni.showToast({
      title: "收到新消息",
      icon: "none",
      duration: 1000
    });
  }), (0, _defineProperty2.default)(_methods, "sendNewMessage", function sendNewMessage(messageData) {
    // 创建临时消息，立即显示
    var tempMessage = _objectSpread(_objectSpread({
      id: "temp_".concat(Date.now(), "_").concat(Math.random())
    }, messageData), {}, {
      isTemp: true,
      tempId: "temp_".concat(Date.now(), "_").concat(Math.random())
    });

    // 立即添加到列表末尾并滚动
    this.addNewMessage(tempMessage);
    return tempMessage;
  }), (0, _defineProperty2.default)(_methods, "replaceTempMessage", function replaceTempMessage(tempId, realMessage) {
    var index = this.messages.findIndex(function (msg) {
      return msg.tempId === tempId;
    });
    if (index !== -1) {
      this.messages[index] = realMessage;
      console.log("临时消息已替换为真实消息");
    }
  }), (0, _defineProperty2.default)(_methods, "removeTempMessage", function removeTempMessage(tempId) {
    this.messages = this.messages.filter(function (msg) {
      return msg.tempId !== tempId;
    });
    console.log("临时消息已移除");
  }), (0, _defineProperty2.default)(_methods, "optimizeMessageList", function optimizeMessageList() {
    var MAX_DISPLAY_MESSAGES = 100; // 最多显示100条消息

    if (this.messages.length > MAX_DISPLAY_MESSAGES) {
      // 保留最新的消息，移除最旧的消息
      var messagesToRemove = this.messages.length - MAX_DISPLAY_MESSAGES;
      this.messages = this.messages.slice(messagesToRemove);
      console.log("\u4F18\u5316\u6D88\u606F\u5217\u8868\uFF0C\u79FB\u9664\u4E86 ".concat(messagesToRemove, " \u6761\u65E7\u6D88\u606F"));
    }
  }), (0, _defineProperty2.default)(_methods, "deduplicateMessages", function deduplicateMessages() {
    var seen = new Set();
    this.messages = this.messages.filter(function (msg) {
      var key = "".concat(msg.id, "_").concat(msg.createdAt, "_").concat(msg.content);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }), (0, _defineProperty2.default)(_methods, "forceScrollToBottom", function forceScrollToBottom() {
    var _this15 = this;
    this.$nextTick(function () {
      if (_this15.messages.length > 0) {
        // 直接滚动到底部
        _this15.scrollTop = 999999;
        console.log("强制滚动到底部，scrollTop:", _this15.scrollTop);
      }
    });
  }), (0, _defineProperty2.default)(_methods, "onScroll", function onScroll(e) {
    try {
      var _e$detail = e.detail,
        scrollTop = _e$detail.scrollTop,
        scrollHeight = _e$detail.scrollHeight,
        height = _e$detail.height;
      // 如果滚动位置接近底部（允许50px的误差），认为用户在底部
      this.userAtBottom = scrollTop + height >= scrollHeight - 50;
    } catch (error) {
      console.error("onScroll error:", error);
    }
  }), (0, _defineProperty2.default)(_methods, "isUserAtBottom", function isUserAtBottom() {
    // 直接返回缓存的滚动状态
    return Promise.resolve(this.userAtBottom !== false);
  }), (0, _defineProperty2.default)(_methods, "startMessagePolling", function startMessagePolling() {
    var _this16 = this;
    // 每8秒轮询一次新消息，避免触发频率限制
    this.pollingTimer = setInterval(function () {
      _this16.pollNewMessages();
      // 移除频繁的任务状态更新，只在必要时更新
    }, 8000);
  }), (0, _defineProperty2.default)(_methods, "stopMessagePolling", function stopMessagePolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }), (0, _defineProperty2.default)(_methods, "retryMessagePolling", function retryMessagePolling() {
    console.log("手动重试消息轮询");
    this.pollingErrorCount = 0; // 重置错误计数
    this.startMessagePolling(); // 重新开始轮询
    uni.showToast({
      title: "正在重试连接...",
      icon: "loading",
      duration: 1000
    });
  }), (0, _defineProperty2.default)(_methods, "pollNewMessages", function pollNewMessages() {
    var _this17 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
      var params, res, lastMessage;
      return _regenerator.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (_this17.isPageActive) {
                _context8.next = 2;
                break;
              }
              return _context8.abrupt("return");
            case 2:
              if (!(!_this17.lastMessageId || _this17.lastMessageId <= 0)) {
                _context8.next = 4;
                break;
              }
              return _context8.abrupt("return");
            case 4:
              _context8.prev = 4;
              params = {
                lastMessageId: _this17.lastMessageId
              };
              if (_this17.taskId) params.taskId = _this17.taskId;
              if (_this17.campusResourceId) params.campusResourceId = _this17.campusResourceId;
              _context8.next = 10;
              return (0, _request.default)({
                url: "/chats/new-messages",
                method: "GET",
                data: params
              });
            case 10:
              res = _context8.sent;
              if (res && res.messages && res.messages.length > 0) {
                // 过滤掉当前用户发送的消息，避免重复显示
                // 处理新消息 - 使用新的消息管理逻辑
                if (res.messages && res.messages.length > 0) {
                  res.messages.forEach(function (newMessage) {
                    _this17.onNewMessage(newMessage);
                  });
                }

                // 更新最后消息ID
                lastMessage = res.messages[res.messages.length - 1];
                _this17.lastMessageId = Math.max(_this17.lastMessageId, lastMessage.id);
              }
              _context8.next = 34;
              break;
            case 14:
              _context8.prev = 14;
              _context8.t0 = _context8["catch"](4);
              console.error("轮询新消息失败:", _context8.t0);

              // 检查是否是502 Bad Gateway错误
              if (!(_context8.t0.statusCode === 502 || _context8.t0.data && typeof _context8.t0.data === "string" && _context8.t0.data.includes("<!DOCTYPE html>"))) {
                _context8.next = 27;
                break;
              }
              console.warn("检测到502 Bad Gateway错误，可能是服务器暂时不可用");
              _this17.pollingErrorCount = (_this17.pollingErrorCount || 0) + 1;
              if (!(_this17.pollingErrorCount > 3)) {
                _context8.next = 25;
                break;
              }
              console.warn("502错误次数过多，延长轮询间隔");
              _this17.stopMessagePolling();
              // 延长到60秒后重新开始轮询
              setTimeout(function () {
                _this17.retryMessagePolling();
              }, 60000);
              return _context8.abrupt("return");
            case 25:
              // 短暂延迟后继续轮询
              setTimeout(function () {
                _this17.pollNewMessages();
              }, 5000);
              return _context8.abrupt("return");
            case 27:
              if (!(_context8.t0.message && _context8.t0.message.includes("请求过于频繁"))) {
                _context8.next = 32;
                break;
              }
              console.warn("触发频率限制，延长轮询间隔");
              _this17.stopMessagePolling();
              // 延长到30秒后重新开始轮询
              setTimeout(function () {
                _this17.retryMessagePolling();
              }, 30000);
              return _context8.abrupt("return");
            case 32:
              // 如果连续失败次数过多，停止轮询
              _this17.pollingErrorCount = (_this17.pollingErrorCount || 0) + 1;
              if (_this17.pollingErrorCount > 5) {
                console.warn("轮询失败次数过多，停止轮询");
                _this17.stopMessagePolling();
                // 显示网络错误提示
                uni.showToast({
                  title: "网络连接异常，请检查网络",
                  icon: "none",
                  duration: 3000
                });
              }
            case 34:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, null, [[4, 14]]);
    }))();
  }), (0, _defineProperty2.default)(_methods, "loadMoreMessages", function loadMoreMessages() {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadMessages();
    }
  }), (0, _defineProperty2.default)(_methods, "getUserAvatar", function getUserAvatar(message) {
    // 如果是当前用户发送的消息
    if (message.senderId === this.currentUserId) {
      // 优先使用userInfo中的头像
      if (this.userInfo && this.userInfo.avatarUrl) {
        return this.userInfo.avatarUrl;
      }

      // 如果没有头像，使用默认头像
      return "/static/images/default-avatar.png";
    }

    // 如果是其他用户发送的消息
    // 优先使用消息中携带的用户头像信息
    if (message.sender && message.sender.avatarUrl) {
      return message.sender.avatarUrl;
    }
    if (message.senderAvatar) {
      return message.senderAvatar;
    }

    // 尝试从其他可能的字段获取头像
    if (message.otherUserAvatar) {
      return message.otherUserAvatar;
    }
    return "/static/images/default-avatar.png";
  }), (0, _defineProperty2.default)(_methods, "formatTime", function formatTime(timestamp) {
    try {
      var date = new Date(timestamp);
      var now = new Date();
      var diff = now - date;
      if (diff < 60000) {
        // 1分钟内
        return "刚刚";
      } else if (diff < 3600000) {
        // 1小时内
        return "".concat(Math.floor(diff / 60000), "\u5206\u949F\u524D");
      } else if (diff < 86400000) {
        // 24小时内
        return "".concat(Math.floor(diff / 3600000), "\u5C0F\u65F6\u524D");
      } else {
        return "".concat(date.getMonth() + 1, "-").concat(date.getDate(), " ").concat(date.getHours(), ":").concat(date.getMinutes().toString().padStart(2, "0"));
      }
    } catch (error) {
      return "";
    }
  }), (0, _defineProperty2.default)(_methods, "goBack", function goBack() {
    uni.navigateBack();
  }), (0, _defineProperty2.default)(_methods, "showMoreActions", function showMoreActions() {
    var _this18 = this;
    // 使用原生action sheet替代弹窗，避免引用问题
    uni.showActionSheet({
      itemList: ["查看任务详情"],
      success: function success(res) {
        switch (res.tapIndex) {
          case 0:
            _this18.viewTaskDetail();
            break;
        }
      }
    });
  }), (0, _defineProperty2.default)(_methods, "toggleFunctionMenu", function toggleFunctionMenu() {
    console.log("加号按钮被点击");
    this.showFunctionMenu = !this.showFunctionMenu;
  }), (0, _defineProperty2.default)(_methods, "getTaskStatusText", function getTaskStatusText(status) {
    var statusMap = {
      open: "待接单",
      assigned: "订单进行中",
      acceptor_done: "待确认",
      publisher_confirmed: "已完成",
      cancelled: "已取消",
      paid: "已支付"
    };
    return statusMap[status] || "订单进行中";
  }), (0, _defineProperty2.default)(_methods, "checkTaskCompletion", function checkTaskCompletion() {
    if (!this.currentTask) {
      this.isTaskCompleted = false;
      return;
    }

    // 任务完成的状态：publisher_confirmed（发布者确认完成）
    var completedStatuses = ["publisher_confirmed", "paid"];
    this.isTaskCompleted = completedStatuses.includes(this.currentTask.status);
    console.log("任务完成状态检查:", {
      status: this.currentTask.status,
      isCompleted: this.isTaskCompleted
    });
  }), (0, _defineProperty2.default)(_methods, "loadTaskInfo", function loadTaskInfo() {
    var _this19 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
      var res;
      return _regenerator.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              if (_this19.taskId) {
                _context9.next = 3;
                break;
              }
              console.log("没有taskId，跳过任务信息加载");
              return _context9.abrupt("return");
            case 3:
              _context9.prev = 3;
              console.log("开始加载任务信息，taskId:", _this19.taskId);
              _context9.next = 7;
              return (0, _request.default)({
                url: "/tasks/".concat(_this19.taskId),
                method: "GET"
              });
            case 7:
              res = _context9.sent;
              console.log("任务信息响应:", res);
              if (res && res.data) {
                _this19.currentTask = res.data;
                console.log("任务信息加载成功:", _this19.currentTask);
                console.log("当前任务状态:", _this19.currentTask.status, "显示文本:", _this19.getTaskStatusText(_this19.currentTask.status));
                // 检查任务是否已完成
                _this19.checkTaskCompletion();
              } else if (res && res.id) {
                // 如果响应直接是任务对象
                _this19.currentTask = res;
                console.log("任务信息加载成功（直接格式）:", _this19.currentTask);
                console.log("当前任务状态:", _this19.currentTask.status, "显示文本:", _this19.getTaskStatusText(_this19.currentTask.status));
                // 检查任务是否已完成
                _this19.checkTaskCompletion();
              } else {
                console.log("任务信息响应格式不正确:", res);
                // 即使响应格式不正确，也创建一个默认的任务对象
                _this19.currentTask = {
                  id: _this19.taskId,
                  taskType: "快递代取",
                  status: "assigned"
                };
              }
              _context9.next = 19;
              break;
            case 12:
              _context9.prev = 12;
              _context9.t0 = _context9["catch"](3);
              console.error("获取任务信息失败:", _context9.t0);

              // 检查是否是频率限制错误
              if (!(_context9.t0.message && _context9.t0.message.includes("请求过于频繁"))) {
                _context9.next = 18;
                break;
              }
              console.warn("任务信息请求触发频率限制，跳过本次更新");
              return _context9.abrupt("return");
            case 18:
              // 如果获取失败，创建一个默认的任务对象
              _this19.currentTask = {
                id: _this19.taskId,
                taskType: "快递代取",
                status: "assigned"
              };
            case 19:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, null, [[3, 12]]);
    }))();
  }), (0, _defineProperty2.default)(_methods, "viewTaskDetail", function viewTaskDetail() {
    var _this20 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10() {
      var res, task, url, _url, _url2;
      return _regenerator.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              console.log("viewTaskDetail called, taskId:", _this20.taskId);
              console.log("当前页面参数 - taskId:", _this20.taskId, "otherUserId:", _this20.otherUserId);
              if (_this20.taskId) {
                _context10.next = 6;
                break;
              }
              console.error("taskId不存在，无法获取任务信息");
              uni.showToast({
                title: "任务ID不存在",
                icon: "none"
              });
              return _context10.abrupt("return");
            case 6:
              // 显示加载提示
              uni.showLoading({
                title: "获取任务信息中...",
                mask: true
              });
              _context10.prev = 7;
              console.log("开始获取任务信息，taskId:", _this20.taskId);
              console.log("请求URL:", "/tasks/".concat(_this20.taskId));

              // 先获取任务信息来判断任务类型
              _context10.next = 12;
              return (0, _request.default)({
                url: "/tasks/".concat(_this20.taskId),
                method: "GET"
              });
            case 12:
              res = _context10.sent;
              console.log("任务信息响应:", res);
              console.log("响应状态:", res ? "成功" : "失败");
              console.log("响应内容:", JSON.stringify(res, null, 2));

              // 检查响应数据结构
              task = null;
              if (res && res.task) {
                // 如果响应包含task字段
                task = res.task;
                console.log("从res.task获取任务信息");
              } else if (res && res.id) {
                // 如果响应直接是任务对象
                task = res;
                console.log("从res直接获取任务信息");
              }
              if (task) {
                console.log("任务类型:", task.taskType);
                console.log("任务详情:", task);

                // 如果是学习伙伴任务，跳转到专门的学习伙伴详情页面
                if (task.taskType === "学习伙伴") {
                  url = "/subpages/campus-interact/detail?id=".concat(_this20.taskId);
                  console.log("跳转到学习伙伴详情页面:", url);
                  uni.navigateTo({
                    url: url,
                    success: function success() {
                      console.log("跳转学习伙伴详情页面成功");
                    },
                    fail: function fail(err) {
                      console.error("跳转学习伙伴详情页面失败:", err);
                      uni.showToast({
                        title: "页面跳转失败",
                        icon: "none"
                      });
                    }
                  });
                } else {
                  // 其他任务跳转到通用任务详情页面
                  _url = "/subpages/task/task_detail/task_detail?id=".concat(_this20.taskId);
                  console.log("跳转到任务详情页面:", _url);
                  uni.navigateTo({
                    url: _url,
                    success: function success() {
                      console.log("跳转任务详情页面成功");
                    },
                    fail: function fail(err) {
                      console.error("跳转任务详情页面失败:", err);
                      uni.showToast({
                        title: "页面跳转失败",
                        icon: "none"
                      });
                    }
                  });
                }
              } else {
                console.error("任务信息为空或格式不正确:", res);
                console.error("响应结构:", Object.keys(res || {}));

                // 如果获取任务信息失败，尝试直接跳转到任务详情页面
                console.log("尝试直接跳转到任务详情页面");
                _url2 = "/subpages/task/task_detail/task_detail?id=".concat(_this20.taskId);
                uni.navigateTo({
                  url: _url2,
                  success: function success() {
                    console.log("直接跳转任务详情页面成功");
                  },
                  fail: function fail(err) {
                    console.error("直接跳转任务详情页面失败:", err);
                    uni.showToast({
                      title: "获取任务信息失败",
                      icon: "none"
                    });
                  }
                });
              }
              _context10.next = 27;
              break;
            case 21:
              _context10.prev = 21;
              _context10.t0 = _context10["catch"](7);
              console.error("获取任务信息失败:", _context10.t0);
              console.error("错误详情:", _context10.t0.message);
              console.error("错误堆栈:", _context10.t0.stack);

              // 出错时显示错误提示，不跳转
              uni.showToast({
                title: "获取任务信息失败",
                icon: "none"
              });
            case 27:
              _context10.prev = 27;
              // 隐藏加载提示
              uni.hideLoading();
              return _context10.finish(27);
            case 30:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, null, [[7, 21, 27, 30]]);
    }))();
  }), (0, _defineProperty2.default)(_methods, "reportIssue", function reportIssue() {
    var _this21 = this;
    this.$refs.morePopup.close();
    uni.showModal({
      title: "举报问题",
      content: "请描述您遇到的问题",
      editable: true,
      placeholderText: "请输入问题描述",
      success: function success(res) {
        if (res.confirm && res.content) {
          _this21.submitReport(res.content);
        }
      }
    });
  }), (0, _defineProperty2.default)(_methods, "submitReport", function submitReport(content) {
    var _this22 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11() {
      return _regenerator.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.prev = 0;
              _context11.next = 3;
              return (0, _request.default)({
                url: "/chats/report",
                method: "POST",
                data: {
                  taskId: _this22.taskId,
                  content: content
                }
              });
            case 3:
              uni.showToast({
                title: "举报成功",
                icon: "success"
              });
              _context11.next = 9;
              break;
            case 6:
              _context11.prev = 6;
              _context11.t0 = _context11["catch"](0);
              uni.showToast({
                title: "举报失败",
                icon: "none"
              });
            case 9:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, null, [[0, 6]]);
    }))();
  }), (0, _defineProperty2.default)(_methods, "publishAddress", function publishAddress() {
    // 跳转到地址选择页面，让用户从已保存的地址中选择
    uni.navigateTo({
      url: "/subpages/profile/select-address?from=chat&taskId=".concat(this.taskId, "&otherUserId=").concat(this.otherUserId),
      fail: function fail(err) {
        console.log("跳转地址页面失败:", err);
        // 如果地址页面不存在，显示提示
        uni.showModal({
          title: "功能开发中",
          content: "地址管理功能正在开发中，请稍后再试",
          showCancel: false,
          confirmText: "知道了"
        });
      }
    });
  }), (0, _defineProperty2.default)(_methods, "saveAddress", function saveAddress() {
    uni.showModal({
      title: "保存地址",
      content: "请输入要保存的地址",
      editable: true,
      placeholderText: "请输入详细地址",
      success: function success(res) {
        if (res.confirm && res.content) {
          // 这里可以调用API保存地址
          console.log("保存地址:", res.content);
          uni.showToast({
            title: "地址保存成功",
            icon: "success"
          });
        }
      }
    });
  }), (0, _defineProperty2.default)(_methods, "selectFromMap", function selectFromMap() {
    // 调用地图选择功能
    uni.chooseLocation({
      success: function success(res) {
        console.log("选择的位置：", res);
        uni.showToast({
          title: "位置选择成功",
          icon: "success"
        });
      },
      fail: function fail(err) {
        console.log("选择位置失败：", err);
        // 如果是权限问题，给出更详细的提示
        if (err.errMsg && err.errMsg.includes("auth")) {
          uni.showModal({
            title: "需要位置权限",
            content: "请在设置中允许使用位置信息",
            showCancel: false,
            confirmText: "知道了"
          });
        } else {
          uni.showToast({
            title: "位置选择失败",
            icon: "none"
          });
        }
      }
    });
  }), (0, _defineProperty2.default)(_methods, "handleAvatarError", function handleAvatarError(e) {
    console.error("头像加载失败:", e);
    console.error("头像路径:", e.target.src);
    // 头像加载失败时，使用默认头像
    e.target.src = "/static/images/default-avatar.png";
    console.log("已设置默认头像路径");
  }), (0, _defineProperty2.default)(_methods, "applyAfterSale", function applyAfterSale() {
    var _this23 = this;
    // 跳转到售后页面，传递任务ID
    uni.navigateTo({
      url: "/pages/after_sales/after_sales?id=".concat(this.taskId),
      success: function success() {
        console.log("跳转售后页面成功，taskId:", _this23.taskId);
      },
      fail: function fail(err) {
        console.error("跳转售后页面失败:", err);
        uni.showToast({
          title: "页面跳转失败",
          icon: "none"
        });
      }
    });
  }), (0, _defineProperty2.default)(_methods, "shareActivity", function shareActivity() {
    if (!this.campusResourceId) {
      uni.showToast({
        title: "无法获取活动信息",
        icon: "none"
      });
      return;
    }

    // 复制分享链接
    var shareUrl = "https://xinghuoyuanbang.top/campus-interact/".concat(this.campusResourceId);
    uni.setClipboardData({
      data: shareUrl,
      success: function success() {
        uni.showToast({
          title: "分享链接已复制",
          icon: "success"
        });
      }
    });
  }), (0, _defineProperty2.default)(_methods, "viewActivityDetail", function viewActivityDetail() {
    if (!this.campusResourceId) {
      uni.showToast({
        title: "无法获取活动信息",
        icon: "none"
      });
      return;
    }

    // 跳转到学习伙伴详情页
    uni.navigateTo({
      url: "/subpages/campus-interact/detail?id=".concat(this.campusResourceId)
    });
  }), (0, _defineProperty2.default)(_methods, "closeChat", function closeChat() {
    uni.navigateBack();
  }), (0, _defineProperty2.default)(_methods, "onRealtimeMessage", function onRealtimeMessage(data) {
    console.log("聊天页面收到实时消息通知:", data);
    // 重置实时消息管理器的检查时间，避免重复处理
    _realtimeMessageManager.default.resetCheckTime();
  }), (0, _defineProperty2.default)(_methods, "markMessagesAsRead", function markMessagesAsRead() {
    var _this24 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee12() {
      var type, id, response;
      return _regenerator.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              console.log("聊天页面markMessagesAsRead方法被调用");
              _context12.prev = 1;
              type = "task";
              id = _this24.taskId;
              if (_this24.campusResourceId) {
                type = "partner";
                id = _this24.campusResourceId;
              } else if (_this24.otherUserId) {
                type = "chat";
                id = "chat_".concat([_this24.currentUserId, _this24.otherUserId].sort().join("_"));
              }
              console.log("聊天页面标记消息为已读:", {
                type: type,
                id: id,
                taskId: _this24.taskId,
                campusResourceId: _this24.campusResourceId,
                otherUserId: _this24.otherUserId
              });
              if (!id) {
                _context12.next = 16;
                break;
              }
              // 调用API标记消息为已读
              console.log("正在调用API标记消息为已读:", type, id);
              _context12.next = 10;
              return (0, _request.default)({
                url: "/chats/mark-read",
                method: "POST",
                data: {
                  type: type,
                  id: id
                }
              });
            case 10:
              response = _context12.sent;
              console.log("标记消息为已读API响应:", response);
              console.log("聊天页面标记消息为已读完成");

              // 标记完成后，立即检查新消息状态，更新红点
              setTimeout(function () {
                _realtimeMessageManager.default.checkNewMessages();
              }, 500);
              _context12.next = 17;
              break;
            case 16:
              console.log("聊天页面没有有效的ID，跳过标记已读");
            case 17:
              _context12.next = 22;
              break;
            case 19:
              _context12.prev = 19;
              _context12.t0 = _context12["catch"](1);
              console.error("标记消息为已读失败:", _context12.t0);
            case 22:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, null, [[1, 19]]);
    }))();
  }), (0, _defineProperty2.default)(_methods, "setupKeyboardListeners", function setupKeyboardListeners() {
    // 简化处理，主要依靠adjust-position属性
    console.log("设置键盘监听器");
  }), (0, _defineProperty2.default)(_methods, "removeKeyboardListeners", function removeKeyboardListeners() {
    // 移除键盘监听
    console.log("移除键盘监听器");
  }), (0, _defineProperty2.default)(_methods, "onMessageLongPress", function onMessageLongPress(message) {
    console.log("长按消息:", message);
    this.selectedMessage = message;
    this.showMessageMenu = true;
  }), (0, _defineProperty2.default)(_methods, "hideMessageMenu", function hideMessageMenu() {
    this.showMessageMenu = false;
    this.selectedMessage = null;
  }), (0, _defineProperty2.default)(_methods, "copyMessage", function copyMessage() {
    if (!this.selectedMessage) return;
    uni.setClipboardData({
      data: this.selectedMessage.content,
      success: function success() {
        uni.showToast({
          title: "已复制到剪贴板",
          icon: "success"
        });
      },
      fail: function fail() {
        uni.showToast({
          title: "复制失败",
          icon: "none"
        });
      }
    });
    this.hideMessageMenu();
  }), (0, _defineProperty2.default)(_methods, "canRecallMessage", function canRecallMessage(message) {
    console.log("检查是否可以撤回消息:", message);
    console.log("当前用户ID:", this.currentUserId);
    if (!message || !this.currentUserId) {
      console.log("消息或用户ID不存在");
      return false;
    }

    // 只能撤回自己发送的消息
    if (message.senderId !== this.currentUserId) {
      console.log("不是自己发送的消息，发送者ID:", message.senderId);
      return false;
    }

    // 只能撤回文本消息（暂不支持撤回图片、位置等）
    if (message.messageType !== "text" && message.messageType !== undefined) {
      console.log("不是文本消息，消息类型:", message.messageType);
      return false;
    }

    // 检查消息发送时间，超过10分钟不能撤回
    var messageTime = new Date(message.createdAt).getTime();
    var now = Date.now();
    var timeDiff = now - messageTime;
    var maxRecallTime = 10 * 60 * 1000; // 10分钟

    console.log("消息时间检查:", {
      messageTime: new Date(message.createdAt),
      now: new Date(now),
      timeDiff: timeDiff,
      maxRecallTime: maxRecallTime,
      canRecall: timeDiff <= maxRecallTime
    });
    return timeDiff <= maxRecallTime;
  }), (0, _defineProperty2.default)(_methods, "recallMessage", function recallMessage() {
    var _this25 = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee13() {
      var response, messageIndex;
      return _regenerator.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              if (!(!_this25.selectedMessage || !_this25.canRecallMessage(_this25.selectedMessage))) {
                _context13.next = 3;
                break;
              }
              uni.showToast({
                title: "无法撤回此消息",
                icon: "none"
              });
              return _context13.abrupt("return");
            case 3:
              _context13.prev = 3;
              _context13.next = 6;
              return (0, _request.default)({
                url: "/chats/".concat(_this25.selectedMessage.id, "/recall"),
                method: "PUT"
              });
            case 6:
              response = _context13.sent;
              if (response && response.success) {
                // 更新本地消息列表
                messageIndex = _this25.messages.findIndex(function (msg) {
                  return msg.id === _this25.selectedMessage.id;
                });
                if (messageIndex !== -1) {
                  // 标记消息为已撤回
                  _this25.messages[messageIndex].isRecalled = true;
                  _this25.messages[messageIndex].content = "您撤回了一条消息";
                  _this25.messages[messageIndex].messageType = "recall";
                }
                uni.showToast({
                  title: "消息已撤回",
                  icon: "success"
                });
              } else {
                uni.showToast({
                  title: (response === null || response === void 0 ? void 0 : response.message) || "撤回失败",
                  icon: "none"
                });
              }
              _context13.next = 14;
              break;
            case 10:
              _context13.prev = 10;
              _context13.t0 = _context13["catch"](3);
              console.error("撤回消息失败:", _context13.t0);
              uni.showToast({
                title: "撤回失败，请稍后重试",
                icon: "none"
              });
            case 14:
              _this25.hideMessageMenu();
            case 15:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, null, [[3, 10]]);
    }))();
  }), _methods)
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 97:
/*!****************************************************************************************************************!*\
  !*** D:/Document/test/test/星火园帮/pages/chat/chat.vue?vue&type=style&index=0&id=bf16e7f4&lang=scss&scoped=true& ***!
  \****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../../Develop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./chat.vue?vue&type=style&index=0&id=bf16e7f4&lang=scss&scoped=true& */ 98);
/* harmony import */ var _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Develop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Develop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Develop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Develop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_chat_vue_vue_type_style_index_0_id_bf16e7f4_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 98:
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!D:/Document/test/test/星火园帮/pages/chat/chat.vue?vue&type=style&index=0&id=bf16e7f4&lang=scss&scoped=true& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[91,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/chat.js.map