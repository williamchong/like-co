<template>
  <div class="mission-dialog">

    <md-dialog
      class="md-dialog"
      :md-fullscreen="true"
      :md-active.sync="isShowDialog">

        <header>
          <div class="mission-icon" >
            <img :src="icon" />
          </div>

          <div class="left"/>

          <div class="right">
            <md-button
              class="md-icon-button lc-mobile-show"
              @click="onDismiss">
              <md-icon>close</md-icon>
            </md-button>
          </div>
        </header>

        <md-dialog-content class="md-dialog-content">
          <div class="mission-dialog-content">

            <div class="reward-label">{{ mission.reward }}</div>

            <h1 class="title-label">{{ title }}</h1>

            <div class="description" v-html="description" />

            <!-- BEGIN - Getting Start Section -->
            <div
              v-if="mission.id === 'gettingStart'"
              class="getting-start-form">

              <task-list
                :tasks="getTasks"
                @click="onClickGettingStartTask" />

              <div class="lc-button-group">
                <md-button class="md-likecoin" @click="onDismiss">
                {{ $t('General.button.ok') }}
                </md-button>
              </div>

            </div>
            <!-- END - Getting Start Section -->

            <!-- BEGIN - Verify Email Section -->
            <div
              v-if="mission.id === 'verifyEmail'"
              class="verify-email-form">

              <md-field class="md-likecoin">
                <label>Invite your friend by email</label>
                <md-input v-model="inline"></md-input>
              </md-field>

              <div class="lc-button-group">
                <md-button class="md-likecoin">
                  {{ $t('General.button.confirm') }}
                </md-button>
                <br/>
                <md-button
                  class="md-likecoin lc-cancel"
                  @click="onDismiss">
                  {{ $t('General.button.cancel') }}
                </md-button>
              </div>

            </div>
            <!-- END - Verify Email Section -->

            <!-- BEGIN - Invite Friend Section -->
            <invite-friend-form
              v-else-if="mission.id === 'inviteFriend'"
              form-id="mission-invite-friend-form"
              @invite="onInviteFriend" />
            <!-- END - Invite Friend Section -->

            <!-- BEGIN - Join Token Sale Section -->
            <div
              v-else-if="mission.id === ('joinTokenSale' || 'refereeTokenSale')"
              class="join-tokensale-form">

              <div class="lc-button-group">
                <md-button
                  class="md-likecoin"
                  @click="$router.to({ name: 'in-tokensale' })"
                >
                  {{ $t('Home.Sale.button.joinNow') }}
                </md-button>
                <br />
                <md-button
                  class="md-likecoin lc-cancel"
                  @click="onDismiss">
                  {{ $t('General.button.cancel') }}
                </md-button>
              </div>

            </div>
            <!-- END - Join Token Sale Section -->

          </div>
        </md-dialog-content>
    </md-dialog>

  </div>
</template>


<script>
import { mapActions, mapGetters } from 'vuex';

import InviteFriendForm from '~/components/InviteFriendForm';
import TaskList from '~/components/Mission/TaskList';
import { GETTING_STARTED_TASKS } from '@/constant';

import { logTrackerEvent } from '@/util/EventLogger';

import LikeCoinIcon from '@/assets/like-coin.svg';
import LinkIcon from '@/assets/icons/fillable/link.svg';
import FacebookIcon from '@/assets/icons/fillable/facebook.svg';
import TwitterIcon from '@/assets/icons/fillable/twitter.svg';

export default {
  name: 'mission-dialog',
  components: {
    InviteFriendForm,
    TaskList,
  },
  data() {
    return {
      GETTING_STARTED_TASKS,
      FacebookIcon,
      LinkIcon,
      TwitterIcon,
      isShowDialog: false,
    };
  },
  computed: {
    ...mapGetters([
      'getPopupMission',
      'getMissionById',
      'getUserInfo',
    ]),
    mission() {
      return this.getMissionById(this.getPopupMission.id) || {};
    },
    icon() {
      return this.mission.icon || LikeCoinIcon;
    },
    title() {
      return this.$t(`Mission.${this.missionId}.title`);
    },
    description() {
      return this.$t(`Mission.${this.missionId}.description`);
    },
    missionId() {
      return this.mission.id;
    },
    getTasks() {
      return GETTING_STARTED_TASKS.map(id => ({
        id,
        title: `Mission.${this.missionId}.${id}`,
        state: this.mission[id] ? 'completed' : 'active',
      }));
    },
  },
  methods: {
    ...mapActions([
      'postStepMission',
    ]),
    onInviteFriend(type) {
      switch (type) {
        case 'email':
          logTrackerEvent(this, 'Mission', 'ClickGetFreeLikeCoin', 'email invite', 1);
          break;
        case 'url':
          logTrackerEvent(this, 'Mission', 'sendInvitation', 'copy invite link', 1);
          break;
        case 'facebook':
          logTrackerEvent(this, 'Mission', 'sendInvitation', 'fb share invite', 1);
          break;
        case 'twitter':
          logTrackerEvent(this, 'Mission', 'sendInvitation', 'twitter invite', 1);
          break;
        default:
      }
    },
    async onClickGettingStartTask(t) {
      switch (t.id) {
        case 'taskPaymentPage':
          window.open(`/${this.getUserInfo.displayName}`, 'payment-page');
          break;

        case 'taskVideo': {
          let link = 'https://youtu.be/';
          switch (this.$i18n.locale) {
            case 'cn':
            case 'zh':
              link += '344nFHa7fC0';
              break;
            case 'ja':
              link += 'YbMTQ3F1isU';
              break;
            default:
              link += '28spMOgMs3o';
          }
          window.open(link, 'youtube');
          break;
        }

        case 'taskTelegram': {
          let link = 'https://t.me/likecoin';
          switch (this.$i18n.locale) {
            case 'ja':
              link += '_jp';
              break;
            case 'ru':
              link += '_ru';
              break;
            case 'ko':
              link += '_kr';
              break;
            default:
          }
          window.open(link, 'telegram-group');
          break;
        }

        default:
      }
      await this.postStepMission({
        user: this.getUserInfo.user,
        missionId: this.missionId,
        taskId: t.id,
      });
    },
    onDismiss() {
      this.isShowDialog = false;
    },
  },
  watch: {
    getPopupMission(m) {
      if (m) {
        this.isShowDialog = true;
      }
    },
  },
};
</script>


<style lang="scss" scoped>
@import "~assets/variables";

$header-height: 48px;

$icon-size: 110px;
$mobile-icon-size: 72px;

.md-dialog {
  overflow: visible;

  @media (min-width: 600px + 1px) {
    border-radius: 8px;
  }

  :global(.md-dialog-container) {
    overflow: visible;
  }
}

.md-dialog-content {
  padding-top: ($icon-size - $header-height) / 2 + 16px;

  @media (max-width: 600px) {
    padding-top: 8px + $mobile-icon-size - $header-height + 16px;
  }
}

header {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: $header-height;

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    content: "";

    background-image: linear-gradient(252deg, #d2f0f0, #f0e6b4);

    @media (min-width: 600px + 1px) {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  }
}

.mission-icon {
  position: absolute;
  z-index: 30;
  top: calc(50% - #{$icon-size} / 2);
  left: calc(50% - #{$icon-size} / 2);

  width: $icon-size;
  height: $icon-size;
  padding: 4px;

  border-radius: 50%;
  background-image: linear-gradient(252deg, #d2f0f0, #f0e6b4);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.7);

  @media (max-width: 600px) {
    top: 8px;
    left: calc(50% - #{$mobile-icon-size} / 2);

    width: $mobile-icon-size;
    height: $mobile-icon-size;
    padding: 2px;
  }

  > img {
    border-radius: 50%;
    background-color: white;
  }
}

.title-label {
  color: $like-dark-brown-2;

  font-size: 32px;
  font-weight: 300;

  &:not(:last-child){
    margin-bottom: 8px;
  }
}

.reward-label {
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: $like-green;

  font-size: 20px;
  font-weight: 600;

  &:not(:last-child) {
    margin-bottom: 12px;
  }

  .small {
    font-size: 12px;
  }
}

.description {
  color: $like-gray-4;

  font-size: 16px;

  &:not(:last-child) {
    margin-bottom: 32px;
  }
}
</style>
