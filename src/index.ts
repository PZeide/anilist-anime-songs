import './meta.js?userscript-metadata';
import UserscriptBootstrapper from './UserscriptBootstrapper';

new UserscriptBootstrapper().start().catch((e) => {
  console.error('Failed to load Anilist Anime Songs bootstrapper, aborting...', e);
});
