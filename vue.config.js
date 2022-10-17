const WebpackCdnUploadPlugin = require("webpack-cdn-upload-plugin");
const pkgVersion = require("./package.json").version;
const pkgName = require("./package.json").name;
const axios = require("axios");


module.exports = {
    css: {
        extract: false,
    },
    filenameHashing: false,
    configureWebpack: {
        optimization: {
            splitChunks: false,
        },
        plugins: [],
    },
    chainWebpack: config => {
        config.module.rules.delete('eslint')
        if (process.env.NODE_ENV === "development") {
            config.entry("app").clear().add("./src/main.js").end();
        } else if (process.env.NODE_ENV === "production") {
            config.entry("app").clear().add("./src/main.production.js").end();
        }
    },
    
};
if (process.env.NODE_ENV == "production") {
    module.exports.configureWebpack.plugins.push(
        new WebpackCdnUploadPlugin({
            async upload(content, name) {
                if (!name.endsWith("app.js")) {
                    //We ignore sourcemap file
                    console.log("Ignored artifact: " + name)
                    return;
                }
                let repo = "release";
                if (pkgVersion.toLowerCase().endsWith("snapshot")) {
                    repo = "snapshot";
                }
                //let url = "http://localhost:8491/jsrepo/v1_0/webpackupload/sandbox/" + repo + "/" + pkgName + "/" + pkgVersion
                let artifactName = pkgName;
                if (process.VUE_CLI_SERVICE.mode == "preproduction") {
                    artifactName = pkgName + "_preproduction";
                }
                let url =
                    "https://api.sedoo.fr/aeris-cdn-rest/jsrepo/v1_0/webpackupload/sandbox/" +
                    repo +
                    "/" +
                    artifactName +
                    "/" +
                    pkgVersion;
                console.log(url);

                await axios({
                    method: "post",
                    url: url,
                    headers: {},
                    data: {
                        content: content,
                    },
                });

                url = url.replace("webpackupload", "download");
                return url;
            },
        })
    );
}