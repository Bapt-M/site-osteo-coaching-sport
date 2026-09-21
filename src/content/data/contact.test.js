import { LIEN_RDV } from './contact'

test('la prise de rendez-vous pointe vers Doctolib', () => {
  expect(LIEN_RDV).toBe('https://www.doctolib.fr/osteopathe/furdenheim/emmanuel-krieger')
})
