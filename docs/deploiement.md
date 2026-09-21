# Déploiement : version démo et mise en production

## Les deux environnements

| Branche         | Adresse                                                | Rôle                            |
|-----------------|--------------------------------------------------------|---------------------------------|
| `master`        | https://osteo-et-coaching-du-sport.com                  | Le site officiel                |
| `demonstration` | https://demonstration.osteo-et-coaching-du-sport.com    | Démo à partager pour validation |

Chaque `git push` déclenche le déploiement de la branche correspondante.
La démo porte un en-tête `noindex` : Google ne l'indexera jamais.

> La branche de démo s'appelle `demonstration`, pas `dev` : les sous-domaines
> de branche Netlify suivent le motif imposé `<nom-de-branche>.<domaine>`.
> Renommer la branche renommerait l'URL de démo.

## Travailler puis faire valider

```bash
git switch demonstration
# ... modifications ...
git add -A
git commit -m "description de la modification"
git push
```

Netlify reconstruit la démo en ~1 min. Partagez
https://demonstration.osteo-et-coaching-du-sport.com pour la validation.

## Mettre en ligne une fois validé

```bash
git switch master
git merge demonstration
git push
```

Le site officiel se met à jour. Puis on repart de la branche de démo :

```bash
git switch demonstration
git merge master
```

## Revenir en arrière

Aucune commande : Netlify → *Deploys* → choisir le déploiement précédent →
*Publish deploy*. La remise en ligne est immédiate.

## ⚠️ Ce que la branche `demonstration` n'isole PAS

Les textes modifiés depuis `/admin` sont stockés dans **Supabase, qui est
partagé entre la démo et la production**. Un texte enregistré depuis
`/admin` sur la démo change le site officiel immédiatement.

Sont bien isolés par la branche : le code, le design, les images, les
slides, et tout ce qui vit dans `src/` et `public/`.

Pour isoler aussi les textes, il faudrait un second projet Supabase dédié à
la démo (gratuit, ~15 min de mise en place) — voir `supabase/README.md`.
