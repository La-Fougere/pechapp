import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import './About.scss';
import { useTranslation } from '../i18n';

interface AboutProps {}

const About: React.FC<AboutProps> = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t('aboutMissionTitle'),
      body: t('aboutMissionBody'),
    },
    {
      title: t('aboutHowTitle'),
      body: t('aboutHowBody'),
    },
    {
      title: t('aboutDataTitle'),
      body: t('aboutDataBody'),
    },
    {
      title: t('aboutContactTitle'),
      body: t('aboutContactBody'),
    },
  ];

  return (
    <IonPage id="about-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navAbout')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="about-hero">
          <img
            className="about-hero__image"
            src="/assets/img/fish/fish-hero.svg"
            alt={t('aboutHeroAlt')}
          />
          <h2>{t('aboutHeadline')}</h2>
          <p>{t('aboutIntro')}</p>
        </div>

        <div className="about-sections">
          {sections.map((section) => (
            <IonCard key={section.title} className="about-card">
              <IonCardHeader>
                <IonCardTitle>{section.title}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>{section.body}</IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default React.memo(About);
