import React from 'react';
import { connect } from '../data/connect';
import { Redirect } from 'react-router';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface StateProps {
  hasSeenTutorial: boolean;
}

const HomeOrTutorial: React.FC<StateProps> = ({ hasSeenTutorial }) => {
  const isOnline = useNetworkStatus();
  const shouldShowTutorial = !hasSeenTutorial && isOnline;
  return hasSeenTutorial ? (
    <Redirect to="/tabs/home" />
  ) : shouldShowTutorial ? (
    <Redirect to="/tutorial" />
  ) : (
    <Redirect to="/tabs/home" />
  );
};

export default connect<{}, StateProps, {}>({
  mapStateToProps: (state) => ({
    hasSeenTutorial: state.user.hasSeenTutorial,
  }),
  component: HomeOrTutorial,
});
