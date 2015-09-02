/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var MapTab = require('./app/Map/map.index');
var VenueTab = require('./app/Venue/venue.index');
var WebTab = require('./app/GMap/gmap.index');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  MapView,
  TabBarIOS
} = React;

var persnickety = React.createClass({
  getInitialState() {
    return {
      selectedTab: 'map'
    }
  },
  changeTab(tabName) {
    this.setState({
      selectedTab: tabName
    });
  },
  render: function() {
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
  },
  map: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 50,
    bottom: 100,
  },
});

AppRegistry.registerComponent('persnickety', () => persnickety);
