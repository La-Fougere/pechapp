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
  IonInput,
} from '@ionic/react';
import { useHistory } from 'react-router';
import './Login.scss';
import { setIsLoggedIn, setUsername } from '../data/user/user.actions';
import { connect } from '../data/connect';
import { useTranslation } from '../i18n';

interface LoginProps {
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
}

const Login: React.FC<LoginProps> = ({
  setIsLoggedIn,
  setUsername: setUsernameAction,
}) => {
  const history = useHistory();
  const [login, setLogin] = useState({ username: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (login.username && login.password) {
      await setIsLoggedIn(true);
      await setUsernameAction(login.username);
      history.push('/tabs/home');
    }
  };

  const onSignup = () => {
    history.push('/signup');
  };

  return (
    <IonPage id="login-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navLogin')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="login-logo">
          <img src="/assets/img/appicon.svg" alt={t('ionicLogoAlt')} />
        </div>

        <div className="login-form">
          <form onSubmit={onLogin} noValidate>
            <IonInput
              label={t('usernameLabel')}
              labelPlacement="stacked"
              fill="solid"
              value={login.username}
              name="username"
              type="text"
              spellCheck={false}
              autocapitalize="off"
              errorText={
                submitted && !login.username ? t('usernameRequired') : ''
              }
              onIonInput={(e) =>
                setLogin({ ...login, username: e.detail.value! })
              }
              required
            />

            <IonInput
              label={t('passwordLabel')}
              labelPlacement="stacked"
              fill="solid"
              value={login.password}
              name="password"
              type="password"
              errorText={
                submitted && !login.password ? t('passwordRequired') : ''
              }
              onIonInput={(e) =>
                setLogin({ ...login, password: e.detail.value! })
              }
              required
            />

            <IonRow>
              <IonCol>
                <IonButton type="submit" expand="block">
                  {t('navLogin')}
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton onClick={onSignup} color="light" expand="block">
                  {t('navSignup')}
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default connect<{}, {}, LoginProps>({
  mapDispatchToProps: {
    setIsLoggedIn,
    setUsername,
  },
  component: Login,
});
