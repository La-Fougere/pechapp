import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { homeOutline, bookOutline, settingsOutline } from 'ionicons/icons';
import Home from './Home';
import Legislation from './Legislation';
import Settings from './Settings';
import Species from './Species';
import About from './About';
import { useTranslation } from '../i18n';

interface MainTabsProps {}

const MainTabs: React.FC<MainTabsProps> = () => {
  const { t } = useTranslation();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/tabs" to="/tabs/home" />
        {/*
          Using the render method prop cuts down the number of renders your components will have due to route changes.
          Use the component prop when your component depends on the RouterComponentProps passed in automatically.
        */}
        <Route path="/tabs/home" render={() => <Home />} exact={true} />
        <Route
          path="/tabs/legislation"
          render={() => <Legislation />}
          exact={true}
        />
        <Route path="/tabs/settings" render={() => <Settings />} exact={true} />
        <Route path="/tabs/species" render={() => <Species />} exact={true} />
        <Route path="/tabs/about" render={() => <About />} exact={true} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>{t('navHome')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="legislation" href="/tabs/legislation">
          <IonIcon icon={bookOutline} />
          <IonLabel>{t('navLegislation')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/tabs/settings">
          <IonIcon icon={settingsOutline} />
          <IonLabel>{t('navSettings')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
