<template>
  <div class="nav-page">
    <div class="hero fade-up">
      <ClockWidget />
      <div class="hero-slogan">
        <HitokotoWidget />
      </div>
    </div>
    <LinkGrid class="hero-links" />
  </div>
</template>

<script setup lang="ts">
import ClockWidget from '@/components/ClockWidget.vue';
import HitokotoWidget from '@/components/HitokotoWidget.vue';
import LinkGrid from './components/LinkGrid.vue';

defineOptions({ name: 'NavPage' });
</script>

<style lang="scss" scoped>
.nav-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.hero {
  padding: 7vh 0 36px;
}

.hero-slogan {
  margin-top: 18px;
}

.hero-links {
  flex: 1;
}
</style>
