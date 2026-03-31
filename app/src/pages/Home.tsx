import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
} from '@ionic/react';
import {
  leafOutline,
  bookOutline,
  searchOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useTranslation } from '../i18n';
import { connect } from '../data/connect';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import './Home.scss';

interface StateProps {
  darkMode: boolean;
}

const Home: React.FC<StateProps> = ({ darkMode }) => {
  const { t } = useTranslation();
  const isOnline = useNetworkStatus();

  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navHome')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="home-hero">
          {!isOnline && (
            <div
              className={`offline-banner offline-banner--offline offline-banner--home ${darkMode ? 'offline-banner--dark' : ''}`}
              role="status"
              aria-live="polite"
            >
              <IonIcon
                className="offline-banner__icon"
                icon={informationCircleOutline}
              />
              <div className="offline-banner__text">
                {t('offlineBannerMessage')}
              </div>
            </div>
          )}
          <div className="home-hero__content">
            <h1>{t('homeHeadline')}</h1>
            <p>{t('homeIntro')}</p>
            <div className="home-hero__actions">
              <IonButton routerLink="/identify">
                <IonIcon slot="start" icon={searchOutline} />
                {t('homeIdentifyFish')}
              </IonButton>
              <IonButton routerLink="/tabs/species">
                <IonIcon slot="start" icon={leafOutline} />
                {t('homeExploreSpecies')}
              </IonButton>
              <IonButton
                routerLink="/tabs/legislation"
                color="primary"
                fill="outline"
              >
                <IonIcon slot="start" icon={bookOutline} />
                {t('homeExploreLegislation')}
              </IonButton>
            </div>
          </div>
          <img
            className="home-hero__image"
            src="/assets/img/fish/fish-hero.svg"
            alt={t('homeHeroAlt')}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default connect<{}, StateProps, {}>({
  mapStateToProps: (state) => ({
    darkMode: state.user.darkMode,
  }),
  component: Home,
});
