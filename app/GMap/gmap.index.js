'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  WebView
} = React;

var HEADER = '#3b5998';
var BGWASH = 'rgba(255,255,255,0.8)';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'googlemap.html';

var DEFAULT_HTML = `
      <html>

      <head>
          <script src="http://maps.googleapis.com/maps/api/js">
          </script>
          <script>

          var sanfran = new google.maps.LatLng(37.7577,-122.4376);

          function initialize() {
              var mapProp= {
                  center: sanfran,
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
              };

              var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

              var myCity = new google.maps.Circle({
                  center: sanfran,
                  radius: 200,
                  strokeColor: "#DB3918",
                  strokeOpacity: 0.8,
                  strokeWeight: 0.0,
                  fillColor: "#DB3918",
                  fillOpacity: 0.4
              });

              myCity.setMap(map);
          }

          google.maps.event.addDomListener(window, 'load', initialize);
          </script>
      </head>

      <body>
          <div id="googleMap" style="width:100%;height:100%;"></div>
      </body>

      </html>
    `;

var WebTab= React.createClass({

  getInitialState: function() {
    return {
      url: DEFAULT_URL,
      html: DEFAULT_HTML,
      status: 'No Page Loaded',
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      loading: true,
      scalesPageToFit: true,
    };
  },

  inputText: '',

  handleTextInputChange: function(event) {
    this.inputText = event.nativeEvent.text;
  },

  render: function() {
    this.inputText = this.state.url;

    return (
        <WebView
          style={styles.container}
          automaticallyAdjustContentInsets={false}
          html={this.state.html}
          onNavigationStateChange={this.onNavigationStateChange}
          startInLoadingState={false}/>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinner: {
    width: 20,
    marginRight: 6,
  },
});

module.exports = WebTab;