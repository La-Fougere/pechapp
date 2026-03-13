import React from 'react';
import { RouteComponentProps, withRouter, useLocation } from 'react-router';

import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
} from '@ionic/react';
import {
  homeOutline,
  help,
  informationCircleOutline,
  logIn,
  logOut,
  leafOutline,
  bookOutline,
  person,
  personAdd,
  settingsOutline,
  searchOutline,
} from 'ionicons/icons';

import { connect } from '../data/connect';
import { useTranslation } from '../i18n';

import './Menu.css';

interface Pages {
  title: string;
  path: string;
  icon: string;
  routerDirection?: string;
}
interface StateProps {
  isAuthenticated: boolean;
  menuEnabled: boolean;
}
interface MenuProps extends RouteComponentProps, StateProps {}

const Menu: React.FC<MenuProps> = ({
  isAuthenticated,
  menuEnabled,
}) => {
  const location = useLocation();
  const { t } = useTranslation();

  const routes = {
    appPages: [
      { title: t('navHome'), path: '/tabs/home', icon: homeOutline },
      { title: t('navIdentify'), path: '/identify', icon: searchOutline },
      { title: t('navSpecies'), path: '/tabs/species', icon: leafOutline },
      { title: t('navLegislation'), path: '/tabs/legislation', icon: bookOutline },
    ],
    loggedInPages: [
      { title: t('navAccount'), path: '/account', icon: person },
      { title: t('navSettings'), path: '/tabs/settings', icon: settingsOutline },
      { title: t('navSupport'), path: '/support', icon: help },
      { title: t('navLogout'), path: '/logout', icon: logOut },
    ],
    loggedOutPages: [
      { title: t('navLogin'), path: '/login', icon: logIn },
      { title: t('navSignup'), path: '/signup', icon: personAdd },
      { title: t('navSettings'), path: '/tabs/settings', icon: settingsOutline },
      { title: t('navSupport'), path: '/support', icon: help },
    ],
  };

  function renderlistItems(list: Pages[]) {
    return list
      .filter((route) => !!route.path)
      .map((p) => (
        <IonMenuToggle key={p.path} auto-hide="false">
          <IonItem
            detail={false}
            routerLink={p.path}
            routerDirection="none"
            className={
              location.pathname.startsWith(p.path) ? 'selected' : undefined
            }
          >
            <IonIcon slot="start" icon={p.icon} />
            <IonLabel>{p.title}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      ));
  }

  return (
    <IonMenu type="overlay" disabled={!menuEnabled} contentId="main">
      <IonContent forceOverscroll={false}>
        <IonList lines="none">
          <IonListHeader>{t('menuConference')}</IonListHeader>
          {renderlistItems(routes.appPages)}
        </IonList>
        <IonList lines="none">
          <IonListHeader>{t('navAccount')}</IonListHeader>
          {isAuthenticated
            ? renderlistItems(routes.loggedInPages)
            : renderlistItems(routes.loggedOutPages)}
        </IonList>
        <IonList lines="none">
          <IonListHeader>{t('menuInfo')}</IonListHeader>
          <IonMenuToggle auto-hide="false">
            <IonItem
              detail={false}
              routerLink="/tabs/about"
              routerDirection="none"
              className={
                location.pathname.startsWith('/tabs/about')
                  ? 'selected'
                  : undefined
              }
            >
              <IonIcon slot="start" icon={informationCircleOutline} />
              <IonLabel>{t('navAbout')}</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default connect<{}, StateProps, {}>({
  mapStateToProps: (state) => ({
    isAuthenticated: state.user.isLoggedin,
    menuEnabled: state.data.menuEnabled,
  }),
  component: withRouter(Menu),
});
