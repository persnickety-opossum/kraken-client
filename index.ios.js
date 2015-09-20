'use strict';

var React = require('react-native');
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');

// require tab views
var MapTab = require('./app/Map/map.index');
var VenueTab = require('./app/Venue/venue.index');
var UserTab = require('./app/User/user.index');
var VideoTab = require('./app/SCRecorder/screcorder.index');

var MapboxGLMap = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
var moment = require('moment');

var config = require('./app/config');

var io = require('socket.io-client/socket.io');
var socket = io.connect(config.serverURL);

// Required for sockets
window.navigator.userAgent = "react-native";

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
      venue: 'default venue',
      venueImg: require('image!icon-venue'),
      venueClicked: 'map',
      fromUserTab: false
    }
  },
  componentWillMount: function() {
    this.eventEmitter = new EventEmitter();
  },
  componentDidMount: function() {
    this.addListenerOn(this.eventEmitter, 'annotationTapped', this.selectVenue);
    this.addListenerOn(this.eventEmitter, 'positionUpdated', this.updatePosition);
    this.addListenerOn(this.eventEmitter, 'userFound', this.setUserState);
  },

  updatePosition(position) {
    this.setState({geolocation: position}); //THIS LINE CAUSES THE GEOLOCATION BEING PASSED TO ALL TABS
  },

  setUserState(userId) {
    this.setState({userId: userId});
  },

  selectVenue: function(eventObj) {
    if (eventObj.fromUserTab === true) {
      this.setState({fromUserTab: true});
    } else {
      this.setState({fromUserTab: false});
    }
    var venue = eventObj.venue;
    // Listen to socket for media updates
    var context = this;
    socket.removeAllListeners();
    socket.on('media-' + venue._id, function (response) {
      context.eventEmitter.emit('mediaUpdated', response);
    });

    socket.on('mediaDeleted-' + venue.id, function (response) {
      context.eventEmitter.emit('mediaDeleted', response);
    });
    socket.on('commentDeleted-' + venue.id, function (response) {
      context.eventEmitter.emit('commentDeleted', response);
    });

    this.setState({venueImg: require('image!icon-venue')}, function() {
      context.setState({venue: venue}, function() {
        context.setState({venueClicked: 'venue'}, function() {
          context.render();
          context.changeTab('venue');
        });
      });
    });
  },

  changeTab(tabName) {
    var context = this;
    if (tabName === 'My Kraken') {
      context.eventEmitter.emit('refreshUserView');
    }
    if (tabName === 'map') {
      context.eventEmitter.emit('refreshMap');
    }
    this.setState({
      selectedTab: tabName
    });
  },
  render: function() {
    //StatusBarIOS.setHidden(true);
    return (
      <View style={styles.container}>
        <TabBarIOS 
          tintColor="white"
          barTintColor="#333">
          <TabBarIOS.Item
            title="Map"
            icon={ require('image!icon-map') }
            onPress={ () => this.changeTab('map') }
            selected={ this.state.selectedTab === 'map' }>
            <MapTab eventEmitter={this.eventEmitter}/>
          </TabBarIOS.Item>

          <TabBarIOS.Item
            title="Venue"
            icon={ this.state.venueImg }
            onPress={ () => this.changeTab(this.state.venueClicked) }
            selected={ this.state.selectedTab === 'venue' }>
            <View style={ styles.pageView }>
              <VenueTab fromUserTab={this.state.fromUserTab}
                        venue={this.state.venue}
                        geolocation={this.state.geolocation}
                        eventEmitter={this.eventEmitter}
              />
            </View>
          </TabBarIOS.Item>

          <TabBarIOS.Item
            title="My Kraken"
            icon={ require('image!icon-fav') }
            onPress={ () => this.changeTab('My Kraken') }
            selected={ this.state.selectedTab === 'My Kraken' }>
            <View style={ styles.pageView }>
              <UserTab eventEmitter={this.eventEmitter} />
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
