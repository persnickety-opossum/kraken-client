'use strict';

var React = require('react-native');
//var venue = require('./venueMock');
var {
  SliderIOS,
  Text,
  StyleSheet,
  View,
  ListView
  } = React;

var config = require('../config');

var RefreshableListView = require('react-native-refreshable-listview');
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var VenueTab = React.createClass({
  getInitialState() {
    return {
      voteValue: 0,
      venue: this.props.venue,
      overallRating: 0,
      dataSource: ds.cloneWithRows(this.props.venue.comments),
    };
  },
  //componentDidMount: function() {
  //  this.setState({venue: this.props.venue});
  //  this.setState({dataSource: ds.cloneWithRows(this.props.venue.comments)})
  //},
  reloadComments() {
  //  //return ArticleStore.reload() // returns a Promise of reload completion
    console.log(this.state.venue);
    var route = config.serverURL + '/api/venues/' + this.state.venue._id;
    fetch(route)
      .then(response => response.json())
      .then(json => this.setState({venue: json, dataSource: ds.cloneWithRows(json.comments)}))
  },

  componentWillReceiveProps: function(nextProps) {
    var venue = nextProps.venue;
    this.setState({
      venue: venue,
      dataSource: ds.cloneWithRows(venue.comments)
    });
  },

  getOverallRating() {
    var ratings = this.state.venue.ratings;
    var sum = 0;
    for (var i = 0; i < ratings.length; i++) {
      sum += ratings[i];
    }
    var average = Math.round(sum / ratings.length);
    this.setState({overallRating: average});
  },

  setRoundVoteValue(voteValue) {
    voteValue *= 10;
    voteValue = Math.round(voteValue);
    this.setState({voteValue: voteValue})
  },

  render() {
    var venue = this.props.venue;
    return (
      <View>
        <Text style={styles.header}>
          Waz Kraken
        </Text>
        <Text style={styles.venueName}>
          {venue.title}
        </Text>
        <Text style={[styles.text, styles.alignLeft]} >
          Venue description: {venue.description}
        </Text>
        <Text style={[styles.text, styles.alignLeft]} >
          Address: {venue.address}
        </Text>
        <Text style={styles.text} >
          Time: {venue.datetime}
        </Text>
        <Text style={styles.text} >
          Overall rating: {venue.overallRating}
        </Text>
        <Text style={[styles.text, styles.yourRating]} >
          Your rating: {this.state.voteValue}
        </Text>
        <SliderIOS
          style={styles.slider}
          onValueChange={(voteValue) => this.setState({voteValue: Math.round(voteValue*10)})}
          maximumTrackTintColor='red'/>

        <RefreshableListView
          style={styles.listView}
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData}</Text>}
          loadData={this.reloadComments}
          refreshDescription="Refreshing comments"
          />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 3,
  },
  alignLeft: {
    //textAlign: 'left'
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: '#000000',
    color: '#ffffff'
  },
  venueName: {
    fontSize: 20,
    textAlign: 'center'
  },
  yourRating: {
    marginBottom: 5
  },
  slider: {
    marginTop: 8,
    height: 20,
    marginLeft: 40,
    marginRight: 40,
    flex: 0.5
  },
  listView: {
    margin: 10
  }
});

module.exports = VenueTab;