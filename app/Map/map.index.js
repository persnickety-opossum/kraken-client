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
var { Icon, } = require('react-native-icons');
var AutoComplete = require('react-native-autocomplete');

// require React Native modules
var {
  AlertIOS,
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
  mixins: [MapboxGLMap.Mixin, Subscribable.Mixin],
  // initialize class with base states
  getInitialState() {
    return {
      searchString: '',
      zoom: 15,
      autoSearch: [],
      venuePins: [],
      searchPins: [],
      annotations: [],
      autocomplete: false,
      mapStyle: ['asset://styles/emerald-v8.json', 'asset://styles/dark-v8.json', 'asset://styles/light-v8.json', 'asset://styles/mapbox-streets-v8.json', 'asset://styles/satellite-v8.json'],
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
              ratings: {},
              datetime: new Date().toISOString()
            })
          })
            .then(response => response.json())
            .then(json => {
              this.eventEmitter.emit('annotationTapped', { venue: json});
            })
            .then(() => this.setState({searchPins: []}))
            .then(() => this.setState({venuePins: []}))
            .then(() => this._venueQuery(config.serverURL + '/api/venues', true))
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
    this.eventEmitter = this.props.eventEmitter;
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
          .then(json => context.setState({user: json._id}, function() {
            context.eventEmitter.emit('userFound', context.state.user);
            return;
          }));
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
    //navigator.geolocation.stopObserving();

    this._venueQuery(config.serverURL + '/api/venues', true);
  },

  componentDidMount: function() {
    var context = this;
    this.addListenerOn(this.eventEmitter, 'refreshMap', function() {
      var annotations = context.state.annotations;
      var length = annotations.length;
      //console.log(annotations);
      for (var i = 0; i < length - 1; i++) {
        context.removeAnnotation(mapRef, 0);
      }
      setTimeout(function() {
        console.log(context.state.annotations);
        context.setState({annotations: [], venuePins: [], searchPins: []}, function() {
          context._venueQuery(config.serverURL + '/api/venues', true);
        });
      }, 1000);
    });
  },

  componentWillUnmount: function() {
    navigator.geolocation.clearWatch(this.watchID);
  },

  componentWillUpdate: function(nextProps, nextState) {
    //console.log(nextProps);
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
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 30000}
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
      venue.subtitle = venue.description;
      if(inDb) {
        venue.id = venue._id;
        var numRatings = Object.keys(venue.ratings).length;
        var ratingsSum = 0;

        if (numRatings > 0) {
          for (var userID in venue.ratings) {
            ratingsSum += venue.ratings[userID];
          }
          venue.overallRating = Math.round(ratingsSum / numRatings);
        } else {
          venue.overallRating = 'Be the first to vote!'
        }
        var attendees = Object.keys(venue.attendees).length;
        if (attendees > 3) {
          venue.annotationImage = {
            url: 'image!marker-kraken',
            height: 47,
            width: 44
          };
        } else if (attendees > 0) {
          venue.annotationImage = {
            url: 'image!marker-2',
            height: 27,
            width: 41
          };
        } else {
          venue.annotationImage = {
            url: 'image!marker-1',
            height: 27,
            width: 41
          };
        }
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
    var context = this;
    var pins = this.state.searchPins.concat(this.state.venuePins);

    this.setState({annotations: pins}, function() {
      if(this.state.autocomplete) {
        this.setCenterCoordinateZoomLevelAnimated(mapRef, this.state.searchPins[0].latitude, this.state.searchPins[0].longitude, 15);
        setTimeout(context.selectAnnotationAnimated.bind(context, mapRef, 0), 1000);
      }
      this.setState({autocomplete: false});
    });
  },

  // update autocomplete by querying data as search text changes
  _onSearchTextChanged: function (text) {
    this.setState({ searchString: text });
    this.setState({searchPins: []});
    fetch(config.serverURL + '/api/search/query/'+this.state.searchString+'/'+this.state.latitude+','+this.state.longitude)
      .then(response => response.json())
      .then(json => this.setState({autoSearch: json.map(function(search) {
        return search.title;
      })}));
  },

  // search based on autocomplete selection
  _onAutoSubmit: function (query) {
    this.setState({searchPins: [], autocomplete: true});
    this._venueQuery(config.serverURL + '/api/search/query/'+query+'/'+this.state.latitude+','+this.state.longitude, false);
  },

  // search using submit button
  _onSearchTextSubmit: function () {
    // this._textInput.setNativeProps({text: ''});
    this.setState({searchPins: []});
    this._venueQuery(config.serverURL + '/api/search/query/'+this.state.searchString+'/'+this.state.latitude+','+this.state.longitude, false);
  },
  // method for recentering and reset zoom level based on current location 
  _onCenterPressed: function () {
    this.setCenterCoordinateZoomLevelAnimated(mapRef, this.state.center.latitude, this.state.center.longitude, 15);
  },

  // method for changing style of map on button press - NOT in working state because new map style covers old pins
  _onStylePressed: function () {
    if(this.state.currentMap === 4) {
      this.setState({currentMap: 0});
    } else {
      this.setState({currentMap: this.state.currentMap+1});
    }
  },

  // map view render
  render: function() {
    return (
      <View style={styles.container}>
        <MapboxGLMap
          style={styles.map}
          direction={0}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          ref={mapRef}
          accessToken={'pk.eyJ1IjoibWFyeW1hc29uIiwiYSI6IjM1NGVhNWZmNzQ5Yjk5NTczMDFhMzc3Zjg2ZGEyYzI0In0.7IdD26iFQhD2b6LbTIw_Sw'}
          styleURL={'asset://styles/light-v8.json'}
          centerCoordinate={this.state.center}
          userLocationVisible={true}
          zoomLevel={this.state.zoom}
          onRegionChange={this.onRegionChange}
          onRegionWillChange={this.onRegionWillChange}
          annotations={this.state.annotations}
          onOpenAnnotation={this.onOpenAnnotation}
          onRightAnnotationTapped={this.onRightAnnotationTapped}
          onUpdateUserLocation={this.onUpdateUserLocation} />

        <AutoComplete
          ref={component => this._textInput = component}
          style={styles.autocomplete}

          onTyping={this._onSearchTextChanged}
          onSelect={this._onAutoSubmit}
          onSubmitEditing={this._onSearchTextSubmit}

          suggestions={this.state.autoSearch}

          placeholder='Search'
          clearButtonMode='always'
          returnKeyType='search'
          textAlign='center'
          clearTextOnFocus={true}

          maximumNumberOfAutoCompleteRows='5'
          applyBoldEffectToAutoCompleteSuggestions={true}
          reverseAutoCompleteSuggestionsBoldEffect={true}
          showTextFieldDropShadowWhenAutoCompleteTableIsOpen={false}
          disableAutoCompleteTableUserInteractionWhileFetching={true}
          autoCompleteTableViewHidden={false}

          autoCompleteTableBorderColor='lightblue'
          autoCompleteTableBackgroundColor='azure'
          autoCompleteTableCornerRadius={0}
          autoCompleteTableBorderWidth={1}

          autoCompleteRowHeight={30}

          autoCompleteFontSize={15}
          autoCompleteRegularFontName='Helvetica Neue'
          autoCompleteBoldFontName='Helvetica Bold'
          autoCompleteTableCellTextColor={'lightblue'}
        />
        {/* <View style={styles.searchContainer}>
          <TextInput
            ref={component => this._textInput = component}
            style={styles.searchInput}
            onChange={this._onSearchTextChanged}
            onSubmitEditing={this._onSearchTextSubmit}
            returnKeyType='search'
            placeholder={'  Search'}/>
        </View> */}
        <TouchableHighlight onPress={this._onCenterPressed}> 
          <Image
            style={styles.button}
            source={require('image!target')}
          />
        </TouchableHighlight>
      </View>
    );
  }
});

var styles = StyleSheet.create({

  // main view container
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  // map view
  map: {
    flex: 5
  },
  // search bar
  searchContainer: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  autocomplete: {
      position: 'absolute',
      top: 3,
      left: Display.width*.15,
      height: 36,
      width: Display.width*.70,
      padding: 4,
      fontSize: 12,
      color: '#8C8C8C'
  },
  // center button
  button: {
    height: 40,
    width: 40,
    position: 'absolute',
    bottom: 50,
    right: 40
  },
});

module.exports = MapTab;