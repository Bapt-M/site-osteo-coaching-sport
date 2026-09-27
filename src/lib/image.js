/** Dimensions après réduction : le plus grand côté ramené à `max`, jamais agrandi. */
export function dimensionsReduites(largeur, hauteur, max = 1600) {
  const ratio = Math.min(1, max / Math.max(largeur, hauteur))
  return { largeur: Math.round(largeur * ratio), hauteur: Math.round(hauteur * ratio) }
}

const versBlob = (canvas, type, qualite) =>
  new Promise(resolve => canvas.toBlob(resolve, type, qualite))

/**
 * Réduit une photo avant l'envoi : une photo de téléphone pèse 5 à 10 Mo,
 * la version réduite 200 à 400 ko. WebP si le navigateur sait l'encoder —
 * Safari renvoie sinon un PNG, bien plus lourd que l'original : on passe
 * alors en JPEG.
 */
export async function reduireImage(fichier) {
  let bitmap
  try {
    bitmap = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
  } catch {
    // Certains navigateurs ignorent l'option `imageOrientation` et lèvent un
    // TypeError plutôt que de simplement l'ignorer : on retente sans elle
    // avant d'abandonner.
    try {
      bitmap = await createImageBitmap(fichier)
    } catch {
      throw new Error('Image illisible')
    }
  }
  const { largeur, hauteur } = dimensionsReduites(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  canvas.getContext('2d').drawImage(bitmap, 0, 0, largeur, hauteur)
  bitmap.close?.()

  const webp = await versBlob(canvas, 'image/webp', 0.82)
  if (webp?.type === 'image/webp') return { blob: webp, extension: 'webp', type: 'image/webp' }
  const jpeg = await versBlob(canvas, 'image/jpeg', 0.85)
  if (!jpeg) throw new Error('Image illisible')
  return { blob: jpeg, extension: 'jpg', type: 'image/jpeg' }
}
