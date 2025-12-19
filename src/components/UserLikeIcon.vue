<!-- src/components/HeartIcon.vue -->
<template>
  <svg
    :class="{ 'heart-filled': filled, 'heart-clickable': clickable }"
    :style="iconStyle"
    viewBox="0 0 24 24"
    @click="$emit('click')"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      :fill="filled ? color : 'none'"
      :stroke="color"
      stroke-width="2"
    />
  </svg>
</template>

<script setup>
defineProps({
  // 是否实心
  filled: {
    type: Boolean,
    default: false
  },
  // 颜色
  color: {
    type: String,
    default: '#f56c6c'
  },
  // 大小
  size: {
    type: [Number, String],
    default: 24
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: false
  }
})

const iconStyle = {
  width: typeof size === 'number' ? `${size}px` : size,
  height: typeof size === 'number' ? `${size}px` : size,
  display: 'inline-block',
  verticalAlign: 'middle',
  transition: 'all 0.3s ease'
}
</script>

<style scoped>
svg {
  cursor: default;
}

.heart-clickable {
  cursor: pointer;
}

.heart-clickable:hover {
  transform: scale(1.1);
}

.heart-filled {
  animation: heart-pop 0.3s ease;
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>