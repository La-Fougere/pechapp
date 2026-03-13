# Pêch'App
**\<ici un superbe slogan>**

**Version Alpha**: https://pechapp.teamgeek.fr

Pêch'App est une application web multi-plateforme qui aide les professionnels à identifier les poissons afin de faire respecter la réglementation. L'app est actuellement en **alpha**: certaines informations restent à vérifier et les fonctionnalités ne sont pas encore définitives.

**Objectif**
Aider les équipes de terrain à reconnaître rapidement une espèce, à vérifier les tailles et périodes, et à réduire les erreurs de conformité.

**Ce que fait l'app**
- Identification par questions (QCM) avec score de probabilité, utilisable hors-ligne.
- Fiches espèces avec habitat, taille, régime, période, réglementation.
- Actualités et rappels réglementaires (contenu interne, à valider).
- Mode hors-ligne via cache local et service worker.
- Interface FR/EN avec onboarding et réglages (langue, mode sombre).

**Données et périmètre**
- Le référentiel actuel couvre 20 espèces (voir `app/src/data/qcm/base_fish_qcm.csv`).
- Les questions d'identification sont définies dans `app/src/data/qcm/fish_qcm_questions.json`.

**Limites (alpha)**
- Identification par photo non disponible, prévue dans la roadmap.
- Données réglementaires indicatives: à recouper avec les sources officielles.
- Pas de backend pour le moment (pas d'historique centralisé).

**Roadmap**
- Identification IA par photo.
- Synchronisation réglementaire avec sources officielles.
- Mettre en place la page support.
- Backend pour historique des recherches, statistiques et audit.

**Idées pour plus tard**
- Export des observations (CSV/PDF) pour rapports terrain ?
- Rôles et profils (agent, superviseur) + contrôles de validation ?

**Tech stack**
- Ionic React + TypeScript
- Vite
- Capacitor (packaging mobile si nécessaire)
- Service worker personnalisé pour le cache offline

**Démarrage local**
1. `cd app`
2. `npm install`
3. `npm run ionic:serve -- --host 0.0.0.0 --port 3001 --clearScreen false`
4. Ouvrir `http://localhost:3001`

**Structure rapide**
- `app/src/pages`: écrans (Accueil, Identifier, Espèces, Législation, etc.).
- `app/src/data/qcm`: QCM et dataset espèces.
- `app/public`: assets et service worker (`sw.js`).

**Licence et crédits**
- Licence MIT (voir `app/LICENSE`).
- Projet réalisé avec la participation d'étudiants de l'École 42 et de l'ESPMER.
