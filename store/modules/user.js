/* eslint no-shadow: "off" */
/* eslint no-param-reassign: "off" */
import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies
import {
  USER_SET_USER_INFO,
  USER_SET_LOCAL_WALLET,
  USER_SET_AFTER_AUTH_ROUTE,
  USER_SET_AUTH_PLATFORMS,
  USER_SET_SOCIAL,
  USER_SET_SOCIAL_DETAILS,
  USER_LINK_SOCIAL,
  USER_UNLINK_SOCIAL,
  USER_SET_LIKECOIN_BIG_NUMBER_AMOUNT,
  USER_SELECT_FACEBOOK_PAGE_LINK,
  USER_SET_SOCIAL_PLATFORMS_IS_PUBLIC,
  USER_ADD_SOCIAL_LINK,
  USER_SET_SOCIAL_LINK,
  USER_UPDATE_READ_CONTENT_STATUS,
} from '../mutation-types';
import * as actions from './actions/user';
import * as getters from './getters/user';

const state = () => ({
  user: {},
  wallet: '',
  isFetching: false,
  preAuthRoute: null,
  afterAuthRoute: {},
  web3Fetching: false,
  isFetchedAuthPlatforms: false,
  isFetchingAuthPlatforms: false,
  authPlatforms: {},
  platforms: {},
  links: {},
  socialMeta: {},
  likeCoinAmountInBigNumber: null,
  authCoreAccessToken: '',
});

const mutations = {
  [USER_SET_USER_INFO](state, user) {
    state.user = user;
  },
  [USER_SET_LOCAL_WALLET](state, wallet) {
    state.wallet = wallet;
  },
  [USER_SET_AFTER_AUTH_ROUTE](state, route) {
    state.preAuthRoute = route;
  },
  [USER_SET_AUTH_PLATFORMS](state, { isFetching, platforms }) {
    state.isFetchingAuthPlatforms = !!isFetching;
    if (!isFetching) {
      state.isFetchedAuthPlatforms = true;
    }
    if (platforms) {
      state.authPlatforms = platforms;
    }
  },
  [USER_SET_SOCIAL](state, platforms) {
    state.platforms = platforms;
  },
  [USER_SET_SOCIAL_DETAILS](state, {
    links,
    meta,
    platforms,
  }) {
    state.platforms = platforms;
    state.links = links;
    state.socialMeta = meta;
  },
  [USER_LINK_SOCIAL](state, payload) {
    const {
      platform, displayName, url, pages, id,
    } = payload;
    Vue.set(state.platforms, platform, {
      displayName, id, url, pages,
    });
  },
  [USER_UNLINK_SOCIAL](state, payload) {
    if (state.links[payload]) {
      Vue.delete(state.links, payload);
    } else {
      Vue.delete(state.platforms, payload);
    }
  },
  [USER_SELECT_FACEBOOK_PAGE_LINK](state, payload) {
    if (payload) {
      Vue.set(state.platforms, 'facebook', {
        ...state.platforms.facebook,
        url: payload,
      });
    }
  },
  [USER_SET_SOCIAL_PLATFORMS_IS_PUBLIC](state, { platforms = {}, displaySocialMediaOption }) {
    Object.keys(platforms).forEach((id) => {
      if (state.platforms[id]) {
        Vue.set(state.platforms, id, {
          ...state.platforms[id],
          isPublic: platforms[id],
        });
      } else {
        Vue.set(state.links, id, {
          ...state.links[id],
          isPublic: platforms[id],
        });
      }
    });

    if (displaySocialMediaOption) {
      Vue.set(state.socialMeta, 'displaySocialMediaOption', displaySocialMediaOption);
    }
  },
  [USER_ADD_SOCIAL_LINK](state, { id, ...data }) {
    Vue.set(state.links, id, data);
  },
  [USER_SET_SOCIAL_LINK](state, { id, ...data }) {
    if (data.order !== undefined) {
      const links = { ...state.links };
      const oldOrder = state.links[id].order;
      if (oldOrder > data.order) {
        Object.keys(links).forEach((id) => {
          const l = links[id];
          if (l.order >= data.order && l.order < oldOrder) {
            l.order += 1;
          }
        });
      } else {
        Object.keys(links).forEach((id) => {
          const l = links[id];
          if (l.order > oldOrder && l.order <= data.order) {
            l.order -= 1;
          }
        });
      }
      links[id].order = data.order;
      state.links = links;
    } else {
      Vue.set(state.links, id, {
        ...state.links[id],
        ...data,
      });
    }
  },
  [USER_SET_LIKECOIN_BIG_NUMBER_AMOUNT](state, payload) {
    state.likeCoinAmountInBigNumber = payload;
  },
  [USER_UPDATE_READ_CONTENT_STATUS](state, payload) {
    Vue.set(state.user, 'read', {
      ...state.user.read,
      ...payload,
    });
  },
};

export default {
  actions,
  getters,
  state,
  mutations,
};
