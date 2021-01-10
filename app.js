
// Labyrinthe Classe
class Labyrinthe {

   // Le constructuer de la classe
   constructor(X, Y) {

      // Les abscisses
      this.N = X;
      this.M = Y;

      // échelle (Scale)
      this.S = 27;

      // Les mouvements
      this.mouvements = 0;

      // La table de jeu
      this.Tableau = new Array(2 * this.N + 1);

      // Element DOM "Canvas"
      this.EL = new Array();
      this.vis = new Array(2 * this.N + 1);

      this.x = 1;

      // Le tableau temp
      this.temp = [];
   }


   // La method de l'initialisation
   init() {
      for (let i = 0; i < 2 * this.N + 1; i++) {
         this.Tableau[i] = new Array(2 * this.M + 1);
         this.vis[i] = new Array(2 * this.M + 1);
      }

      for (let i = 0; i < 2 * this.N + 1; i++) {
         for (let j = 0; j < 2 * this.M + 1; j++) {
            if (!(i % 2) && !(j % 2)) {
               this.Tableau[i][j] = '+';
            } else if (!(i % 2)) {
               this.Tableau[i][j] = '-';
            } else if (!(j % 2)) {
               this.Tableau[i][j] = '|';
            } else {
               this.Tableau[i][j] = ' ';
            }
            this.vis[i][j] = 0;
         }
      }
   }

   // Ajouter les bords 
   ajouterBords() {
      for (let i = 0; i < this.N; i++) {
         for (let j = 0; j < this.M; j++) {
            if (i != this.N - 1) {
               this.EL.push([
                  [i, j],
                  [i + 1, j], 1
               ]);
            }
            if (j != this.M - 1) {
               this.EL.push([
                  [i, j],
                  [i, j + 1], 1
               ]);
            }
         }
      }
   }

   // Hashage
   hashage(e) {
      return e[1] * this.M + e[0];
   }

   // Generer aleatoirement
   aleatoire(EL) {
      for (let i = 0; i < EL.length; i++) {
         let si = Math.floor(Math.random() * 387) % EL.length;
         let tmp = EL[si];
         EL[si] = EL[i];
         EL[i] = tmp;
      }
      return EL;
   }

   // Casser le mur
   casserLeMur(e) {
      let x = e[0][0] + e[1][0] + 1;
      let y = e[0][1] + e[1][1] + 1;
      this.Tableau[x][y] = ' ';
   }

   random(min, max) {
      return (min + (Math.random() * (max - min)));
   }

   ChoixAleatoire(lesChoix) {
      return lesChoix[Math.round(this.random(0, lesChoix.length - 1))];
   }

   // Genere Labyrinthe
   genererLabyrinthe() {
      this.EL = this.aleatoire(this.EL);
      let D = new dsd(this.M * this.M);
      D.init();
      let s = this.hashage([0, 0]);
      let e = this.hashage([this.N - 1, this.M - 1]);
      this.Tableau[1][0] = ' ';
      this.Tableau[2 * this.N - 1][2 * this.M] = ' ';

      // Demarer l'algorithm de Kruskal
      // l'algorithm de Kruskal est dependent de la classe dsd
      for (let i = 0; i < this.EL.length; i++) {
         let x = this.hashage(this.EL[i][0]);
         let y = this.hashage(this.EL[i][1]);
         if (D.find(s) == D.find(e)) {
            if (!(D.find(x) == D.find(s) && D.find(y) == D.find(s))) {
               if (D.find(x) != D.find(y)) {
                  D.union(x, y);
                  this.casserLeMur(this.EL[i]);
                  this.EL[i][2] = 0;
               }

            }
         } else if (D.find(x) != D.find(y)) {
            D.union(x, y);
            this.casserLeMur(this.EL[i]);
            this.EL[i][2] = 0;
         } else {
            continue;
         }
      }

   }

   // Dessiner labyrinthe avec l'element "canvas"
   dessinerLabyrinthe(id) {
      this.canvas = document.getElementById(id);
      let scale = this.S;

      if (this.canvas.getContext) {
         this.ctx = this.canvas.getContext('2d');

         this.Tableau[1][0] = '$'
         for (let i = 0; i < 2 * this.N + 1; i++) {
            for (let j = 0; j < 2 * this.M + 1; j++) {
               if (this.Tableau[i][j] != ' ') {
                  this.ctx.fillStyle = "#6d6d6d";
                  this.ctx.fillRect(scale * i, scale * j, scale, scale);
               } else if (i < 10 && j < 10) {
                  this.temp.push([i, j]);
               }
            }
         }
      }
   }

   // Verifier la position du joueur
   // Le symbol '&' + id c'est l'index du joueur en tableu
   verifierPosition(joueur) {
      for (let i = 0; i < 2 * this.N + 1; i++) {
         for (let j = 0; j < 2 * this.M + 1; j++) {
            if (this.Tableau[i][j] == '&' + joueur.id) {
               return [i, j]
            }
         }
      }
   }

   // Effacer le mouvement
   effacerMouvement(a, b) {
      let scale = this.S;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = "#d8e6c3";
      this.ctx.fillRect(scale * a, scale * b, scale, scale);
      this.Tableau[a][b] = ' '
   }

   deplacer(a, b, joueur) {
      let scale = this.S;
      this.ctx = this.canvas.getContext('2d');
      if (joueur.image) {
         const img = new Image();

         img.src = joueur.image;
         img.onload = () => {
            this.ctx.drawImage(img, scale * a, scale * b, scale, scale);
         };
      } else {
         this.ctx.fillStyle = joueur.couleur;
         this.ctx.fillRect(scale * a, scale * b, scale, scale);
      }

      this.Tableau[a][b] = '&' + joueur.id
   }

   deplacerUp(joueur) {
      let cord = this.verifierPosition(joueur);
      let i = cord[0]
      let j = cord[1]
      j -= 1
      if (j < 0)
         return
      else if (j > 2 * this.M)
         return
      else if (this.Tableau[i][j] == ' ') {
         this.effacerMouvement(i, j + 1);
         this.deplacer(i, j, joueur);
         this.mouvements += 1;
      } else
         return
   }

   deplacerdown(joueur) {
      let cord = this.verifierPosition(joueur);
      let i = cord[0];
      let j = cord[1];
      j += 1;
      if (j < 0) {
         return
      }
         
      else if (j > 2 * this.M) {
         return
      }

      else if (this.Tableau[i][j] == ' ') {
         this.effacerMouvement(i, j - 1);
         this.deplacer(i, j, joueur);
         this.mouvements += 1;
      } else {
         return
      }
         
   }

   deplacerGauche(joueur) {
      let cord = this.verifierPosition(joueur);
      let i = cord[0];
      let j = cord[1];
      i -= 1;
      if (i < 0)
         return
      else if (i > 2 * this.N)
         return
      else if (this.Tableau[i][j] == ' ') {
         this.effacerMouvement(i + 1, j);
         this.deplacer(i, j, joueur);
         this.mouvements += 1;
      } else
         return
   }

   deplacerDroite(joueur) {
      let cord = this.verifierPosition(joueur);
      let i = cord[0];
      let j = cord[1];;
      i += 1;
      if (i < 0)
         return
      else if (i > 2 * this.N)
         return
      else if (this.Tableau[i][j] == ' ') {
         this.effacerMouvement(i - 1, j);
         this.deplacer(i, j, joueur);
         this.mouvements += 1;
      } else
         return
   }

   verifier(joueur) {
      let cord = this.verifierPosition(joueur);
      let i = cord[0];
      let j = cord[1];

      if ((i == 19 && j == 20) || (i == 1 && j == 0)) {
         alert("VOUS AVEZ GAGNÉ, FÉLICITATIONS!");
         window.location.reload();
         return 1
      }
      return 0
   }

   getmouvements() {
      return this.mouvements;
   }
}

class dsd {

   constructor(size) {
      this.N = size;
      this.P = new Array(this.N);
      this.R = new Array(this.N);
   }

   init() {
      for (let i = 0; i < this.N; i++) {
         this.P[i] = i;
         this.R[i] = 0;
      }
   }

   union(x, y) {
      let u = this.find(x);
      let v = this.find(y);
      if (this.R[u] > this.R[v]) {
         this.R[u] = this.R[v] + 1;
         this.P[u] = v;
      } else {
         this.R[v] = this.R[u] + 1;
         this.P[v] = u;
      }
   }

   find(x) {
      if (x == this.P[x])
         return x;
      this.P[x] = this.find(this.P[x]);
      return this.P[x];
   }
}

class Joueur {
   constructor(labyrinthe, type, couleur, image) {
      this.id = Joueur.getId();
      this.labyrinthe = labyrinthe;
      this.type = type;
      this.couleur = couleur;
      this.image = image;
      this.init();
   }

   init() {
      this.dessinerJoueur();
      if (this.type === 'humain' || this.type === 'h') {
         this.evenements();
      }

      // Pour le type d'ennemie 1
      // Il deplace seulement haut et en bas
      if (this.type === 'ennemie1') {

         setInterval(() => {
            const mouvement = Math.ceil(this.labyrinthe.random(0, 2));

            switch (mouvement) {
               case 1:
                  this.labyrinthe.deplacerUp(this);
                  break;
               case 2:
                  this.labyrinthe.deplacerdown(this);
                  break;

               default:
                  break;
            }
         }, 100);
      }

      // Pour le type d'ennemie 2
      // Il deplace seulement haut, en bas, Gauche et droite
      if (this.type === 'ennemie2') {

         setInterval(() => {
            const mouvement = Math.ceil(this.labyrinthe.random(0, 4));

            switch (mouvement) {
               case 1:
                  this.labyrinthe.deplacerUp(this);
                  break;
               case 2:
                  this.labyrinthe.deplacerdown(this);
                  break;
               case 3:
                  this.labyrinthe.deplacerGauche(this);
                  break;
               case 4:
                  this.labyrinthe.deplacerDroite(this);
                  break;

               default:
                  break;
            }
         }, 100);
      }      
   }

   // Dessiner le Joueur
   dessinerJoueur() {
      let canvas = document.getElementById('labyrinthe');
      let ctx = canvas.getContext('2d');

      if (canvas.getContext) {
         let choixDeJoueur = this.labyrinthe.ChoixAleatoire(this.labyrinthe.temp)
         this.labyrinthe.Tableau[choixDeJoueur[0]][choixDeJoueur[1]] = '&' + this.id;

         if (this.image) {
            const img = new Image();

            img.src = this.image;
            img.onload = () => {
               ctx.drawImage(img, this.labyrinthe.S * choixDeJoueur[0], this.labyrinthe.S * choixDeJoueur[1], this.labyrinthe.S, this.labyrinthe.S);
            };
         } else {
            ctx.fillStyle = this.couleur;
            ctx.fillRect(this.labyrinthe.S * choixDeJoueur[0], this.labyrinthe.S * choixDeJoueur[1], this.labyrinthe.S, this.labyrinthe.S);
         }

      }

   }

   // Les evenement de clavier
   evenements() {
      document.addEventListener('keydown', (evt) => {
         let handled = false;
         let enJouant = true;

         if (enJouant) {
            switch (evt.code) {
               case 'ArrowUp':
                  /* La flèche vers le haut a été enfoncée */
                  this.labyrinthe.deplacerUp(this);
                  handled = true
                  break;
               case 'ArrowDown':
                  /* La flèche vers le bas a été enfoncée */
                  this.labyrinthe.deplacerdown(this);
                  handled = true
                  break;
               case 'ArrowLeft':
                  /* La flèche gauche a été enfoncée */
                  this.labyrinthe.deplacerGauche(this);
                  handled = true
                  break;
               case 'ArrowRight':
                  /* La flèche droite a été enfoncée */
                  this.labyrinthe.deplacerDroite(this);
                  handled = true
                  break;
            }
            if (this.labyrinthe.verifier(this)) {
               enJouant = false;
            }

         }

         if (handled) {
            evt.preventDefault();
            
         }
      }, true);
   }

   // Chaque fois un joueur est crée son ID s'incrémente en 1
   // Et pour assinger les coordonnes
   static getId() {
      if (!this.idCount) this.idCount = 0;
      this.idCount += 1;
      return this.idCount;
   }
}