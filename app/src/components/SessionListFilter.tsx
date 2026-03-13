import React from 'react';

import { getMode } from '@ionic/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonFooter,
  IonIcon,
} from '@ionic/react';
import {
  logoReact,
  call,
  document,
  logoIonic,
  hammer,
  restaurant,
  cog,
  colorPalette,
  construct,
  compass,
} from 'ionicons/icons';

import './SessionListFilter.css';

import { connect } from '../data/connect';
import { updateFilteredTracks } from '../data/sessions/sessions.actions';
import { useTranslation } from '../i18n';

interface OwnProps {
  onDismissModal: () => void;
}

interface StateProps {
  allTracks: string[];
  filteredTracks: string[];
}

interface DispatchProps {
  updateFilteredTracks: typeof updateFilteredTracks;
}

type SessionListFilterProps = OwnProps & StateProps & DispatchProps;

const SessionListFilter: React.FC<SessionListFilterProps> = ({
  allTracks,
  filteredTracks,
  onDismissModal,
  updateFilteredTracks,
}) => {
  const ios = getMode() === 'ios';
  const { t, tTrack } = useTranslation();

  const toggleTrackFilter = (track: string) => {
    if (filteredTracks.indexOf(track) > -1) {
      updateFilteredTracks(filteredTracks.filter((x) => x !== track));
    } else {
      updateFilteredTracks([...filteredTracks, track]);
    }
  };

  const handleDeselectAll = () => {
    updateFilteredTracks([]);
  };

  const handleSelectAll = () => {
    updateFilteredTracks([...allTracks]);
  };

  const iconMap: { [key: string]: any } = {
    React: logoReact,
    Documentation: document,
    Food: restaurant,
    Ionic: logoIonic,
    Tooling: hammer,
    Design: colorPalette,
    Services: cog,
    Workshop: construct,
    Navigation: compass,
    Communication: call,
  };

  return (
    <>
      <IonHeader translucent={true} className="session-list-filter">
        <IonToolbar>
          <IonButtons slot="start">
            {ios && (
              <IonButton onClick={onDismissModal}>
                {t('commonCancel')}
              </IonButton>
            )}
            {!ios && (
              <IonButton onClick={handleDeselectAll}>
                {t('commonReset')}
              </IonButton>
            )}
          </IonButtons>

          <IonTitle>{t('filterSessionsTitle')}</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={onDismissModal} strong>
              {t('commonDone')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="session-list-filter">
        <IonList lines={ios ? 'inset' : 'full'}>
          <IonListHeader>{t('tracksLabel')}</IonListHeader>

          {allTracks.map((track) => (
            <IonItem key={track}>
              {ios && (
                <IonIcon
                  slot="start"
                  icon={iconMap[track]}
                  color="medium"
                  aria-hidden="true"
                />
              )}
              <IonCheckbox
                onIonChange={() => toggleTrackFilter(track)}
                checked={filteredTracks.indexOf(track) !== -1}
                color="primary"
                value={track}
              >
                {tTrack(track)}
              </IonCheckbox>
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      {ios && (
        <IonFooter>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleDeselectAll}>
                {t('commonDeselectAll')}
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={handleSelectAll}>
                {t('commonSelectAll')}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonFooter>
      )}
    </>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    allTracks: state.data.allTracks,
    filteredTracks: state.data.filteredTracks,
  }),
  mapDispatchToProps: {
    updateFilteredTracks,
  },
  component: SessionListFilter,
});
