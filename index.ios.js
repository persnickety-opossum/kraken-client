'use strict';

var React = require('react-native');
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');
var MapTab = require('./app/Map/map.index');
var VenueTab = require('./app/Venue/venue.index');
var WebTab = require('./app/GMap/gmap.index');
var MapboxGLMap = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
var moment = require('moment');
moment().format();

var {
  AppRegistry,
  StyleSheet,
  Text,
  StatusBarIOS,
  View,
  MapView,
  TabBarIOS,
} = React;

var persnickety = React.createClass({
  mixins: [MapboxGLMap.Mixin, Subscribable.Mixin],
  getInitialState() {
    return {
      selectedTab: 'map',
      venue: 'default venue'
    }
  },
  componentWillMount: function() {
    this.eventEmitter = new EventEmitter();
  },
  componentDidMount: function() {
    this.addListenerOn(this.eventEmitter, 'annotationTapped', this.selectVenue);
  },

  _handleResponse(response) {
    this.setState({venue: response});
    this.getOverallRating();
  },

  selectVenue: function(eventObj) {
    var venue = eventObj.venue;
    var newVenue = venue;
    //var currDateTime = venue.venue.datetime;

    //var currDateTime = new Date(venue.venue.datetime);
    //var currYear = currDateTime.getFullYear();
    //var currMonth = currDateTime.getMonth();
    //var currDay = currDateTime.getDate();
    //var currHour = currDateTime.getHours();
    //var currMinute = currDateTime.getMinutes();

    //get correct datemin format
    //$scope.datemin = currDateTime.toISOString().split('T')[0] + 'T00:00:00';
    //venue.venue.datetime = new Date(currYear, currMonth, currDay, currHour, currMinute);
    //venue.venue.datetime = venue.venue.datetime.split('T')[0]
    //for (var i = 0; i < newVenue.comments.length;i++) {
    //  newVenue.comments[i].datetime = moment(newVenue.comments[i].datetime).fromNow();
    //}
    this.setState({venue: newVenue});
    this.changeTab('venue');
  },

  changeTab(tabName) {
    this.setState({
      selectedTab: tabName
    });
  },
  render: function() {
    //StatusBarIOS.setHidden(true);
    return (
      <View style={styles.container}>
        <TabBarIOS>
        <TabBarIOS.Item
          title="Map"
          icon={ require('image!map') }
          onPress={ () => this.changeTab('map') }
          selected={ this.state.selectedTab === 'map' }>
          <MapTab eventEmitter={this.eventEmitter}/>
        </TabBarIOS.Item>

        <TabBarIOS.Item
          title="Venue"
          icon={ require('image!messages') }
          onPress={ () => this.changeTab('venue') }
          selected={ this.state.selectedTab === 'venue' }>
          <View style={ styles.pageView }>
            <VenueTab venue={this.state.venue}/>
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
    justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#F5FCFF',
    marginTop: 20
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