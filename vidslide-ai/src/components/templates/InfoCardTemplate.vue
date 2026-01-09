/** * InfoCardTemplate.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!-- InfoCardTemplate 组件模板 -->
<template>
  <div class="info-card-template">
    <img src="/assets/templates/info-card-template.png"
alt="信息卡片模板" class="template-image"
/>
  </div>
</template>

<script>
/**
 * InfoCardTemplate 组件
 * 紧急补齐阶段功能实现
 */
export default {
  name: 'InfoCardTemplate',
  props: {
    width: {
      type: Number,
      default: 1920
    },
    height: {
      type: Number,
      default: 1080
    }
  }
}
</script>

<style scoped>
.info-card-template {
  position: relative;
  display: inline-block;
}

.template-image {
  width: 100%;
  height: auto;
  max-width: 1920px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.template-image:hover {
  transform: scale(1.02);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .template-image {
    max-width: 100%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

@media (max-width: 768px) {
  .info-card-template {
    width: 100%;
  }

  .template-image {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
