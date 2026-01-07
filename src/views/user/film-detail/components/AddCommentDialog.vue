<!-- ScoreDialog.vue -->
<template>
  <el-dialog
    title="评分"
    v-model="props.dialogVisible"
    width="30%"
    @close="handleClose"
    class="score-dialog"
  >
    <div class="scoreText" v-if="commentForm.score">
      <span>{{ commentForm.score * 2 }}</span
      >分
    </div>
    <el-form :model="commentForm" ref="formRef" class="comment-form">
      <!-- 评分 -->
      <el-form-item label="" prop="score">
        <el-rate
          v-model="commentForm.score"
          show-text
          :texts="textArr"
          allow-half
          text-color="rgb(238, 188, 74)"
          :style="{ margin: 'auto' }"
        />
      </el-form-item>

      <!-- 评论输入 -->
      <el-form-item label="" prop="content">
        <el-input
          class="no-scrollbar-textarea"
          type="textarea"
          :autosize="{minRows: 2}"
          placeholder="说说你的看法"
          v-model="commentForm.content"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button
          :disabled="isDisabledSubmit"
          type="primary"
          @click="submitForm"
          >提 交</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

import { useUserStore } from "@/stores";
import { CommentFormType } from "@/api/comment/type";

// 父组件传递的控制弹窗显示的 props
interface Props {
  dialogVisible: boolean;
  commentValue: CommentFormType | null;
}
// 表单数据
const commentForm = ref<CommentFormType>({
  score: 0,
  content: "",
});

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:dialogVisible", value: boolean): void;
  (e: "submit", formData: { score: number; content: string }): void;
}>();

onMounted(() => {
  if (props.commentValue) {
    commentForm.value = props.commentValue;
  }
});

// 关闭弹窗时通知父组件
const handleClose = () => {
  emit("update:dialogVisible", false);
};

const isDisabledSubmit = computed(() => {
  return !(commentForm.value.score && commentForm.value.content);
});

const formRef = ref<FormInstance>();
const userStore = useUserStore();
const textArr = ["很差", "较差", "一般", "良好", "优秀"];

const submitForm = async () => {
  emit("submit", {...props.commentValue,...commentForm.value});
};
</script>

<style scoped lang="scss">
.score-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .scoreText {
    text-align: center;
    color: #edbc48;
    font-size: 14px;
    & > span {
      font-size: 24px;
    }
  }
  .no-scrollbar-textarea {
    ::v-deep textarea {
      overflow-y: hidden; /* 隐藏滚动条 */
      resize: none; /* 禁用右下角的三角调整手柄 */
    }
  }
  .comment-form {
    // margin-top: 16px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
}
</style>
