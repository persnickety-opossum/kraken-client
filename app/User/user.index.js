'use strict';

var React = require('react-native');
var config = require('../config');
var DeviceUUID = require("react-native-device-uuid");
var Display = require('react-native-device-display');
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
var RefreshableListView = require('react-native-refreshable-listview');

var UserTab = React.createClass({

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
    this.eventEmitter = this.props.eventEmitter;
  },

  fetchUserComments: function() {
    var context = this;
    fetch(config.serverURL + '/api/users/userInfo/' + this.state.user)
      .then(response => response.json())
      .then(json => {
        json.reverse();
        var comments = [];
        var currentComments = {};
        for (var i = 0; i < json.length; i++) {
          if (!currentComments[json[i].venue._id]) {
            currentComments[json[i].venue._id] = true;
            comments.push(json[i]);
          }
        }
        for (var i = 0; i < comments.length; i++) {
          var venue = comments[i].venue;
          context.fetchMedia(venue);
        }

        this.setState({userComments: comments, dataSource: ds.cloneWithRows(comments)}, function() {

        });
      })
  },

  componentWillUpdate: function() {

  },

  fetchMedia(venue) {
    //console.log(venue);
    var context = this;
    context.setState({medium: []}); // Otherwise it just keeps adding on to media?
    var route;
    if (venue) route = config.serverURL + '/api/media?venue=' + venue._id;
    else route = config.serverURL + '/api/media?venue=' + this.state.venue._id;
    //console.log(route);
    fetch(route, {
      method: 'get',
    })
      .then(response => {
        var media = JSON.parse(response._bodyInit).reverse()[0];
        var medium = context.state.medium;
        medium.push(media);
        context.setState({medium: medium}, function() {
          console.log(medium);
          //context.renderVenues();
        });
        //console.log(this.state.medium);
      });

    //console.log(context.state.media);

  },

  renderVenues: function(comment, sectionID, rowID) {
    var venue = comment.venue;
    if (comment) {
      return (
        <TouchableHighlight onPress={this.onPressVenue.bind(this, venue)}>
          <View style={styles.venueItemContainer} flexWrap="wrap">
            <Image style={styles.thumbImage} source={{uri: this.state.medium[rowID]}} />
            <View style={{flex: 1}}>
              <Text style={{flex: 1}}>
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
    padding: 5,
    marginTop: 10,
    height: Display.height - 49
  },
  venueContainer: {
    flex: 1,
    //padding: 5,
    flexDirection: 'column',
    marginBottom: 5
  },
  tabName: {
    flex: 1,
    fontFamily: 'Avenir',
    fontSize: 20,
    textAlign: 'center',
  },
  thumbImage: {
    //flex: 1,
    width: 70,
    height: 70,
    margin: 0,
    padding: 0,
    marginRight: 5
  },
  venueItemContainer: {
    flex: 1,
    flexDirection: 'row'
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