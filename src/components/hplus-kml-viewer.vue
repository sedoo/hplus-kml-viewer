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
          v-if="showLinks"
        ></v-select>

    </v-row>
</v-container>


  <v-sheet id="hplusmap" class="hplusmap">
                  <div ref="initZoomButton">
                    <div class="ol-full-screen ol-unselectable ol-control" style="margin-top:60px">
                      <button @click="initZoom()" title="reinitilize Zoom" class="ol-zoom-out" type="button"><span class="mdi mdi-restart"></span></button>
                    </div>
                  </div>
                  <div id="layercontrol">
                    <v-menu class="white--text pa-3 " left offset-x content-class="my-menu" :close-on-content-click="false">
                      <template v-slot:activator="{ on }">
                        <div style="margin-top:30px" class="ol-full-screen ol-unselectable ol-control">
                          <button title="Show layers" class="ol-zoom-in layers-button" type="button"><span class="mdi mdi-layers-triple" v-on="on"></span></button> </div>
                      </template>

                      <div class="pa-3" :style="{width:layerMenuOffset+'px'}">
                        <v-card dense elevation="0" color="transparent">
                          <v-card-title class="pa-0" >
                            <v-spacer></v-spacer>
                            <v-switch v-model="hideEmptyNodes">
                               <template #prepend>
                                <v-label><span style="white-space: nowrap;">Hide empty nodes</span></v-label>
                              </template>
                            </v-switch>
                          </v-card-title>
                        </v-card>
                        <v-treeview dense :items="filteredFolders">


  <template v-slot:append="{ item}">

<v-btn  v-if="item.description"
              icon @click="displayDescription(item)"
            >
              <v-icon>mdi-information</v-icon>
            </v-btn>

    </template>
                        </v-treeview>
                      </div>
                    </v-menu>
                  </div>
                </v-sheet>
                <div ref="popup" class="ol-popup "></div>
                <v-card v-if="showCurrentDescription" class="mt-2">
                <v-card-title>Information
                  <v-spacer></v-spacer>
                  <v-btn   icon @click="showCurrentDescription=false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
                </v-card-title>
                <v-card-text>
                  <div style="overflow-x: auto;" v-html="currentDescription"></div>
                </v-card-text>
                </v-card>

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
import Overlay from "ol/Overlay";
import FullScreen from "ol/control/FullScreen";
import KML from "ol/format/KML";
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
import kmlParser from 'js-kml-parser'

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

    filteredFolders() {
      if (!this.hideEmptyNodes) {
        return this.folders
      }
      else {
        let filtered = []
        for (let i=0; i<this.folders.length;i++) {
          let temp = this.folders[i];
          let json = JSON.stringify(temp).replace(' ','')
          // In a really basic strategy, we hide all the nodes without any description - maybe we should ask other criterions...
          if (json.indexOf('"description":"')>0) {
            filtered.push(temp)
          }
        }
        return filtered
      }

  }
   
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
      folders: [],
      drawer: false,
      kmlLayer: null,
      images: [],
      layerMenuOffset: 500,
      link: null,
      currentDescription:"",
      showCurrentDescription: false,
      showLinks: false,
      hideEmptyNodes: false,
      links: [
        {text:"AURADE", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/aurade.kmz"},
        {text:"AUVERWATCH", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/auverwatch.kmz"},
        {text:"DRAIX-BLEONE", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/draix-bleone.kmz"},
        {text:"GUIDEL", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/guidel.kmz"}, 
        {text:"HERMALLE-SOUS-ARGENTEAU", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/hermalle-sous-argenteau.kmz"},
        {text:"HYDERABAD-CHOUTUPPAL", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/hyderabad_choutuppal.kmz"},
        {text:"HYDERABAD-MAHESHWARAM", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/hyderabad_maheshwaram.kmz"},
        {text:"HOUAY-PANO", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/houay_pano.kmz"}, 
        {text:"LARZAC", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/larzac.kmz"},
        {text:"MALLORCA", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/mallorca.kmz"},
        {text:"ORGEVAL", value:"https://api.sedoo.fr/sedoo-proxy-rest/?url=https://hplus.ore.fr/public/orgeval.kmz"},
      ]
    };
  },

  mounted() {
    this.initMap();
    this.loadData();
    


              if (this.links && this.links.length>0) {

                let aux = this.getSiteParameter();

                let useFirstSite = true;

                if (aux && aux.length>0) {
                    let tmp = this.getLinkFromSiteName(aux);
                    if (tmp != null) {
                      this.link = tmp;
                      useFirstProject = false
                      this.showLinks = false
                    }
                } 

                if (useFirstSite) {
                  this.link=this.links[0].value
                  this.showLinks=true
                }
              }





    this.updateLayer(this.link)
  },

  methods: {

    getUrlForBlob: function(blob) {
      return URL.createObjectURL(blob)
    },

    getLinkFromSiteName: function(projectName) {
        for (let i=0; i < this.links.length; i++) {
          if (this.links[i].text.toLowerCase() == projectName.toLowerCase()) {
            return this.links[i].value
          }
        }
        return null
    },

     getSiteParameter: function() {
      return this.getURLParameter("site");
    },
    getURLParameter: function(sParam) {
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split("&");
      for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split("=");
        if (sParameterName[0] == sParam) {
          return decodeURIComponent(sParameterName[1]);
        }
      }
      return null;
    },

    updateLayer(newValue) {
    this.showCurrentDescription = false
    if (newValue == null) {
      return
    }
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

              let geoJson = kmlParser.toGeoJson(content);
              let nodes = new DOMParser().parseFromString(content, "text/xml");
              self.loadFolders(nodes)
              let features = new KML().readFeatures(content);
              let vectorSource = new VectorSource({
                features: features
              });

                  self.kmlLayer = new VectorLayer({
              source: vectorSource
            });

            let images = []
            const pngFiles = zip.file(/\.png$/i)
            if (pngFiles) {
              for (let i = 0; i < pngFiles.length; i++) {
                let name = pngFiles[i].name
                pngFiles[i].async("arraybuffer").then(function(content) {
                let blob = new Blob([content], {'type': 'image/png'})
                let image = {}
                image.name = name
                image.blob = blob
                images.push(image)  
                })
              }
            }

             const jpgFiles = zip.file(/\.jpg$/i)
            if (jpgFiles) {
              for (let i = 0; i < jpgFiles.length; i++) {
                let name = jpgFiles[i].name
                jpgFiles[i].async("arraybuffer").then(function(content) {
                let blob = new Blob([content], {'type': 'image/jpg'})
                let image = {}
                image.name = name
                image.blob = blob
                images.push(image)  
                })
              }
            }

              const jpegFiles = zip.file(/\.jpeg$/i)
            if (jpegFiles) {
              for (let i = 0; i < jpegFiles.length; i++) {
                let name = jpegFiles[i].name
                jpegFiles[i].async("arraybuffer").then(function(content) {
                let blob = new Blob([content], {'type': 'image/jpg'})
                let image = {}
                image.name = name
                image.blob = blob
                images.push(image)  
                })
              }

            }
            self.images=images

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
      let geom = fromExtent(extent)
      geom.scale(1.2);

      this.map.getView().fit(geom, {
        size: this.map.getSize(),
        maxZoom: this.$maxFitZoom
      });
    },

    loadFolders(nodes) {
      let folders = []
      let document = nodes.getElementsByTagName("Document")[0]
      // let folderNodes = this.getChildrenByTagName(document, "Folder");
//       for (let folderNode of folderNodes) {
//           let name = folderNode.getElementsByTagName("name")[0].innerHTML;
//           let description = null
//           let aux = this.getChildrenByTagName(folderNode, "Placemark")
          
//           if (aux.length>0) {
//             aux = this.getChildrenByTagName(aux[0], "description")
//             if (aux.length>0) {
//               description = aux[0].innerHTML;
//             }
//           }
//           let folder = {}
//           folder.name = name
//           folder.description = description
//           folder.children = []
//           folders.push(folder)
//           this.loadSubFolders(folderNode, folder)
// }



 let folderNodes = this.getChildrenByTagName(document, "Folder");
      if (folderNodes.length>0) {
        //we load the subfolders

        for (let folderNode of folderNodes) {
          let name = folderNode.getElementsByTagName("name")[0].innerHTML;
          let description = null

          let folder = {}
          folder.name = name
          folder.children = []
          folders.push(folder)
          this.loadSubFolders(folderNode, folder)
        }
      }

      this.folders = folders
    },

    loadSubFolders(parentNode, parent) {
      let folderNodes = this.getChildrenByTagName(parentNode, "Folder");
      if (folderNodes.length>0) {
        //we load the subfolders

        for (let folderNode of folderNodes) {
          let name = folderNode.getElementsByTagName("name")[0].innerHTML;
          let description = null

          let folder = {}
          folder.name = name
          folder.children = []
          parent.children.push(folder)
          this.loadSubFolders(folderNode, folder)
        }
      }
      else {
        //we load the placemarks
        let placemarkNodes = this.getChildrenByTagName(parentNode, "Placemark")
         if (placemarkNodes.length>0) {
        //we load the subfolders

        for (let placemarkNode of placemarkNodes) {
          let name = placemarkNode.getElementsByTagName("name")[0].innerHTML;
          let description = placemarkNode.getElementsByTagName("description")[0].innerHTML;

          let folder = {}
          folder.name = name
          folder.description = description
          parent.children.push(folder)
        }
      }

      }
    },

    getChildrenByTagName(nodes, tagName) {
      let result = []
      for (let child of nodes.children) {
        if (child.tagName.toLowerCase() == tagName.toLowerCase()) {
          result.push(child)
        }
      }
      return result;

    },

    displayDescription(item) {
      let aux = item.description;
      aux = aux.replace("<![CDATA[","").replace("]]>", "")
      //We ensure to have a correct HTML document
      aux = "<span>"+aux+"</span>"
      let nodes = new DOMParser().parseFromString(aux, "text/xml");
      let imgNodes = nodes.getElementsByTagName("img");
      for (let i = 0; i < imgNodes.length; i++) {
        let src = imgNodes[i].getAttribute("src")
        let image = this.getImageFromUrl(src.trim())
        if (image != null) {
          imgNodes[i].setAttribute("src",this.getUrlForBlob(image.blob));
          aux = aux.replace(src, this.getUrlForBlob(image.blob))
        }
      }


      this.currentDescription = aux
      this.$el.querySelector(".layers-button").click()
      this.showCurrentDescription = true
    },

    getImageFromUrl(url) {
      for (let i=0; i<this.images.length;i++){
        if (this.images[i].name.toLowerCase()==url.toLowerCase()) {
          return this.images[i];
        }
      }
      return null;
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

.my-menu {
    background-color: hsla(0,0%,100%,.8);
    border-radius: 0;
}

.hplusmap {
  height: 500px;
}
</style>


