import React, { useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonRow,
  IonCol,
  IonButton,
  IonTextarea,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import './Support.scss';
import { useTranslation } from '../i18n';

const Support: React.FC = () => {
  const [present] = useIonToast();
  const [supportMessage, setSupportMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  useIonViewWillEnter(() => {
    present({
      message: t('supportNotice'),
      duration: 3000,
    });
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (supportMessage) {
      setSupportMessage('');
      setSubmitted(false);

      present({
        message: t('supportRequestSent'),
        duration: 3000,
      });
    }
  };

  return (
    <IonPage id="support-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navSupport')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="support-logo">
          <img src="/assets/img/appicon.svg" alt={t('ionicLogoAlt')} />
        </div>

        <div className="support-form">
          <form onSubmit={submit} noValidate>
            <IonTextarea
              label={t('supportMessageLabel')}
              labelPlacement="stacked"
              fill="solid"
              value={supportMessage}
              name="supportQuestion"
              rows={6}
              errorText={
                submitted && !supportMessage
                  ? t('supportMessageRequired')
                  : ''
              }
              onIonInput={(e) => setSupportMessage(e.detail.value!)}
              required
            />

            <IonRow>
              <IonCol>
                <IonButton expand="block" type="submit">
                  {t('commonSubmit')}
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Support;
