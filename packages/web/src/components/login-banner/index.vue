<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
// import bannerImage from '~/assets/images/login-banner.png'
import bannerIntro from '~/assets/images/login-intro.png'

const { t } = useI18n()
const carouselItem = computed(() => [
  {
    slogan: t('login.banner.slogan1'),
    subSlogan: t('login.banner.subSlogan1'),
    image: bannerIntro,
  },
  // {
  //   slogan: t('login.banner.slogan1'),
  //   subSlogan: t('login.banner.subSlogan1'),
  //   image: bannerImage,
  // },
  // {
  //   slogan: t('login.banner.slogan2'),
  //   subSlogan: t('login.banner.subSlogan2'),
  //   image: bannerImage,
  // },
  // {
  //   slogan: t('login.banner.slogan3'),
  //   subSlogan: t('login.banner.subSlogan3'),
  //   image: bannerImage,
  // },
])
</script>

<template>
  <div class="banner" w-550px>
    <div class="banner-inner">
      <a-carousel class="carousel" animation-name="fade">
        <a-carousel-item v-for="item in carouselItem" :key="item.slogan" flex items-center bg="#f7f7f7">
          <!-- <div class="h-full w-full bg-white bg-cover bg-center bg-no-repeat"
            :style="{ backgroundImage: `url(${item.image})` }" /> -->
          <img :src="item.image">
        </a-carousel-item>
      </a-carousel>
    </div>
  </div>
</template>

<style lang="less" scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: center;

  &-inner {
    flex: 1;
    height: 100%;
  }
}

.carousel {
  height: 100%;

  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  &-title {
    color: var(--color-fill-1);
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
  }

  &-sub-title {
    margin-top: 8px;
    color: var(--color-text-3);
    font-size: 14px;
    line-height: 22px;
  }

  &-image {
    width: 320px;
    margin-top: 30px;
  }
}
</style>
