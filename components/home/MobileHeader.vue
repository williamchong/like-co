<template>
  <div class="home-mobile-header">
    <div
      :class="[
        'home-mobile-header__hero',
        'lc-flex',
        'lc-justify-content-space-between',
        'lc-align-items-center',
      ]"
    >
      <site-title :logo-src="likeCoinIcon" />
      <menu-button :is-show-label="false" />
    </div>
  </div>
</template>


<script>
import MenuButton from '~/components/SlidingMenu/MenuButton';
import SiteTitle from '~/components/SiteTitle';

import likeCoinIcon from '~/assets/logo/icon-label-horizontal.svg';

export default {
  name: 'home-mobile-header',
  components: {
    MenuButton,
    SiteTitle,
  },
  data() {
    return {
      likeCoinIcon,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "~assets/variables";

.home-mobile-header {
  position: relative;

  background-image: linear-gradient(194deg, $like-light-blue, $like-gradient-1);

  &__hero {
    position: relative;

    padding: 8px 24px;

    .site-title /deep/ img {
      width: 162px;
    }

  }

  .civic-liker-cta {
    /deep/ {
      .chop-art {
        transform: scale(0.9);
        transform-origin: center top;
      }

      > div > div:nth-child(2) {
        .lc-button-group {
          margin-top: -24px;
          padding-top: 0;
        }

        width: 100%;

        background: white;
      }
    }

    &--renewal {
      /deep/ {
        > div > div:first-child {
          padding: 0 24px 32px;
        }
      }
    }
  }
}
</style>
