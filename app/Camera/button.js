var React = require('react-native');
var styles = require('./styles');
var { Icon, } = require('react-native-icons');

var {
  Text,
  TouchableHighlight,
} = React;

var Button = React.createClass({
  render() {
    var fontAwesome = 'fontawesome|' + this.props.icon;
    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        style={[styles.iconContainer, this.props.extraStyle, this.props.style]}>
        <Icon  
          name={fontAwesome}
          size={this.props.size || 45}
          color={this.props.color || '#FFF'}
          style={styles.icon} />
      </TouchableHighlight>
    );
  }
});

module.exports = Button;