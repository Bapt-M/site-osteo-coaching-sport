import { lienFacebookValide, urlLecteurFacebook } from './facebook'
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
