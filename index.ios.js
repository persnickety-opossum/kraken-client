'use strict';

var React = require('react-native');
var MapTab = require('./app/Map/map.index');
var VenueTab = require('./app/Venue/venue.index');
var WebTab = require('./app/GMap/gmap.index');
var MapboxGLMap = require('react-native-mapbox-gl');
var mapRef = 'mapRef';

var {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBarIOS,
  View,
} = React;

var persnickety = React.createClass({
  mixins: [MapboxGLMap.Mixin],
  getInitialState() {
    return {
       center: {
         latitude: 40.72052634,
         longitude: -73.97686958312988
       },
       zoom: 11,
       annotations: [{
         latitude: 40.72052634,
         longitude:  -73.97686958312988,
         title: 'This is marker 1',
         subtitle: 'It has a rightCalloutAccessory too',
         rightCalloutAccessory: {
             url: 'https://cldup.com/9Lp0EaBw5s.png',
             height: 25,
             width: 25
         },
         annotationImage: {
           url: 'https://cldup.com/CnRLZem9k9.png',
           height: 25,
           width: 25
         },
         id: 'marker1'
       },{
         latitude: 40.714541341726175,
         longitude:  -74.00579452514648,
         title: 'Important!',
         subtitle: 'Neat, this is a custom annotation image',
         annotationImage: {
           url: 'https://cldup.com/7NLZklp8zS.png',
           height: 25,
           width: 25
         },
         id: 'marker2'
       }]
     };
  },
  onRegionChange(location) {
    this.setState({ currentZoom: location.zoom });
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
  render: function() {
    StatusBarIOS.setHidden(true);
    return (
      <View style={styles.container}>
        <TabBarIOS>
        <TabBarIOS.Item
          title="Map"
          icon={ require('image!map') }
          onPress={ () => this.changeTab('map') }
          selected={ this.state.selectedTab === 'map' }>
          <MapTab />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="Venue"
          icon={ require('image!messages') }
          onPress={ () => this.changeTab('venue') }
          selected={ this.state.selectedTab === 'venue' }>
          <View style={ styles.pageView }>
            <VenueTab />
          </View>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          title="G-Map"
          icon={ require('image!settings') }
          onPress={ () => this.changeTab('settings') }
          selected={ this.state.selectedTab === 'settings' }>
          <View style={ styles.pageView }>
            <WebTab />
          </View>
        </TabBarIOS.Item>
      </TabBarIOS>
    </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
  },
  pageView: {
    flex: 1,
  
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    flexDirection: 'column',
    flex: 1
  },
  map: {
    flex: 5
  },
  text: {
    padding: 2
  }
});

AppRegistry.registerComponent('persnickety', () => persnickety);
