import { lienFacebookValide, urlLecteurFacebook, lireSaisieFacebook, hauteurLecteur } from './facebook'
import { test, expect } from 'vitest'

test.each([
  'https://www.facebook.com/osteo/posts/pfbid0abc',
  'https://facebook.com/osteo/posts/123',
  'https://m.facebook.com/story.php?story_fbid=1&id=2',
  'https://web.facebook.com/share/p/1AbCd/',
  '  https://www.facebook.com/osteo/posts/123  ',
])('accepte %s', (lien) => {
  expect(lienFacebookValide(lien)).toBe(true)
})

test.each([
  '',
  '   ',
  'pas un lien',
  'http://www.facebook.com/osteo/posts/123',
  'https://www.facebook.com/',
  'https://facebook.com.pirate.fr/posts/1',
  'https://www.instagram.com/p/abc/',
  'javascript:alert(1)',
  undefined,
  null,
])('refuse %s', (lien) => {
  expect(lienFacebookValide(lien)).toBe(false)
})

test('construit l\'URL du lecteur officiel avec le lien encodé', () => {
  const lien = 'https://www.facebook.com/osteo/posts/123?x=1&y=2'
  const src = urlLecteurFacebook(lien)
  expect(src.startsWith('https://www.facebook.com/plugins/post.php?')).toBe(true)
  const params = new URL(src).searchParams
  expect(params.get('href')).toBe(lien)
  expect(params.get('show_text')).toBe('true')
  expect(params.get('width')).toBe('500')
})

test('retire les espaces autour du lien', () => {
  const src = urlLecteurFacebook('  https://facebook.com/osteo/posts/1 ')
  expect(new URL(src).searchParams.get('href')).toBe('https://facebook.com/osteo/posts/1')
})

test.each([
  [200, '350'],  // bridée au minimum accepté par Facebook
  [800, '500'],  // bridée au maximum
  [undefined, '500'],  // largeur par défaut
])('bride la largeur à ce que Facebook accepte : %s → %s', (largeur, attendu) => {
  const lien = 'https://www.facebook.com/osteo/posts/123'
  const src = largeur === undefined ? urlLecteurFacebook(lien) : urlLecteurFacebook(lien, largeur)
  expect(new URL(src).searchParams.get('width')).toBe(attendu)
})

// Code « Intégrer » tel que Facebook le fournit (⋯ du post → Intégrer).
const PERMALIEN = 'https://www.facebook.com/permalink.php?story_fbid=pfbid0JmhBSNbMaA1R3ygXpHwRYVJDXNFwwe2zCJmGw7bhHyHwubBJBMzpYUAo3ebNbjcLl&id=61584967221133'
const CODE = '<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0JmhBSNbMaA1R3ygXpHwRYVJDXNFwwe2zCJmGw7bhHyHwubBJBMzpYUAo3ebNbjcLl%26id%3D61584967221133&show_text=true&width=500" width="500" height="645" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>'

test('lit le lien du post et la hauteur dans le code d’intégration', () => {
  expect(lireSaisieFacebook(CODE)).toEqual({ lien: PERMALIEN, hauteur: 645 })
})

test('accepte le code d’intégration avec des &amp; échappés', () => {
  expect(lireSaisieFacebook(CODE.replaceAll('&', '&amp;'))).toEqual({ lien: PERMALIEN, hauteur: 645 })
})

test('accepte l’adresse du lecteur seule, sans balise', () => {
  const src = CODE.match(/src="([^"]+)"/)[1]
  expect(lireSaisieFacebook(src)).toEqual({ lien: PERMALIEN, hauteur: null })
})

test('accepte toujours un simple lien de post', () => {
  expect(lireSaisieFacebook('  https://www.facebook.com/osteo/posts/123 '))
    .toEqual({ lien: 'https://www.facebook.com/osteo/posts/123', hauteur: null })
})

test('borne une hauteur farfelue', () => {
  expect(lireSaisieFacebook(CODE.replace('height="645"', 'height="99999"')).hauteur).toBe(1500)
  expect(lireSaisieFacebook(CODE.replace('height="645"', 'height="10"')).hauteur).toBe(200)
})

test.each([
  ['', 'vide'],
  [undefined, 'absent'],
  ['<iframe src="https://pirate.fr/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fosteo%2Fposts%2F1"></iframe>', 'lecteur hors Facebook'],
  ['<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fpirate.fr%2Fx"></iframe>', 'post hors Facebook'],
  ['<iframe src="https://www.facebook.com/plugins/post.php"></iframe>', 'sans href'],
  ['<script>alert(1)</script>', 'script'],
])('refuse une saisie invalide (%s — %s)', (saisie) => {
  expect(lireSaisieFacebook(saisie)).toBeNull()
})

test('hauteur du lecteur : inchangée à 500 px, réduite avec la largeur', () => {
  expect(hauteurLecteur(645, 500)).toBe(645)
  // Mesuré dans Chrome sur un vrai post : 645 px à 500 de large, ~495 px à 350.
  expect(hauteurLecteur(645, 350)).toBe(497)
})
