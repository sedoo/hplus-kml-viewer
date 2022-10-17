import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import VuexPersist from "vuex-persist";

const vuexPersist = new VuexPersist({
    key: "northstar",
    storage: window.sessionStorage
});


Vue.prototype.$serviceurl = process.env.VUE_APP_BACKEND_URL;
Vue.prototype.$myObservationsEnabled = process.env.VUE_APP_MY_OBSERVATION_ENABLED;
Vue.prototype.$applicationMode = process.env.VUE_APP_MODE_NAME

let spip = process.env.VUE_APP_SPIP;
if (!spip) {
    Vue.prototype.$isSpip = false
}
else if (spip.toLowerCase()=="true") {
    Vue.prototype.$isSpip = true
} else {
    Vue.prototype.$isSpip = false
}

export default new Vuex.Store({
    plugins: [vuexPersist.plugin],
    state: {
        token: null,
        username: null,
        orcid: null,
        profile: null,
        lastroute: null
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },

        setUsername(state, username) {
            state.username = username;
        },

        setOrcid(state, orcid) {
            state.orcid = orcid;
        },

        setProfile(state, profile) {
            state.profile = profile;
        },

        setLastroute(state, lastroute) {
            state.lastroute = lastroute;
        }
    },

    getters: {
        getToken(state) {
            return state.token;
        },
        getUsername(state) {
            return state.username;
        },
        getOrcid(state) {
            return state.orcid;
        },

        getProfile(state) {
            return state.profile;
        },

        getLastroute(state) {
            return state.lastroute;
        }
    },
    actions: {}
});