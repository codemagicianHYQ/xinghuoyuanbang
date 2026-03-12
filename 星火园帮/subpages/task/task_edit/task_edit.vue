<template>
  <view class="task-edit-container">
    <form @submit="submitTaskEdit">
      <view class="form-section">
        <view class="form-item">
          <text class="item-label">
            任务标题 <text class="required-star">*</text>
          </text>
          <input
            class="input-field"
            name="title"
            v-model="formData.title"
            placeholder="请输入任务标题"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">任务类型</text>
          <view class="picker-value readonly">
            {{ getTypeLabel(formData.taskType) || "加载中..." }}
          </view>
        </view>

        <!-- 任务详情 -->
        <view class="form-item">
          <text class="item-label">
            任务详情 <text class="required-star">*</text>
          </text>
          <view class="specifics-editor">
            <view
              class="specifics-line"
              v-for="(line, index) in specificsLines"
              :key="index"
            >
              <text class="specifics-label">{{ line.label }}</text>
              <!-- 活动类型快捷选择 -->
              <picker
                v-if="line.label === '活动类型:'"
                :range="activityTypeOptions"
                @change="(e) => bindActivityTypeChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择活动类型" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 需要人数快捷选择 -->
              <picker
                v-else-if="line.label === '需要人数'"
                :range="peopleNumberOptions"
                @change="(e) => bindPeopleNumberChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择需要人数" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 费用方式快捷选择 -->
              <picker
                v-else-if="line.label === '费用方式:'"
                :range="costMethodOptions"
                @change="(e) => bindCostMethodChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择费用方式" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 活动时间快捷选择 -->
              <view
                v-else-if="line.label === '活动时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 快递平台快捷选择 -->
              <picker
                v-else-if="line.label === '快递平台'"
                :range="expressPlatformOptions"
                @change="(e) => bindExpressPlatformChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择快递平台" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 包裹大小快捷选择 -->
              <picker
                v-else-if="line.label === '包裹大小:'"
                :range="packageSizeOptions"
                @change="(e) => bindPackageSizeChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择包裹大小" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 课程时长快捷选择 -->
              <picker
                v-else-if="line.label === '课程时长:'"
                :range="durationOptions"
                @change="(e) => bindDurationChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择课程时长" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 上课时间快捷选择 -->
              <view
                v-else-if="line.label === '上课时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 期望送达时间快捷选择 -->
              <view
                v-else-if="line.label === '期望送达:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 截止时间快捷选择 -->
              <view
                v-else-if="line.label === '截止时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 借用时间快捷选择 -->
              <view
                v-else-if="line.label === '借用时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 归还时间快捷选择 -->
              <view
                v-else-if="line.label === '归还时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 开黑时间快捷选择 -->
              <view
                v-else-if="line.label === '开黑时间'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 时间要求快捷选择 -->
              <view
                v-else-if="line.label === '时间要求:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 游戏时间快捷选择 -->
              <view
                v-else-if="line.label === '游戏时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 搬运时间快捷选择 -->
              <view
                v-else-if="line.label === '搬运时间:'"
                class="time-picker-group"
              >
                <picker
                  mode="date"
                  :value="getDateFromLine(line)"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindSpecificsDateChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getDateFromLine(line) || "选择日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
                <picker
                  mode="time"
                  :value="getTimeFromLine(line)"
                  :start="minTime"
                  @change="(e) => bindSpecificsTimeChange(index, e)"
                >
                  <view class="quick-select-box time-picker-item">
                    {{ getTimeFromLine(line) || "选择时间" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>
              <!-- 文档类型快捷选择 -->
              <picker
                v-else-if="line.label === '文档类型:'"
                :range="documentTypeOptions"
                @change="(e) => bindDocumentTypeChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择文档类型" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 搬运类型快捷选择 -->
              <picker
                v-else-if="line.label === '搬运类型:'"
                :range="movingTypeOptions"
                @change="(e) => bindMovingTypeChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择搬运类型" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 物品类型快捷选择 -->
              <picker
                v-else-if="line.label === '物品类型:'"
                :range="itemTypeOptions"
                @change="(e) => bindItemTypeChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择物品类型" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 游戏人数快捷选择 -->
              <picker
                v-else-if="line.label === '需要人数'"
                :range="gamePlayerNumberOptions"
                @change="(e) => bindGamePlayerNumberChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择需要人数" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 语音方式快捷选择 -->
              <picker
                v-else-if="line.label === '语音方式:'"
                :range="voiceOptions"
                @change="(e) => bindVoiceChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择语音方式" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 帮助类型快捷选择 -->
              <picker
                v-else-if="line.label === '帮助类型:'"
                :range="helpTypeOptions"
                @change="(e) => bindHelpTypeChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择帮助类型" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>
              <!-- 紧急程度快捷选择 -->
              <picker
                v-else-if="line.label === '紧急程度'"
                :range="urgencyLevelOptions"
                @change="(e) => bindUrgencyChange(index, e)"
              >
                <view class="quick-select-box">
                  {{ line.value || "请选择紧急程度" }}
                  <text class="picker-arrow"></text>
                </view>
              </picker>

              <!-- 借物品开始日期选择 -->
              <view
                v-else-if="line.label === '开始日期'"
                class="start-date-container"
              >
                <picker
                  mode="date"
                  :value="line.value"
                  :start="minDate"
                  :end="maxDate"
                  @change="(e) => bindBorrowStartDateChange(index, e)"
                >
                  <view class="quick-select-box">
                    {{ line.value || "选择开始日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>
              </view>

              <!-- 借物品归还日期选择 -->
              <view
                v-else-if="line.label === '归还日期:'"
                class="return-date-container"
              >
                <picker
                  mode="date"
                  :value="line.value"
                  :start="getBorrowStartDate() || minDate"
                  :end="maxReturnDate"
                  @change="(e) => bindBorrowReturnDateChange(index, e)"
                >
                  <view class="quick-select-box">
                    {{ line.value || "选择归还日期" }}
                    <text class="picker-arrow"></text>
                  </view>
                </picker>

                <!-- 借用时长直接显示在选择框下-->
                <view
                  v-if="
                    formData.taskType === '借物品' &&
                    calculateDisplayDuration() > 0
                  "
                  class="duration-display"
                >
                  <text class="duration-text">
                    借用时长: {{ calculateDisplayDuration() }}天
                  </text>
                </view>
              </view>

              <!-- 其他字段保持文本输入 -->
              <input
                v-else
                class="specifics-input"
                v-model="line.value"
                :placeholder="line.placeholder"
                @input="updateSpecifics"
              />
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">
            任务描述 <text class="required-star">*</text>
          </text>
          <textarea
            class="textarea-field"
            name="description"
            v-model="formData.description"
            placeholder="请详细描述您的任务需求..."
            :maxlength="formData.taskType === '学习伙伴' ? 300 : 500"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            任务地点 <text class="required-star">*</text>
          </text>
          <input
            class="input-field"
            name="locationText"
            v-model="formData.locationText"
            placeholder="如：3号宿舍楼201房间"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <text class="item-label">
            赏金金额 <text class="required-star">*</text>
          </text>
          <view class="reward-section">
            <view class="current-reward">
              <text class="reward-label">当前赏金</text>
              <text class="reward-amount"
                >¥{{ originalRewardAmount || "0.00" }}</text
              >
            </view>
            <view class="reward-increase">
              <text class="reward-label">增加赏金</text>
              <input
                class="input-field reward-input"
                type="digit"
                name="rewardIncrease"
                v-model="formData.rewardIncrease"
                placeholder="输入增加的金额（元）"
                @input="onRewardIncreaseChange"
              />
            </view>
            <view
              class="new-reward"
              v-if="
                formData.rewardIncrease &&
                parseFloat(formData.rewardIncrease) > 0
              "
            >
              <text class="reward-label">新赏金：</text>
              <text class="reward-amount new-amount"
                >¥{{ newRewardAmount }}</text
              >
              <text class="reward-tip">增加赏金接单速度更快</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">截止时间</text>
          <view class="time-picker-group">
            <picker
              mode="date"
              :value="formData.deadlineDate"
              :start="minDate"
              :end="maxDate"
              @change="bindDateChange"
            >
              <view class="picker-value input-imitation time-picker-item">
                {{ formData.deadlineDate || "选择日期" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
            <picker
              mode="time"
              :value="formData.deadlineTime"
              :start="minTime"
              @change="bindTimeChange"
            >
              <view class="picker-value input-imitation time-picker-item">
                {{ formData.deadlineTime || "选择时间" }}
                <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <button
        form-type="submit"
        class="submit-btn"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        保存修改
      </button>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      taskId: null,
      formData: {
        title: "",
        taskType: "",
        description: "",
        locationText: "",
        rewardAmount: "",
        rewardIncrease: "", // 增加的赏金金额        deadlineDate: "",
        deadlineTime: "",
        specifics: "", // 任务详情信息
      },

      isSubmitting: false,
      originalTask: null,
      specificsLines: [], // 任务详情行数
      // 快捷选择相关数据
      showQuickSelectModal: false,
      quickSelectTitle: "",
      quickSelectOptions: [],
      currentEditingIndex: -1,
      currentEditingType: "",

      // 选择器选项
      activityTypeOptions: ["学习", "运动", "美食", "娱乐", "购物", "其他"],
      peopleNumberOptions: ["1", "2", "3", "4", "5", "6人以上"],
      costMethodOptions: ["AA制", "我请", "你请", "其他"],
      expressPlatformOptions: [
        "顺丰",
        "圆通",
        "中通",
        "申通",
        "韵达",
        "京东",
        "菜鸟驿站",
        "其他",
      ],
      packageSizeOptions: ["小件", "中件", "大件"],
      durationOptions: ["45分钟", "90分钟", "2小时", "3小时", "半天", "全天"],
      documentTypeOptions: [
        "论文",
        "报告",
        "总结",
        "演讲",
        "申请",
        "策划",
        "其他",
      ],
      movingTypeOptions: [
        "宿舍搬迁",
        "快递搬运",
        "行李托运",
        "家具搬运",
        "其他物品",
      ],
      itemTypeOptions: [
        "电子产品",
        "生活用品",
        "学习用品",
        "运动器材",
        "工具",
        "其他",
      ],
      gamePlayerNumberOptions: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      voiceOptions: [
        "游戏内语音",
        "QQ语音",
        "微信语音",
        "YY语音",
        "不需要语音",
      ],
      helpTypeOptions: [
        "学习辅导",
        "技术支持",
        "生活帮助",
        "心理支持",
        "信息咨询",
        "其他",
      ],
      urgencyLevelOptions: ["一般", "较急", "紧急", "非常紧急"],
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
    }),
    minDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },
    maxDate() {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30); // 最多30天后
      return maxDate.toISOString().split("T")[0];
    },
    maxReturnDate() {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90); // 最多90天后
      return maxDate.toISOString().split("T")[0];
    },
    minTime() {
      return "00:00";
    },
    originalRewardAmount() {
      if (
        !this.originalTask ||
        this.originalTask.rewardAmount === undefined ||
        this.originalTask.rewardAmount === null
      ) {
        return "0.00";
      }
      const amount = Number(this.originalTask.rewardAmount);
      return isNaN(amount) ? "0.00" : amount.toFixed(2);
    },
    newRewardAmount() {
      // 强制转换为数字类型
      const increase = Number(this.formData.rewardIncrease) || 0;
      const originalAmount = Number(this.originalTask?.rewardAmount) || 0;

      // 调试信息
      console.log("Debug newRewardAmount:", {
        increase: increase,
        originalAmount: originalAmount,
        increaseType: typeof increase,
        originalType: typeof originalAmount,
        rawOriginal: this.originalTask?.rewardAmount,
      });

      const total = originalAmount + increase;
      console.log("Total calculated:", total);

      return total.toFixed(2); // 保留两位小数
    },
  },
  onLoad(options) {
    this.taskId = options.id;
    if (this.taskId) {
      this.fetchTaskDetail();
    } else {
      uni.showToast({ title: "无效的任务ID", icon: "none" });
      uni.navigateBack();
    }
  },
  methods: {
    getTypeLabel(typeValue) {
      const typeMap = {
        取快递: "取快递",
        取外卖: "取外卖",
        帮我买: "帮我买",
        课程代替: "课程代替",
        借物品: "借物品",
        游戏陪玩: "游戏陪玩",
        学习伙伴: "学习伙伴",
        学习互助: "学习互助",
        搬运服务: "搬运服务",
        其他服务: "其他服务",
        求资料: "求资料",
      };
      return typeMap[typeValue] || typeValue;
    },

    bindDateChange(e) {
      this.formData.deadlineDate = e.detail.value;
    },
    bindTimeChange(e) {
      this.formData.deadlineTime = e.detail.value;
    },

    onRewardIncreaseChange() {
      // 验证输入的金额      const increase = parseFloat(this.formData.rewardIncrease);
      if (increase < 0) {
        this.formData.rewardIncrease = "0";
        uni.showToast({ title: "增加金额不能为负数", icon: "none" });
      }

      // 强制触发重新计算
      this.$forceUpdate();
    },

    parseSpecifics(specifics) {
      // 解析任务详情字符串，分离标签和内容
      const lines = specifics.split("\n").filter((line) => line.trim());
      this.specificsLines = [];

      lines.forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const label = line.substring(0, colonIndex + 1);
          let value = line.substring(colonIndex + 1).trim();

          // 跳过借用时长行，因为它现在是自动计算显示
          if (label === "借用时长:") {
            return;
          }

          // 将英文包裹大小转换为中文
          if (label === "包裹大小:") {
            if (value === "small") value = "小件";
            else if (value === "medium") value = "中件";
            else if (value === "large") value = "大件";
          }

          // 【修复/改进】统一处理 '开始日期'，将其标签也加上冒号，以匹配 '归还日期:' 的格式，方便查找
          let finalLabel = label;
          if (label.trim() === "开始日期") {
            finalLabel = "开始日期:";
          }

          this.specificsLines.push({
            label: finalLabel,
            value: value,
            placeholder: `请输入${finalLabel.replace(":", "")}`,
          });
        } else {
          // 如果没有冒号，作为普通文本处理
          this.specificsLines.push({
            label: "",
            value: line,
            placeholder: "请输入内容",
          });
        }
      });

      // 如果没有解析到任何行，添加默认行
      if (this.specificsLines.length === 0) {
        this.specificsLines.push({
          label: "活动类型:",
          value: "",
          placeholder: "请输入活动类型",
        });
      }
    },

    updateSpecifics() {
      // 将编辑后的行数据重新组合成字符串，过滤掉借用时长
      this.formData.specifics = this.specificsLines
        .filter((line) => line.label !== "借用时长:")
        .map((line) => line.label + " " + line.value)
        .join("\n");
    },
    async fetchTaskDetail() {
      try {
        console.log(
          `[fetchTaskDetail] 开始获取任务详情，任务ID: ${this.taskId}`
        );

        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });

        console.log("[fetchTaskDetail] 获取到的任务详情:", res);
        this.originalTask = res;

        // 填充表单数据 - 如果标题包含任务类型标签，则去掉标签部分
        const fullTitle = res.title || "";
        const taskType = res.taskType || "";

        // 如果标题包含任务类型标签，则去掉标签部分
        let titleContent = fullTitle;
        if (fullTitle && taskType) {
          const taskTypeLabel = this.getTypeLabel(taskType);
          const prefix = taskTypeLabel + ":";

          if (fullTitle.startsWith(prefix)) {
            titleContent = fullTitle.substring(prefix.length).trim();
          }
        }

        this.$set(this.formData, "title", titleContent);
        this.formData.taskType = res.taskType || "";
        this.formData.description = res.description || "";
        this.formData.locationText = res.locationText || "";
        this.formData.rewardAmount = res.rewardAmount
          ? res.rewardAmount.toString()
          : "";
        this.formData.specifics = res.specifics || "";
        this.parseSpecifics(res.specifics || "");

        // 强制更新视图
        this.$forceUpdate();

        console.log("[fetchTaskDetail] 基础字段填充完成:", {
          title: this.formData.title,
          taskType: this.formData.taskType,
          description: this.formData.description,
          locationText: this.formData.locationText,
          rewardAmount: this.formData.rewardAmount,
        });

        // 处理截止时间（使用本地时间，与详情页面一致）
        if (res.deadline) {
          const deadline = new Date(res.deadline);
          // 使用本地时间格式化，避免时区转换问题
          const year = deadline.getFullYear();
          const month = String(deadline.getMonth() + 1).padStart(2, "0");
          const day = String(deadline.getDate()).padStart(2, "0");
          const hour = String(deadline.getHours()).padStart(2, "0");
          const minute = String(deadline.getMinutes()).padStart(2, "0");
          
          this.formData.deadlineDate = `${year}-${month}-${day}`;
          this.formData.deadlineTime = `${hour}:${minute}`;
          console.log("[fetchTaskDetail] 截止时间处理完成:", {
            deadlineDate: this.formData.deadlineDate,
            deadlineTime: this.formData.deadlineTime,
            originalDeadline: res.deadline,
          });
        }

        // 填充取快递专用字段
        if (res.taskType === "取快递") {
          this.formData.platform = res.platform || "";
          this.formData.pickupCode = res.pickupCode || "";
          this.formData.pickupLocation = res.pickupLocation || "";
          this.formData.deliveryAddress = res.deliveryAddress || "";
          this.formData.packageSize = res.packageSize || "中件";
          this.formData.remarks = res.remarks || "";

          if (res.expectedDelivery) {
            const expectedDelivery = new Date(res.expectedDelivery);
            // 使用本地时间格式化，避免时区转换问题
            const year = expectedDelivery.getFullYear();
            const month = String(expectedDelivery.getMonth() + 1).padStart(2, "0");
            const day = String(expectedDelivery.getDate()).padStart(2, "0");
            const hour = String(expectedDelivery.getHours()).padStart(2, "0");
            const minute = String(expectedDelivery.getMinutes()).padStart(2, "0");
            
            this.formData.expectedDate = `${year}-${month}-${day}`;
            this.formData.expectedTime = `${hour}:${minute}`;
          }

          console.log("[fetchTaskDetail] 取快递字段填充完成", {
            platform: this.formData.platform,
            pickupCode: this.formData.pickupCode,
            pickupLocation: this.formData.pickupLocation,
            deliveryAddress: this.formData.deliveryAddress,
            packageSize: this.formData.packageSize,
            remarks: this.formData.remarks,
            expectedDate: this.formData.expectedDate,
            expectedTime: this.formData.expectedTime,
          });
        }

        // 填充学习伙伴专用字段
        if (res.taskType === "学习伙伴") {
          this.formData.activityType = res.activityType || "";
          this.formData.activityName = res.activityName || "";
          this.formData.peopleNumber = res.peopleNumber || "";
          this.formData.costMethod = res.costMethod || "";

          if (res.activityTime) {
            const activityTime = new Date(res.activityTime);
            // 使用本地时间格式化，避免时区转换问题
            const year = activityTime.getFullYear();
            const month = String(activityTime.getMonth() + 1).padStart(2, "0");
            const day = String(activityTime.getDate()).padStart(2, "0");
            const hour = String(activityTime.getHours()).padStart(2, "0");
            const minute = String(activityTime.getMinutes()).padStart(2, "0");
            
            this.formData.activityDate = `${year}-${month}-${day}`;
            this.formData.activityTime = `${hour}:${minute}`;
          }

          console.log("[fetchTaskDetail] 学习伙伴字段填充完成", {
            activityType: this.formData.activityType,
            activityName: this.formData.activityName,
            peopleNumber: this.formData.peopleNumber,
            costMethod: this.formData.costMethod,
            activityDate: this.formData.activityDate,
            activityTime: this.formData.activityTime,
          });
        }

        // 强制移除借用时长行（如果存在）
        this.specificsLines = this.specificsLines.filter(
          (line) => line.label !== "借用时长:"
        );

        console.log(
          "[fetchTaskDetail] 所有字段填充完成，最终formData:",
          this.formData
        );
      } catch (error) {
        console.error("获取任务详情失败:", error);
        uni.showToast({ title: "获取任务详情失败", icon: "none" });
        uni.navigateBack();
      }
    },
    validateForm() {
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入任务标题", icon: "none" });
        return false;
      }
      if (this.formData.title.trim().length < 5) {
        uni.showToast({ title: "任务标题至少5个字", icon: "none" });
        return false;
      }
      if (!this.formData.description.trim()) {
        uni.showToast({ title: "请输入任务描述", icon: "none" });
        return false;
      }
      if (!this.formData.locationText.trim()) {
        uni.showToast({ title: "请输入任务地点", icon: "none" });
        return false;
      }
      // 验证赏金增加金额
      const rewardIncrease = parseFloat(this.formData.rewardIncrease) || 0;
      if (rewardIncrease < 0) {
        uni.showToast({ title: "增加金额不能为负数", icon: "none" });
        return false;
      }

      // 验证任务详情
      if (!this.formData.specifics.trim()) {
        uni.showToast({ title: "请输入任务详情", icon: "none" });
        return false;
      }

      return true;
    },
    async submitTaskEdit() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      uni.showLoading({ title: "正在保存..." });

      try {
        const rewardIncrease = parseFloat(this.formData.rewardIncrease) || 0;
        let out_trade_no = null;

        // 如果有增加赏金，需要先支付
        if (rewardIncrease > 0) {
          uni.showLoading({ title: "正在处理支付..." });

          try {
            const payRes = await request({
              url: "/pay/unifiedOrder",
              method: "POST",
              data: {
                amount: rewardIncrease,
                description: `增加赏金 - ${this.formData.title}`,
              },
            });

            if (!payRes.paymentParams) {
              uni.hideLoading();
              uni.showToast({
                title: payRes.message || "微信支付下单失败",
                icon: "none",
              });
              this.isSubmitting = false;
              return;
            }

            const params = payRes.paymentParams;
            await new Promise((resolve, reject) => {
              uni.requestPayment({
                timeStamp: params.timeStamp + "",
                nonceStr: params.nonceStr,
                package: params.package,
                signType: params.signType,
                paySign: params.paySign,
                success: resolve,
                fail: reject,
              });
            });

            out_trade_no = payRes.out_trade_no;
            uni.showToast({ title: "支付成功", icon: "success" });
          } catch (error) {
            uni.hideLoading();
            uni.showToast({
              title: "支付失败，请重试",
              icon: "none",
            });
            this.isSubmitting = false;
            return;
          }
        }

        // 构建更新数据 - 标题只保存用户输入的内容，不包含标签
        const titleContent = this.formData.title.trim();

        const updateData = {
          title: titleContent,
          taskType: this.formData.taskType,
          description: this.formData.description.trim(),
          locationText: this.formData.locationText.trim(),
          rewardAmount: parseFloat(this.newRewardAmount), // 转换为数字类型
          specifics: this.formData.specifics || "", // 任务详情信息
        };

        // 如果有支付订单号，添加到更新数据中
        if (out_trade_no) {
          updateData.out_trade_no = out_trade_no;
        }

        // 如果有截止时间，添加到更新数据中
        if (this.formData.deadlineDate && this.formData.deadlineTime) {
          const deadline = new Date(
            `${this.formData.deadlineDate}T${this.formData.deadlineTime}`
          );
          updateData.deadline = deadline.toISOString();
        }

        // 添加取快递专用字段
        if (this.formData.taskType === "取快递") {
          updateData.platform = this.formData.platform;
          updateData.pickupCode = this.formData.pickupCode.trim();
          updateData.pickupLocation = this.formData.pickupLocation.trim();
          updateData.deliveryAddress = this.formData.deliveryAddress.trim();
          updateData.packageSize = this.formData.packageSize;
          updateData.remarks = this.formData.remarks.trim();

          if (this.formData.expectedDate && this.formData.expectedTime) {
            const expectedDelivery = new Date(
              `${this.formData.expectedDate}T${this.formData.expectedTime}`
            );
            updateData.expectedDelivery = expectedDelivery.toISOString();
          }
        }

        // 添加学习伙伴专用字段
        if (this.formData.taskType === "学习伙伴") {
          updateData.activityType = this.formData.activityType;
          updateData.activityName = this.formData.activityName.trim();
          updateData.peopleNumber = this.formData.peopleNumber;
          updateData.costMethod = this.formData.costMethod;

          if (this.formData.activityDate && this.formData.activityTime) {
            const activityTime = new Date(
              `${this.formData.activityDate}T${this.formData.activityTime}`
            );
            updateData.activityTime = activityTime.toISOString();
          }
        }

        const response = await request({
          url: `/tasks/${this.taskId}`,
          method: "PUT",
          data: updateData,
        });

        uni.hideLoading();
        uni.showToast({
          title: "修改成功",
          icon: "success",
          duration: 2000,
        });

        // 延迟返回上一级，让用户看到成功提交的任务
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
      } catch (error) {
        uni.hideLoading();
        console.error("任务修改失败:", error);
        uni.showToast({
          title: error.message || "修改失败",
          icon: "none",
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    // 快捷选择相关方法 - 使用picker组件
    bindActivityTypeChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.activityTypeOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    bindPeopleNumberChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.peopleNumberOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    bindCostMethodChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.costMethodOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 快递平台快捷选择
    bindExpressPlatformChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.expressPlatformOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 包裹大小快捷选择
    bindPackageSizeChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.packageSizeOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 课程时长快捷选择
    bindDurationChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.durationOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 文档类型快捷选择
    bindDocumentTypeChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.documentTypeOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 搬运类型快捷选择
    bindMovingTypeChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.movingTypeOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 物品类型快捷选择
    bindItemTypeChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.itemTypeOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 游戏人数快捷选择
    bindGamePlayerNumberChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.gamePlayerNumberOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 语音方式快捷选择
    bindVoiceChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.voiceOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 帮助类型快捷选择
    bindHelpTypeChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.helpTypeOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 紧急程度快捷选择
    bindUrgencyChange(index, e) {
      const selectedIndex = e.detail.value;
      const selectedValue = this.urgencyLevelOptions[selectedIndex];
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = selectedValue;
        this.updateSpecifics();
      }
    },

    // 借物品开始日期选择
    bindBorrowStartDateChange(index, e) {
      const date = e.detail.value;
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = date;
        this.updateSpecifics();
        // 日期改变后（**修正：移除多余的 calculateBorrowDuration() 调用**）
      }
    },

    // 借物品归还日期选择
    bindBorrowReturnDateChange(index, e) {
      const date = e.detail.value;
      if (this.specificsLines[index]) {
        this.specificsLines[index].value = date;
        this.updateSpecifics();
        // 日期改变后（**修正：移除多余的 calculateBorrowDuration() 调用**）
      }
    },

    // 获取借用开始日期（用于限制归还日期的最小值）
    getBorrowStartDate() {
      // 【修正】将查找的标签统一为 '开始日期:'
      const startDateLine = this.specificsLines.find(
        (line) => line.label === "开始日期:"
      );
      return startDateLine ? startDateLine.value : null;
    },

    // 【修正】移除多余的 calculateBorrowDuration 方法，因为计算逻辑应该在 calculateDisplayDuration 中，并作为计算属性供模板使用。
    // calculateBorrowDuration() {
    //   // ... 此方法已被删除
    // },

    // 计算并返回借用时长天数（用于模板显示）
    calculateDisplayDuration() {
      console.log("calculateDisplayDuration 被调用");
      console.log("formData.taskType:", this.formData.taskType);
      console.log("specificsLines:", this.specificsLines);

      // 查找标签为 '开始日期:' 和 '归还日期:' 的行
      const startDateLine = this.specificsLines.find(
        (line) => line.label === "开始日期:"
      );
      const returnDateLine = this.specificsLines.find(
        (line) => line.label === "归还日期:"
      );

      console.log("startDateLine:", startDateLine);
      console.log("returnDateLine:", returnDateLine);

      if (
        startDateLine &&
        returnDateLine &&
        startDateLine.value &&
        returnDateLine.value
      ) {
        console.log("开始日期", startDateLine.value);
        console.log("归还日期", returnDateLine.value);

        // 使用 new Date(dateString) 构造日期对象
        // 注意：这里假设 dateString 格式是 'YYYY-MM-DD'
        const startDate = new Date(startDateLine.value);
        const returnDate = new Date(returnDateLine.value);

        if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
          // 为了确保日期比较是准确的（只比较日期，忽略时间），可能需要重置时间部分
          // 但由于日期选择器通常只返回日期，这里通常是安全的
          if (returnDate > startDate) {
            const diffTime = returnDate.getTime() - startDate.getTime();
            // 计算天数差，向上取整以包含不满一天的最后一刻 (例如：1号借，3号还，算3天)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            console.log("计算的借用天数:", diffDays);
            return diffDays;
          }
        }
      }
      console.log("返回 0");
      return 0;
    },

    // 保留模态框相关方法（以防其他地方使用）
    showActivityTypePicker(index) {
      this.currentEditingIndex = index;
      this.currentEditingType = "activityType";
      this.quickSelectTitle = "选择活动类型";
      this.quickSelectOptions = [
        "学习",
        "运动",
        "美食",
        "娱乐",
        "购物",
        "其他",
      ];
      this.showQuickSelectModal = true;
    },

    showPeopleNumberPicker(index) {
      this.currentEditingIndex = index;
      this.currentEditingType = "peopleNumber";
      this.quickSelectTitle = "选择需要人数";
      this.quickSelectOptions = ["1", "2", "3", "4", "5", "6人以上"];
      this.showQuickSelectModal = true;
    },

    showCostMethodPicker(index) {
      this.currentEditingIndex = index;
      this.currentEditingType = "costMethod";
      this.quickSelectTitle = "选择费用方式";
      this.quickSelectOptions = ["AA制", "我请", "你请", "其他"];
      this.showQuickSelectModal = true;
    },

    selectQuickOption(option) {
      if (
        this.currentEditingIndex >= 0 &&
        this.specificsLines[this.currentEditingIndex]
      ) {
        this.specificsLines[this.currentEditingIndex].value = option;
        this.updateSpecifics();
      }
      this.hideQuickSelectModal();
    },

    hideQuickSelectModal() {
      this.showQuickSelectModal = false;
      this.currentEditingIndex = -1;
      this.currentEditingType = "";
      this.quickSelectTitle = "";
      this.quickSelectOptions = [];
    },

    // 从任务详情行中提取日期
    getDateFromLine(line) {
      if (!line.value) return "";
      const dateMatch = line.value.match(/(\d{4}-\d{2}-\d{2})/);
      return dateMatch ? dateMatch[1] : "";
    },

    // 从任务详情行中提取时间
    getTimeFromLine(line) {
      if (!line.value) return "";
      const timeMatch = line.value.match(/(\d{2}:\d{2})/);
      return timeMatch ? timeMatch[1] : "";
    },

    // 处理任务详情中的日期选择
    bindSpecificsDateChange(index, e) {
      const date = e.detail.value;
      const line = this.specificsLines[index];
      if (line) {
        const time = this.getTimeFromLine(line);
        line.value = `${date} ${time}`;
        this.updateSpecifics();
      }
    },

    // 处理任务详情中的时间选择
    bindSpecificsTimeChange(index, e) {
      const time = e.detail.value;
      const line = this.specificsLines[index];
      if (line) {
        const date = this.getDateFromLine(line);
        line.value = `${date} ${time}`;
        this.updateSpecifics();
      }
    },
  }, // 修复：关闭 methods 对象
}; // 修复：关闭外部的组件/对象定义
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.task-edit-container {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #e8eaf6 0%,
    #f3e5f5 20%,
    #fce4ec 40%,
    #ffebee 60%,
    #e3f2fd 80%,
    #e0f2f1 100%
  );
  padding: $uni-spacing-col-base;
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  position: relative;
}

// 页面头部装饰
.page-header {
  position: relative;
  height: 120rpx;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .header-decoration {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.08) 100%
    );
    border-radius: 20rpx;
    backdrop-filter: blur(15rpx);
    border: 1rpx solid rgba(255, 255, 255, 0.4);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      animation: shimmer 3s infinite;
    }
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.form-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15rpx);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.18);
  }

  // 不同区块的特殊样式
  &.basic-info-section {
    background: rgba(227, 242, 253, 0.85);
    border-left: 6rpx solid #90caf9;
    box-shadow: 0 8rpx 32rpx rgba(144, 202, 249, 0.2);
  }

  &.details-section {
    background: rgba(255, 243, 224, 0.85);
    border-left: 6rpx solid #ffcc80;
    box-shadow: 0 8rpx 32rpx rgba(255, 204, 128, 0.2);
  }

  &.other-info-section {
    background: rgba(232, 245, 232, 0.85);
    border-left: 6rpx solid #a5d6a7;
    box-shadow: 0 8rpx 32rpx rgba(165, 214, 167, 0.2);
  }

  // 区块标题样式
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding: 16rpx 0;
    border-bottom: 2rpx solid rgba(255, 255, 255, 0.4);

    .title-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .title-text {
      font-size: 32rpx;
      font-weight: 700;
      color: #333;
      flex: 1;
    }

    .required-star {
      color: #ff4757;
      margin-left: 8rpx;
      font-weight: bold;
      font-size: 28rpx;
    }
  }

  .form-item {
    margin-bottom: $uni-spacing-row-lg;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .item-label {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 12rpx;
    display: block;
    font-weight: 600;
    position: relative;
    padding-left: 16rpx;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 24rpx;
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      border-radius: 3rpx;
    }

    .required-star {
      color: #ff4757;
      margin-left: 8rpx;
      font-weight: bold;
    }
  }

  .input-field {
    width: 100%;
    height: 88rpx;
    background: rgba(255, 255, 255, 0.95);
    border: 4rpx solid #e0e0e0;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #90caf9;
      background: #ffffff;
      box-shadow: 0 0 0 4rpx rgba(144, 202, 249, 0.15);
    }

    &::placeholder {
      color: #999;
    }
  }

  .textarea-field {
    width: 100%;
    height: 240rpx;
    background: rgba(255, 255, 255, 0.95);
    border: 4rpx solid #e0e0e0;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #90caf9;
      background: #ffffff;
      box-shadow: 0 0 0 4rpx rgba(144, 202, 249, 0.15);
    }

    &::placeholder {
      color: #999;
    }
  }

  .picker {
    flex: 1; // 所有picker使用相同的flex属性  height: 88rpx;
    background-color: $uni-bg-color-grey;
    border-radius: $uni-border-radius-base;
    padding: 0 $uni-spacing-col-base;
  }

  .picker-value {
    height: 88rpx;
    line-height: 88rpx;
    font-size: $uni-font-size-base;
    color: $uni-text-color;

    &.readonly {
      background: #f8f9fa;
      color: #6c757d;
      cursor: not-allowed;
      border: 4rpx solid #dee2e6;
    }

    &.input-imitation {
      background-color: $uni-bg-color-grey;
      border-radius: $uni-border-radius-base;
      padding: 0 $uni-spacing-col-base;
      position: relative;
      cursor: pointer;

      .picker-arrow {
        position: absolute;
        right: $uni-spacing-col-base;
        top: 50%;
        transform: translateY(-50%);
        color: $uni-text-color-grey;
      }
    }
  }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .radio-item {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: $uni-text-color;

      radio {
        margin-right: 8rpx;
      }
    }
  }

  .time-picker-group {
    display: flex;
    gap: $uni-spacing-col-base;

    .time-picker-item {
      flex: 1;
      height: 60rpx; // 调整为与快捷选择框一致的高度
      padding: 0 20rpx;
      background: rgba(255, 255, 255, 0.95);
      border: 4rpx solid #e0e0e0;
      border-radius: 12rpx;
      color: #333;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 28rpx;

      &:active {
        background: #ffffff;
        border-color: #ffcc80;
        transform: scale(0.98);
        box-shadow: 0 0 0 4rpx rgba(255, 204, 128, 0.15);
      }

      .picker-arrow {
        position: absolute;
        right: 15rpx;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        font-size: 20rpx;
        z-index: 1;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #4caf50 0%, #45a049 50%, #388e3c 100%);
    color: #ffffff;
    border: none;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.3);
    transition: all 0.3s ease;
    backdrop-filter: blur(15rpx);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.5s ease;
    }

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.4);

      &::before {
        left: 100%;
      }
    }

    &:hover {
      background: linear-gradient(
        135deg,
        #5cbf60 0%,
        #4caf50 50%,
        #45a049 100%
      );
      box-shadow: 0 12rpx 32rpx rgba(76, 175, 80, 0.4);
    }

    &[disabled] {
      background: rgba(108, 117, 125, 0.6);
      color: rgba(255, 255, 255, 0.6);
      cursor: not-allowed;
      box-shadow: 0 4rpx 12rpx rgba(108, 117, 125, 0.2);
    }
  }

  .reward-section {
    .current-reward {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      padding: 20rpx;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12rpx;
      border: 4rpx solid #e0e0e0;
      backdrop-filter: blur(10rpx);

      .reward-label {
        font-size: 28rpx;
        color: #333;
        margin-right: 20rpx;
        font-weight: 600;
      }

      .reward-amount {
        font-size: 32rpx;
        font-weight: bold;
        color: #ff6b35;
      }
    }

    .reward-increase {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .reward-label {
        font-size: 28rpx;
        color: #333;
        margin-right: 20rpx;
        min-width: 120rpx;
        font-weight: 600;
      }

      .reward-input {
        flex: 1;
        height: 88rpx;
      }
    }

    .new-reward {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: linear-gradient(
        135deg,
        rgba(156, 39, 176, 0.8) 0%,
        rgba(103, 58, 183, 0.8) 100%
      );
      border-radius: 12rpx;
      margin-top: 20rpx;
      backdrop-filter: blur(15rpx);
      border: 4rpx solid rgba(255, 255, 255, 0.6);

      .reward-label {
        font-size: 28rpx;
        color: #ffffff;
        margin-right: 20rpx;
        font-weight: 600;
      }

      .new-amount {
        font-size: 32rpx;
        font-weight: bold;
        color: #ffffff;
        margin-right: 20rpx;
      }

      .reward-tip {
        font-size: 24rpx;
        color: #ffffff;
        opacity: 0.9;
      }
    }
  }

  .specifics-editor {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12rpx;
    padding: 20rpx;
    border: 4rpx solid #e0e0e0;
    backdrop-filter: blur(10rpx);

    .specifics-line {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20rpx;
      padding: 10rpx 0;

      .specifics-label {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
        min-width: 160rpx;
        margin-right: 20rpx;
        display: flex;
        align-items: center;
        height: 60rpx; // 和选择框相同的高度
        line-height: 1;
      }

      .specifics-input {
        flex: 1;
        height: 60rpx;
        padding: 0 20rpx;
        background: rgba(255, 255, 255, 0.95);
        border: 4rpx solid #e9ecef;
        border-radius: 12rpx;
        font-size: 28rpx;
        color: #333;
        transition: all 0.3s ease;

        &:focus {
          border-color: #ffcc80;
          background: #ffffff;
          box-shadow: 0 0 0 4rpx rgba(255, 204, 128, 0.15);
        }
      }

      .start-date-container,
      .return-date-container {
        flex: 1;
        display: flex;
        flex-direction: column;

        picker {
          // 让picker不占用过多空间
          flex: none;
        }
      }

      .return-date-container {
        .duration-display {
          margin-top: 16rpx;
          padding: 16rpx 24rpx;
          background-color: #f0f9ff;
          border-radius: 12rpx;
          border-left: 4rpx solid #007aff;

          .duration-text {
            font-size: 28rpx;
            color: #007aff;
            font-weight: 500;
          }
        }
      }
    }
  }

  // 快捷选择方框样式
  .quick-select-box {
    flex: 1;
    height: 60rpx;
    padding: 0 20rpx;
    background: rgba(255, 255, 255, 0.95);
    border: 4rpx solid #e0e0e0;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    font-size: 28rpx;
    color: #333;

    &:active {
      background: #ffffff;
      border-color: #90caf9;
      transform: scale(0.98);
      box-shadow: 0 0 0 4rpx rgba(144, 202, 249, 0.15);
    }

    .picker-arrow {
      font-size: 20rpx;
      color: #999;
      margin-left: 10rpx;
    }

    // 时间选择器特殊样式  &.time-picker-item {
    padding-right: 40rpx; // 为三角形图标留出更多空间

    .picker-arrow {
      position: absolute;
      right: 15rpx;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
  }
}
</style>
