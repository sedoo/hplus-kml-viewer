<template>
<v-app >
 <!-- PLOEMEUR
GUIDEL
POITIERS
LSBB
LARZAC
MAHESHWARAM
CHOUTUPPAL
VAL D'ALLIER
PORT-DOUVOT
-->
<v-container fluid>
    <v-row align="center">

  <v-select
          :items="links"
          label="Links"
          v-model="link"
        ></v-select>

    </v-row>
</v-container>


  <v-sheet id="hplusmap" class="hplusmap">
                  <div ref="initZoomButton">
                    <div class="ol-full-screen ol-unselectable ol-control" style="margin-top:70px">
                      <button @click="initZoom()" title="reinitilize Zoom" class="ol-zoom-out" type="button"><span class="mdi mdi-restart"></span></button>
                    </div>
                  </div>
                  <div id="layercontrol">
                    <v-menu class="white--text" left offset-x content-class="my-menu" :close-on-content-click="false">
                      <template v-slot:activator="{ on }">
                        <div style="margin-top:35px" class="ol-full-screen ol-unselectable ol-control">
                          <button title="Zoom in" class="ol-zoom-in" type="button"><span class="mdi mdi-layers-triple" v-on="on"></span></button> </div>

                      </template>

                      <v-radio-group small v-model="layerdisplay">
                        <v-radio class="ml-2" label="Satellite" value="satellite"></v-radio>
                      </v-radio-group>
                    </v-menu>
                  </div>
                </v-sheet>
                <div ref="popup" class="ol-popup "></div>
  </v-app>
</template>

<script>

import "ol/ol.css";
import { defaults as defaultControls, Control } from "ol/control";
import Map from "ol/Map";
import View from "ol/View";
import LayerGroup from "ol/layer/Group";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import {fromExtent} from 'ol/geom/Polygon';
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke } from "ol/style";
import Overlay from "ol/Overlay";
import FullScreen from "ol/control/FullScreen";
import KML from "ol/format/KML";
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'

class KMZ extends KML {

  constructor(opt_options, data) {
    const options = opt_options || {};
    super(options);
    this.data = data;
  }

  getType() {
    return 'arraybuffer';
  }

  readFeature(source, options) {
    return super.readFeature(this.data, options);
  }

  readFeatures(source, options) {
    return super.readFeatures(this.data, options);
  }
}

export default {
  name: "hplus-kml-viewer",
  computed: {
   
  },

 props: {
   
  },

   watch: {
    link(newValue) {
     this.updateLayer(newValue)
    }
  },

  data() {
    return {
      map: null,
      baselayers: [],
      kmlLayer: null,
      layerdisplay: "satellite",
      link: "https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/larzac.kmz",
      links: [
        {text:"LARZAC", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/larzac.kmz"},
        {text:"AURADE", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/aurade.kmz"}
      ]
      // links: [
      //   {text:"Local ROSAME", value:"http://localhost:8081/metadata/fba5f146-3bf7-44c0-84aa-ad9565b5cff2?language=en&output=kml"},
      //   {text:"Distant ROSAME", value:"https://api.sedoo.fr/odatis-catalogue-prod/metadata/fba5f146-3bf7-44c0-84aa-ad9565b5cff2?language=en&output=kml"},
      //   {text:"Distant AURADE", value:"https://hplus.ore.fr/public/aurade.kmz"},
      //   {text:"Local AURADE", value:"http://localhost:8080/aurade.kmz"},
      //   {text:"Distant AURADE", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/aurade.kmz"},
      //   {text:"Local GUIDEL", value:"http://localhost:8080/guidel.kmz"}
      // ]
    };
  },

  mounted() {
    this.initMap();
    this.loadData();
  },

  methods: {

    updateLayer(newValue) {
 if (this.kmlLayer != null) {
        this.map.removeLayer(this.kmlLayer);
      } 

      if (newValue.toLowerCase().endsWith(".kml")) {
          this.kmlLayer = new VectorLayer({
              source: new VectorSource({
              url: newValue,
                format: new KML(),
              }),
            });

          this.map.addLayer(this.kmlLayer);
          let kmlLayer = this.kmlLayer;
    let map = this.map;
    let source = kmlLayer.getSource()

    var listenerKey = this.kmlLayer.getSource().on('change', function(e) {
      if (source.getState()=='ready') {
      let extent = kmlLayer.getSource().getExtent();
      let geom = fromExtent(extent)
      geom.scale(1.2);
        map.getView().fit(geom,  {size: map.getSize()});
        source.un('change', listenerKey);
      }
    });
      }



    else if (newValue.toLowerCase().endsWith(".kmz")) {
      let self =this
    JSZipUtils.getBinaryContent(newValue, function(err, data) {
        if(err) {
            throw err; // or handle err
        }

        let zip = new JSZip();
        JSZip.loadAsync(data).then(function (zip) { 

            const kmlFile = zip.file(/\.kml$/i)[0];
            if (kmlFile) {
              kmlFile.async("string")
            .then(function (content) {

              let features = new KML().readFeatures(content);

              let vectorSource = new VectorSource({
                features: features
              });

                  self.kmlLayer = new VectorLayer({
              source: vectorSource
            });

          self.map.addLayer(self.kmlLayer);

          let extent = self.kmlLayer.getSource().getExtent();
           let geom = fromExtent(extent)
            geom.scale(1.2);
            self.map.getView().fit(geom,  {size: self.map.getSize()});



            });
              
            }
        });
    });

    }

    },

    initZoom() {
      let extent = this.kmlLayer.getSource().getExtent();
      this.map.getView().fit(extent, {
        size: this.map.getSize(),
        maxZoom: this.$maxFitZoom
      });
    },

    initMap() {
      var container = this.$refs.popup;
      this.map = new Map({
        layers: [],
        target: "hplusmap",
        view: new View({
          center: [0, 0],
          projection: 'EPSG:4326',
          smoothExtentConstraint: false,
          zoom: 2.5,

          minZoom: 2,

          maxZoom: 17
        })
      });

      var layerbutton = new Control({
        element: document.getElementById("layercontrol")
      });
      this.map.addControl(layerbutton);
      var restartZoombutton = new Control({
        element: this.$refs.initZoomButton
      });
      this.map.addControl(restartZoombutton);
      var overlay = new Overlay({
        stopEvent: true,
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 150
        }
      });
      this.map.addOverlay(overlay);
      var fullscreen = new FullScreen();
      this.map.addControl(fullscreen);
    },

    loadData() {
       this.baselayers = new LayerGroup({
          title: "Basemaps",
          layers: [
          
            new TileLayer({

              source: new XYZ({
                wrapX: false,
                crossOrigin: "anonymous",
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              }),
              layer: "satellite"
            })
          ]
        });

        this.map.setLayerGroup(
          new LayerGroup({
            layers: [this.baselayers]
          })
        );

     this.updateLayer(this.link)

    }
    
  }
};
</script>
<style >
.hplusmap {
  height: 500px;
}
</style>


