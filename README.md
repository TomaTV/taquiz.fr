# 🎯 AQuiz - Test Rapide

## 🚀 Lancement immédiat (Mode DEMO)

```bash
# 1. Installer Firebase
npm install firebase

# 2. Lancer l'app
npm run dev
```

## ✅ Test de l'application

1. Ouvrez http://localhost:3000
2. **Joueur 1** : Entrez "Alice" → "Start Quiz"
3. **Joueur 2** : Ouvrez un nouvel onglet → Entrez "Bob" → "Join Quiz with Code" → Entrez le code
4. **Chaque joueur** clique "Add Questions" et ajoute 2-3 questions 
5. **Alice** (host) clique "🚀 Start Quiz Now!"
6. Tout le monde répond aux questions
7. Voir les résultats !

## 🔄 Architecture corrigée

**Problème résolu** : Maintenant chaque joueur a sa **propre interface** de création de questions qui n'affecte pas les autres.

### Fonctionnement :
- ✅ **Interface séparée** : Quand Bob clique "Add Questions", seul Bob voit l'interface
- ✅ **Questions collaboratives** : Chaque joueur ajoute ses questions indépendamment  
- ✅ **Compilation automatique** : Le host démarre avec toutes les questions mélangées
- ✅ **Mode DEMO** : Fonctionne sans Firebase pour test rapide

### Structure Firebase :
```
sessions/
  ABC123XY/
    state: "waiting"
    players/
      player1: { name: "Alice", isCreator: true }
      player2: { name: "Bob", isCreator: false }
    playerQuestions/
      player1: { questions: ["Question Alice 1", "Question Alice 2"] }
      player2: { questions: ["Question Bob 1", "Question Bob 2"] }
    questions: [...] // Toutes les questions mélangées
    answers/
      player1/
        0: { answer: "Réponse d'Alice", submittedAt: 1234567890 }
```

🎉 **L'app fonctionne maintenant en mode DEMO sans Firebase !**
