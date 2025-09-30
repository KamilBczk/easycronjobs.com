# Système de Blog - Documentation

## 🎉 Installation complète

Le système de blog a été installé avec succès ! Voici ce qui a été créé :

## 📁 Structure

### Base de données (Prisma)
- **Model `BlogPost`** : Articles de blog avec statut (DRAFT/PUBLISHED)
- **Model `User`** : Ajout du champ `isAdmin` pour gérer les permissions
- **Migration** : `add_blog_system` appliquée avec succès

### Backend (API Routes)
- `POST /api/blog` - Créer un article (admin uniquement)
- `GET /api/blog` - Liste des articles (filtrés selon le statut utilisateur)
- `GET /api/blog/[id]` - Récupérer un article par ID
- `PATCH /api/blog/[id]` - Modifier un article (admin uniquement)
- `DELETE /api/blog/[id]` - Supprimer un article (admin uniquement)
- `GET /api/blog/slug/[slug]` - Récupérer un article par slug
- `GET /api/user/check-admin` - Vérifier le statut admin de l'utilisateur

### Frontend

#### Pages publiques
- `/blog` - Liste des articles publiés
- `/blog/[slug]` - Détail d'un article avec support Markdown

#### Administration (réservé aux admins)
- `/app/admin` - Interface CRUD complète pour gérer les articles
  - Créer/modifier/supprimer des articles
  - Gérer les brouillons et publications
  - Édition Markdown
  - Gestion des tags et images de couverture

### Navigation
- Lien "Blog" ajouté dans le header de la landing page
- Onglet "Blog Admin" ajouté dans la sidebar (visible uniquement pour les admins)

## 🔐 Permissions

### Utilisateur admin
Pour rendre un utilisateur admin, mettez à jour la base de données :

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'votre@email.com';
```

### Accès
- ✅ **Public** : Peut voir les articles PUBLISHED sur `/blog`
- ✅ **Admin** : Peut tout voir et gérer via `/app/admin`
- ❌ **Non-admin** : Ne voit pas l'onglet "Blog Admin"

## 📝 Fonctionnalités

### Articles
- **Titre** : Titre de l'article
- **Slug** : URL-friendly (auto-généré depuis le titre)
- **Extrait** : Court résumé pour la liste
- **Contenu** : Markdown complet avec support de la syntaxe
- **Image de couverture** : URL de l'image principale
- **Tags** : Catégorisation par tags
- **Statut** : DRAFT ou PUBLISHED
- **Vues** : Compteur automatique

### Interface admin
- Tableau avec tous les articles
- Boutons d'action rapide (modifier/supprimer)
- Dialog modal pour créer/modifier
- Génération automatique des slugs
- Validation des champs

### Interface publique
- Design cohérent avec la landing page
- Cards responsive avec hover effects
- Affichage des tags, auteur, date, vues
- Support complet Markdown avec syntaxe highlighting
- Navigation fluide

## 🚀 Utilisation

1. **Devenir admin** (une seule fois) :
```bash
# Dans psql ou un client PostgreSQL
UPDATE "User" SET "isAdmin" = true WHERE email = 'votre@email.com';
```

2. **Créer un article** :
- Se connecter avec un compte admin
- Aller sur `/app/admin`
- Cliquer sur "Nouvel article"
- Remplir le formulaire (Markdown supporté)
- Choisir DRAFT ou PUBLISHED
- Cliquer sur "Créer"

3. **Publier** :
- Les articles DRAFT ne sont visibles que par les admins
- Les articles PUBLISHED sont visibles sur `/blog` par tous

## 📦 Dépendances ajoutées
- `react-markdown` : Rendu du Markdown

## 🗄️ Schéma de la base

```prisma
model User {
  isAdmin    Boolean   @default(false)
  blogPosts  BlogPost[]
  // ... autres champs
}

model BlogPost {
  id          String          @id @default(cuid())
  title       String
  slug        String          @unique
  excerpt     String?         @db.Text
  content     String          @db.Text
  coverImage  String?
  status      BlogPostStatus  @default(DRAFT)
  publishedAt DateTime?
  authorId    String
  author      User            @relation(...)
  tags        String[]        @default([])
  views       Int             @default(0)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum BlogPostStatus {
  DRAFT
  PUBLISHED
}
```

## 💡 Tips

- Les slugs doivent être uniques
- Le Markdown supporte les headers, listes, code blocks, liens, etc.
- Les images de couverture doivent être des URLs complètes
- Les tags sont séparés par des virgules
- Le compteur de vues s'incrémente automatiquement

## 🎨 Personnalisation

Vous pouvez personnaliser :
- Les styles dans les fichiers de page
- Le template de rendu Markdown (prose classes)
- Les permissions (actuellement binary: admin ou non)
- L'affichage des cards sur `/blog`

Bon blogging ! 🚀