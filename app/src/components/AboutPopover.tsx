import React from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { useTranslation } from '../i18n';

interface AboutPopoverProps {
  dismiss: () => void;
}

const AboutPopover: React.FC<AboutPopoverProps> = ({ dismiss }) => {
  const { t } = useTranslation();

  const close = (url: string) => {
    window.open(url, '_blank');
    dismiss();
  };

  return (
      <IonList>
      <IonItem button onClick={() => close('https://ionicframework.com/docs')}>
        <IonLabel>{t('aboutPopoverLearn')}</IonLabel>
      </IonItem>
      <IonItem
        button
        onClick={() => close('https://ionicframework.com/docs/react')}
      >
        <IonLabel>{t('aboutPopoverDocumentation')}</IonLabel>
      </IonItem>
      <IonItem
        button
        onClick={() => close('https://showcase.ionicframework.com')}
      >
        <IonLabel>{t('aboutPopoverShowcase')}</IonLabel>
      </IonItem>
      <IonItem
        button
        onClick={() => close('https://github.com/ionic-team/ionic-framework')}
      >
        <IonLabel>{t('aboutPopoverGithub')}</IonLabel>
      </IonItem>
      <IonItem button onClick={dismiss}>
        <IonLabel>{t('navSupport')}</IonLabel>
      </IonItem>
    </IonList>
  );
};

export default AboutPopover;
