'use strict';

var React = require('react-native');
var config = require('../config');
var DeviceUUID = require("react-native-device-uuid");
var Display = require('react-native-device-display');
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');
var RefreshableListView = require('react-native-refreshable-listview');
var {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  WebView,
  ListView,
  TouchableHighlight,
  Image,
  Animated,
  Easing
} = React;

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var UserTab = React.createClass({
  mixins: [Subscribable.Mixin],
  getInitialState: function() {
    return {
      loading: true,
      scalesPageToFit: true,
      userComments: [],
      dataSource: ds.cloneWithRows([]),
      medium: []
    };
  },

  componentWillMount: function() {
    var context = this;
    this.eventEmitter = this.props.eventEmitter;
    DeviceUUID.getUUID().then((uuid) => {
      console.log('Device ID >>>>>>>>> ', uuid);
      return uuid;
    })
      .then((uuid) => {
        fetch(config.serverURL + '/api/users/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({token: uuid})
        }) // no ;
          .then(response => response.json())
          .then(json => context.setState({user: json._id}, function() {
            context.fetchUserComments();
          }))
      })
      .catch((err) => {
        console.log(err);
      });
  },

  componentDidMount: function() {
    this.addListenerOn(this.eventEmitter, 'refreshUserView', this.fetchUserComments);
  },

  fetchUserComments: function() {
    var context = this;
    this.setState({medium: []});
    fetch(config.serverURL + '/api/users/userInfo/' + this.state.user)
      .then(response => response.json())
      .then(json => {
        json.reverse();
        var comments = [];
        var venues = [];
        var currentComments = {};
        for (var i = 0; i < json.length; i++) {
          if (!currentComments[json[i].venue._id]) {
            currentComments[json[i].venue._id] = true;
            comments.push(json[i]);
            venues.push(json[i].venue);
          }
          if (venues.length === 20) {
            break;
          }
        }
        this.setState({userComments: comments, dataSource: ds.cloneWithRows(comments)});
        for (var i = 0; i < venues.length; i++) {
          context.fetchMedia(venues[i], i, comments);
        }

      })
  },

  fetchMedia(venue, i, comments) {
    var context = this;
    var route;
    if (venue) route = config.serverURL + '/api/media?venue=' + venue._id;
    else route = config.serverURL + '/api/media?venue=' + this.state.venue._id;
    fetch(route, {
      method: 'get',
    })
      .then(response => {
        var media = JSON.parse(response._bodyInit).reverse()[0].thumbPath;
        var medium = context.state.medium;
        medium[i] = media;
        context.setState({medium: medium}, function() {
          context.setState({dataSource: ds.cloneWithRows(comments)}, function() {
            context.render();
          });
        });
      });
  },

  renderVenues: function(comment, sectionID, rowID) {
    var venue = comment.venue;
    if (comment && this.state.medium[rowID]) {
      return (
        <TouchableHighlight onPress={this.onPressVenue.bind(this, venue)}>
          <View style={styles.venueItemContainer} flexWrap="wrap">
            <Image style={styles.thumbImage} source={{uri: this.state.medium[rowID]}} />
            <View style={{flex: 1, marginTop: 17}}>
              <Text style={{flex: 1, fontWeight: 'bold'}}>
                {venue.title}
              </Text>
              <Text style={{flex: 1}}>
                {venue.description}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      )
    } else if (comment && !this.state.medium[rowID]) {
      return (
        <TouchableHighlight onPress={this.onPressVenue.bind(this, venue)}>
          <View style={styles.venueItemContainer} flexWrap="wrap">
            <Image style={styles.thumbImage} source={require('image!icon_2x')} />
            <View style={{flex: 1, marginTop: 17}}>
              <Text style={{flex: 1, fontWeight: 'bold'}}>
                {venue.title}
              </Text>
              <Text style={{flex: 1}}>
                {venue.description}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      )
    }
  },

  onPressVenue: function(venue) {
    this.eventEmitter.emit('annotationTapped', {venue: venue, fromUserTab: true});
  },

  render: function() {
    return (
      <View style={styles.main}>
        <View style={styles.headerContainer}>
          <Text
            style={styles.tabName}
            numberOfLines={1}>
            My Kraken
          </Text>
        </View>
        <View style={styles.venueContainer} flexWrap="wrap">
          <RefreshableListView
            style={styles.ListView}
            dataSource={this.state.dataSource}
            renderRow={this.renderVenues}
            loadData={this.fetchUserComments}
            refreshDescription="Refreshing comments"
            refreshingIndictatorComponent={MyRefreshingIndicator}
          />
        </View>
      </View>
    );
  }
});

var MyRefreshingIndicator = React.createClass({
  getInitialState() {
    return {
      angle: new Animated.Value(0),
    };
  },

  componentDidMount() {
    this._animate();
  },

  _animate() {
    var TIMES = 400;
    this.state.angle.setValue(0);
    this._anim = Animated.timing(this.state.angle, {
      toValue: 140000,
      duration: 140000,
      easing: Easing.linear
    }).start(this._animate);
  },

  render() {
    return (
      <View style={styles.refreshImageContainer}>
        <Animated.Image
          source={require('image!pin')}
          style={[
              styles.refreshImage,
              {transform: [
                {rotate: this.state.angle.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })},
              ]}]}>
        </Animated.Image>
      </View>
    )
  },
})

var styles = StyleSheet.create({
  main: {
    flex: 1
  },
  ListView: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 10,
    height: Display.height - 49
  },
  venueContainer: {
    flex: 1,
    //padding: 5,
    flexDirection: 'column',
    borderTopWidth: 1,
    borderColor: '#E3E3E3'
  },
  // header container and children
  headerContainer: {
    justifyContent: 'center',
    width: Display.width,
    height: 60,
    alignItems: 'center',
    backgroundColor: "#47b3c8",
    paddingTop: 16
  },
  tabName: {
    flex: 1,
    fontFamily: 'Avenir',
    fontSize: 20,
    textAlign: 'center',
    padding: 10,
    color: 'white',
  },
  thumbImage: {
    //flex: 1,
    width: 70,
    height: 70,
    borderRadius: 35,
    margin: 0,
    padding: 0,
    marginRight: 10
  },
  venueItemContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    borderTopWidth: 1,
    borderColor: '#E3E3E3'
  },
  refreshImage: {
    height: 30,
    width: 30,
    justifyContent:'center',
    backgroundColor:'transparent',
    marginBottom: 10
  },
  refreshImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

module.exports = UserTab;