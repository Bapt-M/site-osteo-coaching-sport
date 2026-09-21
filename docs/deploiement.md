# Déploiement : version démo et mise en production

## Les deux environnements

| Branche  | Adresse                              | Rôle                          |
|----------|--------------------------------------|-------------------------------|
| `master` | https://osteo-et-coaching-du-sport.com | Le site officiel              |
| `dev`    | `https://dev--<site>.netlify.app`    | Démo à partager pour validation |

Chaque `git push` déclenche le déploiement de la branche correspondante.
La démo porte un en-tête `noindex` : Google ne l'indexera jamais.

## Travailler puis faire valider

```bash
git switch dev
# ... modifications ...
git add -A
git commit -m "description de la modification"
git push
```

Netlify reconstruit la démo en ~1 min. Partagez l'adresse `dev--…` pour
recueillir la validation.

## Mettre en ligne une fois validé

```bash
git switch master
git merge dev
git push
```

Le site officiel se met à jour. Puis on repart de `dev` :

```bash
git switch dev
git merge master
```

## Revenir en arrière

Aucune commande : Netlify → *Deploys* → choisir le déploiement précédent →
*Publish deploy*. La remise en ligne est immédiate.

## ⚠️ Ce que la branche `dev` n'isole PAS

Les textes modifiés depuis `/admin` sont stockés dans **Supabase, qui est
partagé entre la démo et la production**. Un texte enregistré depuis
`/admin` sur la démo change le site officiel immédiatement.

Sont bien isolés par la branche : le code, le design, les images, les
slides, et tout ce qui vit dans `src/` et `public/`.

Pour isoler aussi les textes, il faudrait un second projet Supabase dédié à
la démo (gratuit, ~15 min de mise en place) — voir `supabase/README.md`.
