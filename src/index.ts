import './meta.js?userscript-metadata';
import AnilistAnimeSongs from './AnilistAnimeSongs';

new AnilistAnimeSongs().start().catch((e) => {
  console.error('Failed to init AnilistAnimeSongs, aborted.', e);
});
