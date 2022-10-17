const urlCdnStyle = [
    "https://fonts.googleapis.com/css?family=Material+Icons",
    "https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.2.45/css/materialdesignicons.min.css",
    "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
]

// adding CDN css font url
urlCdnStyle.forEach(CdnStyleUrl => {
    console.log("add style cdn url : ", CdnStyleUrl)
    let styleTag = document.createElement("link");
    styleTag.href = CdnStyleUrl;
    styleTag.rel = "stylesheet"
    document.getElementsByTagName('head')[0].appendChild(styleTag);
})


import Vue from "vue";
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);
let vuetify = new Vuetify({});

import vueCustomElement from "vue-custom-element";

Vue.use(vueCustomElement);

import hplusKmlViewer from "./components/hplus-kml-viewer"

hplusKmlViewer.vuetify = vuetify;


Vue.config.productionTip = false;



import axios from "axios";
import VueAxios from "vue-axios";

Vue.use(VueAxios, axios);


Vue.customElement(hplusKmlViewer.name, hplusKmlViewer)

