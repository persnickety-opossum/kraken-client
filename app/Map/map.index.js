'use strict';

// require modules
var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');
var mapRef = 'mapRef';
var EventEmitter = require('EventEmitter');
var Subscribable = require('Subscribable');
var moment = require('moment');
moment().format();
var Display = require('react-native-device-display');
var config = require('../config');
var DeviceUUID = require("react-native-device-uuid");

// require React Native modules
var {
  AppRegistry,
  StyleSheet,
  StatusBarIOS,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Image
  } = React;

// create MapTab class
var MapTab = React.createClass({
  mixins: [MapboxGLMap.Mixin],
  // initialize class with base states
  getInitialState() {
    return {
      searchString: '',
      zoom: 15,
      venuePins: [],
      searchPins: [],
      annotations: [],
      mapStyle: ['asset://styles/emerald-v7.json', 'asset://styles/dark-v7.json', 'asset://styles/light-v7.json', 'asset://styles/mapbox-streets-v7.json', 'asset://styles/satellite-v7.json'],
      currentMap: 1
    };
  },

  // update map on region change
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

  // Mapbox helper function for when right annotation press event is detected
  onRightAnnotationTapped(rightAnnot) {
    for(var i = 0; i < this.state.annotations.length; i++) {
      var currVenue = this.state.annotations[i];
      if(currVenue.id === rightAnnot.id) {
        if(currVenue._id) {
          this.eventEmitter.emit('annotationTapped', { venue: currVenue });
          break;
        } else {
          fetch(config.serverURL+'/api/venues', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: currVenue.title,
              description: currVenue.description,
              address: currVenue.address,
              latitude: currVenue.latitude,
              longitude: currVenue.longitude,
              creator: this.state.user,
              datetime: new Date().toISOString(),
            })
          })
            .then(response => response.json())
            .then(json => {
              this.setState({searchPins: []})
              this.setState({venuePins: []})
              this._venueQuery(config.serverURL + '/api/venues', true)
              this.eventEmitter.emit('annotationTapped', { venue: json})
            })
            .catch(function(err) {
              console.log('error');
              console.log(newVenue);
              console.log(err);
            });
          break;
        }
      }
    }
  },

  componentWillMount: function() {
    // retrieve user id, may be replaced with device UUID in the future
    var context = this;
    // Get Device UUID
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
          .then(json => context.setState({user: json._id}));
        this.getOverallRating();
      })
      .catch((err) => {
        console.log(err);
      });

    this._currentLocation();

    this.watchID = navigator.geolocation.watchPosition((lastPosition) => {
      this.setState({
        geolocation: lastPosition,
      });
      this.eventEmitter.emit('positionUpdated', lastPosition);
    });

    this.eventEmitter = this.props.eventEmitter;

    this._venueQuery(config.serverURL + '/api/venues', true);
  },

  // helper function to fetch venue data from server
  _venueQuery: function(url, inDB) {
    fetch(url)
      .then(response => response.json())
      .then(json => this._handleResponse(json, inDB))
      .catch(function(err) {
        console.log(err);
      });  
  },

  // helper function to update center of map
  _currentLocation: function() {
    navigator.geolocation.getCurrentPosition(
      (initialPosition) =>  this.setState({
        geolocation: initialPosition,
        center: {
          latitude: initialPosition.coords.latitude,
          longitude: initialPosition.coords.longitude
        }
      }),
      (error) => {
        this.setState({
          center: {
            latitude: 37.783585,
            longitude: -122.408955
          }
        });
        alert(error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    //this.setState({user: this.props.user});
  },

  _handleResponse: function (venues, inDb) {
    var context = this;
    venues.forEach(function (venue) {
      venue.rightCalloutAccessory = {
        url: 'image!arrow',
        height: 25,
        width: 25
      };
      if(inDb) {
        venue.subtitle = venue.description;
        venue.id = venue._id;
        var ratingsSum = 0;

        if (venue.ratings.length > 0) {
          for (var i = 0; i < venue.ratings.length; i++) {
            ratingsSum += venue.ratings[i].rating;
          }
          venue.overallRating = Math.round(ratingsSum / venue.ratings.length);
        } else {
          venue.overallRating = 'Be the first to vote!'
        }
        venue.annotationImage = {
          url: 'image!marker-1',
          height: 27,
          width: 41
        };
        venue.datetime = moment(venue.datetime).format("dddd, MMMM Do YYYY, h:mm:ss a");
        context.setState({venuePins: context.state.venuePins.concat(venue)});
      } else {
        venue.annotationImage = {
          url: 'image!marker-search',
          height: 27,
          width: 40
        };
        venue.comments = [];
        context.setState({searchPins: context.state.searchPins.concat(venue)});
      }
    });
    //this.setState({annotations: venues});
    this._displayPins();

  },

  _displayPins: function () {
    var pins = this.state.venuePins.concat(this.state.searchPins);
    this.setState({annotations: pins});
  },

  _onSearchTextChanged: function (event) {
    this.setState({ searchString: event.nativeEvent.text });
  },

  _onSearchTextSubmit: function () {
    this._textInput.setNativeProps({text: ''});
    this.setState({searchPins: []});
    this._venueQuery(config.serverURL + '/api/search/query/'+this.state.searchString+'/'+this.state.latitude+','+this.state.longitude, false);
  },


  // method for recentering and reset zoom level based on current location 
  _onCenterPressed: function () {
    //this.setCenterCoordinateZoomLevelAnimated(mapRef, 37.783585, -122.408955, 15);
    this.setCenterCoordinateZoomLevelAnimated(mapRef, this.state.center.latitude, this.state.center.longitude, 15)
  },

  // method for changing style of map on button press - NOT in working state because new map style covers old pins
  _onStylePressed: function () {
    if(this.state.currentMap === 4) {
      this.setState({currentMap: 0});
    } else {
      this.setState({currentMap: this.state.currentMap+1});
    }
  },

  render: function() {
    //StatusBarIOS.setHidden(true);
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
          styleURL={'asset://styles/light-v7.json'}
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
            ref={component => this._textInput = component}
            style={styles.searchInput}
            onChange={this._onSearchTextChanged}
            onSubmitEditing={this._onSearchTextSubmit}
            returnKeyType='search'
            placeholder='Search'/>
        </View>
        <TouchableHighlight onPress={this._onCenterPressed}> 
          <Image
            style={styles.button}
            source={require('image!target')}
          />
        </TouchableHighlight>
        {/*<TouchableHighlight 
          style={styles.stylebutton}
          underlayColor='#99d9f4'
          onPress={this._onStylePressed}>
          <Text style={styles.buttonText}>Style</Text>
        </TouchableHighlight>*/}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  beer:{

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
    top: 0,
    height: 36,
    width: Display.width*.89,
    padding: 4,
    fontSize: 12,
    borderWidth: 0.5,
    borderColor: '#23FCA6',
    color: '#8C8C8C'
  },
  button: {
    height: 40,
    width: 40,
    position: 'absolute',
    bottom: 50,
    right: 30
  },
  stylebutton: {
    height: 40,
    width: 40,
    position: 'absolute',
    bottom: 50,
    left: 30
  },
});

module.exports = MapTab;