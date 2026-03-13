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
import { leafOutline, bookOutline, searchOutline } from 'ionicons/icons';
import { useTranslation } from '../i18n';
import './Home.scss';

const Home: React.FC = () => {
  const { t } = useTranslation();

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

export default Home;
