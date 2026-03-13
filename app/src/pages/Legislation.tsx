import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/react';
import { useTranslation } from '../i18n';
import './Legislation.scss';

const Legislation: React.FC = () => {
  const { t } = useTranslation();

  const articles = [
    {
      title: t('legislationArticle1Title'),
      date: t('legislationArticle1Date'),
      summary: t('legislationArticle1Summary'),
    },
    {
      title: t('legislationArticle2Title'),
      date: t('legislationArticle2Date'),
      summary: t('legislationArticle2Summary'),
    },
    {
      title: t('legislationArticle3Title'),
      date: t('legislationArticle3Date'),
      summary: t('legislationArticle3Summary'),
    },
    {
      title: t('legislationArticle4Title'),
      date: t('legislationArticle4Date'),
      summary: t('legislationArticle4Summary'),
    },
  ];

  return (
    <IonPage id="legislation-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navLegislation')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="legislation-intro">
          <h2>{t('legislationHeadline')}</h2>
          <p>{t('legislationIntro')}</p>
        </div>

        <div className="legislation-cards">
          {articles.map((article) => (
            <IonCard key={article.title} className="legislation-card">
              <IonCardHeader>
                <IonCardTitle>{article.title}</IonCardTitle>
                <IonCardSubtitle>{article.date}</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>{article.summary}</IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Legislation;
