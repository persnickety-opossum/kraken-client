'use strict';

var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');
var mapRef = 'mapRef';

var {
  AppRegistry,
  StyleSheet,
  StatusBarIOS,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} = React;

var MapTab = React.createClass({
  mixins: [MapboxGLMap.Mixin],
  getInitialState() {
    return {
      searchString: '',
      center: {
      latitude: 37.783585,
      longitude: -122.408955
      },
      zoom: 13,
      annotations: []
     };
  },
  onRegionChange(location) {
    this.setState({
      currentZoom: location.zoom,
      latitude: location.latitude,
      longitude: location.longitude
    });
  },
  onRegionWillChange(location) {
    console.log(location);
  },
  onUpdateUserLocation(location) {
    console.log(location);
  },
  onOpenAnnotation(annotation) {
    console.log(annotation);
  },
  onRightAnnotationTapped(e) {
    console.log(e);
  },

  componentWillMount: function() {
    fetch('http://localhost:8000/api/venues')
    .then(response => response.json())
    .then(json => this._handleresponse(json));
  },

  _handleresponse: function (venues) {
    console.log(venues);
    venues.forEach(function (venue) {
      var coords = venue.coordinates.split(',');
      venue.latitude = parseFloat(coords[0]);
      venue.longitude = parseFloat(coords[1]);
      venue.subtitle = venue.description;
      venue.annotationImage = {
        url: 'image!pin',
        height: 25,
        width: 25
      };
    });
    this.setState({annotations: venues});
  },

  _onSearchTextChanged: function (event) {
    console.log('onSearchTextChanged');
    this.setState({ searchString: event.nativeEvent.text });
    console.log(this.state.searchString, this.state.center.longitude, this.state.searchString);

    fetch('http://10.8.1.120:8000/api/search/query/'+this.state.searchString+'/'+this.state.center.latitude+','+this.state.center.longitude)
    .then(response => response.json())
    .then(json => this._handleresponse(json))
    .catch(function(e) {
      console.log(e); // "oh, no!"
    });
  },

  annotate: function (newAnnotations) {
    var annotations = this.state.annotations.concat(newAnnotations);
    this.setState({annotations: annotations});
  },

  _onSearchTextChanged: function (event) {
    console.log('onSearchTextChanged');
    this.setState({ searchString: event.nativeEvent.text });
    console.log(this.state.searchString, this.state.center.longitude, this.state.searchString);

    fetch('http://10.8.1.120:8000/api/search/query/'+this.state.searchString+'/'+this.state.center.latitude+','+this.state.center.longitude)
    .then(response => response.json())
    .then(json => this._handleresponse(json))
    .catch(function(e) {
      console.log(e);
    });
  },

  render: function() {
    StatusBarIOS.setHidden(true);
    return (
      <View style={styles.container}>
        {/*<Text style={styles.text} onPress={() => this.setDirectionAnimated(mapRef, 0)}>
          Set direction to 0
        </Text>
        <Text style={styles.text} onPress={() => this.setZoomLevelAnimated(mapRef, 6)}>
          Zoom out to zoom level 6
        </Text>
        <Text style={styles.text} onPress={() => this.setCenterCoordinateAnimated(mapRef, 48.8589, 2.3447)}>
          Go to Paris at current zoom level {parseInt(this.state.currentZoom)}
        </Text>
        <Text style={styles.text} onPress={() => this.setCenterCoordinateZoomLevelAnimated(mapRef, 35.68829, 139.77492, 14)}>
          Go to Tokyo at fixed zoom level 14
        </Text>
        <Text style={styles.text} onPress={() => {
          this.annotate({
            latitude: this.state.latitude,
            longitude:  this.state.longitude,
            title: 'This is a new marker',
            annotationImage: {
              url: 'https://cldup.com/CnRLZem9k9.png',
              height: 25,
              width: 25
            }
          });
        }}>
          Add new marker
        </Text>
        <Text style={styles.text} onPress={() => this.selectAnnotationAnimated(mapRef, 0)}>
          Open first popup
        </Text>
        <Text style={styles.text} onPress={() => {
          this.setState({
            annotations: this.state.annotations.slice(1, this.state.annotations.length)
          });
        }}>
          Remove first annotation
        </Text> */}
        <MapboxGLMap
          style={styles.map}
          direction={0}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          ref={mapRef}
          accessToken={'pk.eyJ1IjoibWFyeW1hc29uIiwiYSI6IjM1NGVhNWZmNzQ5Yjk5NTczMDFhMzc3Zjg2ZGEyYzI0In0.7IdD26iFQhD2b6LbTIw_Sw'}
          styleURL={'asset://styles/mapbox-streets-v7.json'}
          centerCoordinate={this.state.center}
          userLocationVisible={true}
          zoomLevel={this.state.zoom}
          onRegionChange={this.onRegionChange}
          onRegionWillChange={this.onRegionWillChange}
          annotations={this.state.annotations}
          onOpenAnnotation={this.onOpenAnnotation}
          onRightAnnotationTapped={this.onRightAnnotationTapped}
          onUpdateUserLocation={this.onUpdateUserLocation} />
        <View style={styles.flowRight}>
          <TextInput
            style={styles.searchInput}
            value={this.state.searchString}
            onChange={this._onSearchTextChanged}
            placeholder='Search'/>
        </View>    
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  map: {
    flex: 5
  },
  flowRight: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  searchInput: {
    position: 'absolute',
    top: 10,
    height: 36,
    width: 320,
    padding: 4,
    fontSize: 12,
    borderWidth: 0.5,
    borderColor: '#23FCA6',
    color: '#8C8C8C'
  }
});

module.exports = MapTab;



//annotations
// {
//   latitude: 40.72052634,
//   longitude: -73.97686958312988,
//   title: 'This is marker 1',
//   subtitle: 'It has a rightCalloutAccessory too',
//   rightCalloutAccessory: {
//     url: 'https://cldup.com/9Lp0EaBw5s.png',
//     height: 1000,
//     width: 100
//   },
//   annotationImage: {
//     url: 'https://cldup.com/CnRLZem9k9.png',
//     height: 100,
//     width: 100
//   },
//   id: 'marker1'
// }, {
//   latitude: 40.714541341726175,
//   longitude: -74.00579452514648,
//   title: 'Important!',
//   subtitle: 'Neat, this is a custom annotation image',
//   annotationImage: {
//     url: 'https://cldup.com/7NLZklp8zS.png',
//     height: 25,
//     width: 25
//   },
//   id: 'marker2'
// }