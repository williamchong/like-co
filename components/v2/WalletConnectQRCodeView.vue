<template>
  <div
    v-if="checkIsMobileClient()"
    class="qrcode-panel-mobile"
  >
    <div class="qrcode-panel__instruction">
      <ol>
        <i18n
          path="V2_WalletConnectQRCodeModal_Mobile_Instruction_Step_1"
          tag="li"
        >
          <img
            class="qrcode-panel__app-icon"
            src="~assets/v2/icons/liker-land-app.svg"
            alt="Liker Land App"
            place="appLogo"
          >
          <NuxtLink
            class="qrcode-panel__app-name"
            place="appName"
            :to="{ name: 'in-getapp' }"
          >Liker Land app</NuxtLink>
        </i18n>
        <i18n
          path="V2_WalletConnectQRCodeModal_Mobile_Instruction_Step_2"
          tag="li"
        />
      </ol>
      <Button
        class="qrcode-panel__deeplink-button"
        :href="walletConnectDeepLink"
      >
        <i18n
          path="V2_WalletConnectQRCodeModal_Mobile_Button_Text"
          tag="span"
        >
          <img
            class="qrcode-panel__app-icon"
            src="~assets/v2/icons/liker-land-app.svg"
            alt="Liker Land App"
            place="appLogo"
          >
          <span
            class="qrcode-panel__app-name"
            place="appName"
          >Liker Land app</span>
        </i18n>
      </Button>
    </div>
  </div>
  <div
    v-else
    class="qrcode-panel"
  >
    <div class="qrcode-panel__instruction">
      <ol>
        <i18n
          path="V2_WalletConnectQRCodeModal_Instruction_Step_1"
          tag="li"
        >
          <img
            class="qrcode-panel__app-icon"
            src="~assets/v2/icons/liker-land-app.svg"
            alt="Liker Land App"
            place="appLogo"
          >
          <span
            class="qrcode-panel__app-name"
            place="appName"
          >Liker Land app</span>
        </i18n>
        <i18n
          path="V2_WalletConnectQRCodeModal_Instruction_Step_2"
          tag="li"
        >
          <img
            class="qrcode-panel__qrcode-icon"
            src="~assets/v2/icons/liker-land-app-qrcode.svg"
            alt="QR Code"
            place="qrcodeIcon"
          >
        </i18n>
        <li>
          {{ $t('V2_WalletConnectQRCodeModal_Instruction_Step_3') }}
        </li>
      </ol>
    </div>
    <div class="qrcode-panel__qrcode-container">
      <div ref="qrcode" />
      <img
        class="qrcode-panel__qrcode-frame"
        src="~assets/v2/wallet-connect-qrcode-frame.svg"
        alt=""
      >
    </div>
  </div>
</template>

<script>
import QRCode from 'easyqrcodejs';
import { checkIsMobileClient } from '~/util/client';

import Button from './Button';

export default {
  name: 'wallet-connect-qrcode-view',
  components: {
    Button,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  computed: {
    walletConnectDeepLink() {
      return `com.oice://wcV1?${this.value}`;
    },
  },
  watch: {
    value() {
      this.makeQRCode();
    },
  },
  mounted() {
    if (checkIsMobileClient()) {
      // Try to open the deeplink when mounted
      window.location.href = this.walletConnectDeepLink;
    } else {
      this.makeQRCode();
    }
  },
  methods: {
    checkIsMobileClient,
    makeQRCode() {
      if (!this.qrcode) {
        const width = 152;
        this.qrcode = new QRCode(this.$refs.qrcode, {
          text: this.value,
          width,
          height: width,
          colorDark: '#000',
          colorLight: 'transparent',
          drawer: 'svg',
          correctLevel: QRCode.CorrectLevel.H,
        });
      } else {
        this.qrcode.makeCode(this.value);
      }
    },
  },
};
</script>

<style scoped>
.qrcode-panel {
  display: flex;
}

.qrcode-panel__instruction {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;

  margin-right: 24px;

  font-size: 16px;
}

.qrcode-panel-mobile .qrcode-panel__instruction {
  width: 100%;
}

.qrcode-panel__instruction ol {
  margin-left: 24px;
}

.qrcode-panel__instruction ol li:not(:first-child) {
  margin-top: 8px;
}

.qrcode-panel__app-name {
  color: #28646E;

  font-weight: 600;
}

.qrcode-panel__deeplink-button {
  width: 100%;
  margin-top: 24px;
}

.qrcode-panel__app-icon,
.qrcode-panel__qrcode-icon {
  width: 20px;

  vertical-align: bottom;
}

.qrcode-panel__qrcode-container {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.qrcode-panel__qrcode-frame {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
