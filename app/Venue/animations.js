var React = require('react-native');
var {
  LayoutAnimation,
} = React;

var animations = {
  layout: {
    spring: {
      duration: 200,
      create: {
        duration: 200,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 400,
      },
    },
    easeInEaseOut: {
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    },
  },
};

module.exports = animations;