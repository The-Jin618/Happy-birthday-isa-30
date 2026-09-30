/* =====================================================================
   ÍNDICE
   1. CONFIGURACIÓN (lo que más vas a querer cambiar)
   2. Utilidades y lienzos
   3. Fuegos artificiales (versión minimalista)
   4. Intro: letras "Feliz cumpleaños"
   5. Confeti y pétalos
   6. Cartas
   7. Botones e inicio
   ===================================================================== */

/* ---------- 1. CONFIGURACIÓN ---------- */
// Nombre del festejado. También puedes agregarlo al enlace: index.html?nombre=Ana
const NOMBRE = new URLSearchParams(location.search).get('nombre') || 'Isabella';

// Texto de la intro: una línea por elemento
const LINEAS = ['Feliz', 'Cumpleaños', 'Niña Kwaii'];

// Tiempos de la intro (en milisegundos)
const COHETES_INICIALES = 5;     // cohetes de bienvenida antes de las letras
const INICIO_LETRAS = 1500;      // ms antes de que salga el primer cohete de una letra
const RETRASO_LETRA = 170;       // cada cuánto sale el cohete de cada letra
const ESPERA_FINAL  = 1300;      // cuánto se quedan las letras antes de irse con los globos
const VUELO_GLOBOS  = 5000;      // cuánto dura el ascenso antes de pasar a la escena

// Colores de los fuegos y las letras (pastel)
const COLORES = ['#ffc8dd', '#ffafcc', '#bde0fe', '#d9ccff', '#c9efe2', '#fff3b8', '#ffdcc8'];

// Confeti y pétalos
const COLORES_CONFETI = ['#ffafcc', '#bde0fe', '#d9ccff', '#c9efe2', '#fff3b8', '#ffc8dd', '#ffdcc8'];
const COLORES_PETALO  = ['#f7a8c4', '#ffb3cf', '#f48fb1', '#ffc2d6'];
const CANTIDAD_CONFETI = 80;      // máximo de piezas cayendo a la vez

// ★ CARTAS: aquí escribes tú el contenido. Una línea { ... } por carta.
//   titulo → encabezado de la carta
//   texto  → el mensaje (puedes usar \n para saltos de línea)
//   imagen → ruta de la foto dentro de la carpeta "imagenes/" (déjala '' si no quieres foto)
// Para agregar o quitar cartas, agrega o borra una línea; el número se ajusta solo.
const CARTAS = [
  { titulo: 'Feliz cumpleaños Blo', texto: 'Feliz cumpleaños Isa me da gusto saber que mi amiga favorita el dia de hoy estara feliz por festejar su cumple...', imagen: 'static/img/chiwaka.jpg' },
  { titulo: 'Te quiero mucho blo', texto: 'hace casi 100 dias conoci a la persona que a echo mis dias mas felices desde entonces.',         imagen: 'static/img/molang.jpg' },
  { titulo: 'Mi Mejor amiga', texto: 'Apesar de que no nos conocemos en persona puedo decir que compartimos mismas personalidades jajjaj. ',      imagen: 'static/img/miau2.jpeg' },
  { titulo: 'La unica', texto: 'Me alegro de tener a una amiga como tu Isabella eres mi unica Mejor amiga.',       imagen: 'static/img/miau.jpeg' },
  { titulo: 'Siempre estare para ti', texto: 'Eres de las personas mas importantes para mi y quiero que siempre lo sepas Isa eres la niña mas kwaii que conosco.',    imagen: 'static/img/miau5.jpeg' }
];
const MAX_CARTAS = CARTAS.length;

// Apariencia de las cartas
const COLORES_CARTA = ['#ffd9e6', '#e6dcff', '#d3f3e7', '#ffe5d3', '#fff6c9']; // color de cada carta
const INCLINACION   = [-1.5, 2, -2.5, 1.5, -1];  // grados de giro de cada carta
const DESPLAZAMIENTO = 16;                       // px que se corre cada carta hacia abajo
const ALTO_CARTA = 370;

/* ---------- 2. UTILIDADES Y LIENZOS ---------- */
const REDUCIR = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const azar = (a, b) => a + Math.random() * (b - a);
const elegir = lista => lista[Math.floor(Math.random() * lista.length)];

const fw = $('fw'), c = fw.getContext('2d');   // lienzo de fuegos artificiales
const cf = $('cf'), x = cf.getContext('2d');   // lienzo de confeti
let W, H;

function ajustarTamano() {
  const dpr = devicePixelRatio || 1;
  W = innerWidth; H = innerHeight;
  [fw, cf].forEach(k => {
    k.width = W * dpr; k.height = H * dpr;
    k.style.width = W + 'px'; k.style.height = H + 'px';
  });
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
}
ajustarTamano();
addEventListener('resize', ajustarTamano);

$('ttl').textContent = `¡Felicidades, ${NOMBRE}!`;

/* ---------- 3. FUEGOS ARTIFICIALES ----------
   Cohetes que suben, explotan en chispas y dibujan las letras. */
let cohetes = [], chispas = [], fuegosActivos = false, temporizadores = [];
const despues = (fn, ms) => temporizadores.push(setTimeout(fn, ms));

// Lanza un cohete que sube hasta (tx, ty) y ejecuta "alTerminar" al explotar
function lanzar(tx, ty, alTerminar) {
  const x0 = tx + azar(-40, 40);
  cohetes.push({ x: x0, y: H + 10, x0, tx, ty, t: 0, dur: azar(38, 52), col: elegir(COLORES), alTerminar });
}

// Explosión: chispas en todas direcciones (cambia 30 para más o menos chispas)
function explotar(px, py, col, n = 30) {
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, vel = azar(1, 4.2);
    chispas.push({
      x: px, y: py, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: 1,
      col: Math.random() < .6 ? col : elegir(COLORES)
    });
  }
}

// Bucle de animación de los fuegos
function animarFuegos() {
  if (!fuegosActivos) return;
  // deja una estela borrando un poco en cada cuadro
  c.globalCompositeOperation = 'destination-out';
  c.fillStyle = 'rgba(0,0,0,.22)';
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';

  cohetes = cohetes.filter(r => {
    r.t++;
    const k = 1 - Math.pow(1 - r.t / r.dur, 2);          // sube frenando al final
    r.x = r.x0 + (r.tx - r.x0) * k;
    r.y = H + 10 + (r.ty - H - 10) * k;
    c.fillStyle = r.col; c.beginPath(); c.arc(r.x, r.y, 2.2, 0, 7); c.fill();
    if (r.t >= r.dur) { explotar(r.tx, r.ty, r.col); r.alTerminar && r.alTerminar(); return false; }
    return true;
  });

  chispas = chispas.filter(s => {
    s.x += s.vx; s.y += s.vy; s.vy += .05; s.vx *= .985; s.vida -= .017;
    c.globalAlpha = Math.max(s.vida, 0);
    c.fillStyle = s.col; c.beginPath(); c.arc(s.x, s.y, 2, 0, 7); c.fill();
    return s.vida > 0;
  });
  c.globalAlpha = 1;
  requestAnimationFrame(animarFuegos);
}

/* ---------- 4. INTRO: LETRAS ---------- */
function iniciarIntro() {
  // reinicio (sirve también para "ver otra vez")
  temporizadores.forEach(clearTimeout); temporizadores = []; cohetes = []; chispas = [];
  document.body.classList.remove('day');
  $('stage').classList.remove('show');
  detenerConfeti();
  fw.style.opacity = 1; $('intro').style.opacity = 1; $('skip').style.display = '';

  // construir las letras (una etiqueta <span> por letra)
  const caja = $('intro'); caja.innerHTML = '';
  LINEAS.forEach(texto => {
    const ln = document.createElement('span'); ln.className = 'ln';
    [...texto].forEach(ch => {
      const s = document.createElement('span');
      if (ch === ' ') s.className = 'sp';
      else {
        s.className = 'l'; s.textContent = ch;
        s.style.color = elegir(COLORES);                 // color de la letra
        s.style.setProperty('--c', elegir(COLORES));     // color de su globo
      }
      ln.append(s);
    });
    caja.append(ln);
  });

  fuegosActivos = true; requestAnimationFrame(animarFuegos);
  const letras = [...caja.querySelectorAll('.l')];

  // cohetes de bienvenida (solo decoración)
  for (let i = 0; i < COHETES_INICIALES; i++) {
    despues(() => lanzar(azar(W * .15, W * .85), azar(H * .12, H * .35)), i * 350);
  }

  // un cohete por letra: al explotar, la letra aparece
  letras.forEach((el, i) => despues(() => {
    const r = el.getBoundingClientRect();
    lanzar(r.left + r.width / 2, r.top + r.height / 2, () => el.classList.add('on'));
  }, INICIO_LETRAS + i * RETRASO_LETRA));

  // cuando todas aparecieron: cada letra se va con un globo
  const tLetras = INICIO_LETRAS + letras.length * RETRASO_LETRA + ESPERA_FINAL;
  despues(() => letras.forEach(el => {
    el.style.setProperty('--d', azar(0, 1.4).toFixed(2) + 's');       // retraso al salir
    el.style.setProperty('--r', azar(-25, 25).toFixed(0) + 'deg');    // giro al subir
    el.classList.add('go');
  }), tLetras);

  despues(terminarIntro, tLetras + VUELO_GLOBOS);
}

// Pasa de la intro a la escena principal
function terminarIntro() {
  temporizadores.forEach(clearTimeout); temporizadores = [];
  $('skip').style.display = 'none';
  $('intro').style.opacity = 0; fw.style.opacity = 0;
  document.body.classList.add('day');
  $('stage').classList.add('show');
  iniciarConfeti();
  despues(() => { fuegosActivos = false; }, 1400);
}

/* ---------- 5. CONFETI Y PÉTALOS ---------- */
let piezas = [], confetiActivo = false;

function nuevaPieza(desdeArriba = true) {
  const petalo = Math.random() < .42;               // 42 % pétalos, el resto confeti
  piezas.push({
    petalo, x: azar(0, W), y: desdeArriba ? -20 : azar(-20, H),
    tam: petalo ? azar(9, 15) : azar(6, 11),
    vy: petalo ? azar(.6, 1.3) : azar(1.2, 2.4),    // velocidad de caída
    fase: azar(0, 6.3), vfase: azar(.04, .12),      // vaivén lateral
    amp: petalo ? azar(.6, 1.4) : azar(.3, .9),
    rot: azar(0, 6.3), vrot: azar(-.05, .05),
    col: petalo ? elegir(COLORES_PETALO) : elegir(COLORES_CONFETI)
  });
}

function animarConfeti() {
  if (!confetiActivo) return;
  x.clearRect(0, 0, W, H);
  const limite = REDUCIR ? 25 : CANTIDAD_CONFETI;
  if (piezas.length < limite && Math.random() < .5) nuevaPieza();

  piezas = piezas.filter(p => {
    p.fase += p.vfase; p.y += p.vy; p.x += Math.sin(p.fase) * p.amp; p.rot += p.vrot;
    x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.fillStyle = p.col; x.globalAlpha = .9;
    if (p.petalo) {                                  // pétalo
      x.scale(1, Math.cos(p.fase * .7) * .5 + .6);
      x.beginPath();
      x.moveTo(0, -p.tam);
      x.bezierCurveTo(p.tam, -p.tam * .6, p.tam * .8, p.tam * .6, 0, p.tam);
      x.bezierCurveTo(-p.tam * .8, p.tam * .6, -p.tam, -p.tam * .6, 0, -p.tam);
      x.fill();
    } else {                                         // confeti rectangular
      x.scale(1, Math.cos(p.fase));
      x.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
    }
    x.restore();
    return p.y < H + 30;
  });
  requestAnimationFrame(animarConfeti);
}

function iniciarConfeti() {
  piezas = [];
  for (let i = 0; i < (REDUCIR ? 15 : 50); i++) nuevaPieza(false);
  if (!confetiActivo) { confetiActivo = true; animarConfeti(); }
}
function detenerConfeti() { confetiActivo = false; x.clearRect(0, 0, W, H); }

/* ---------- 6. CARTAS (solo lectura: el contenido sale de CARTAS) ---------- */
const pila = $('stack'), botonMas = $('more');
let cuantas = 0, zTop = 1;

function agregarCarta() {
  if (cuantas >= MAX_CARTAS) return;
  const i = cuantas++, datos = CARTAS[i];
  const carta = document.createElement('div');
  carta.className = 'card';
  carta.style.background = COLORES_CARTA[i % COLORES_CARTA.length];
  carta.style.top = (i * DESPLAZAMIENTO) + 'px';
  carta.style.transform = `rotate(${INCLINACION[i % INCLINACION.length]}deg)`;
  carta.style.zIndex = ++zTop;

  // título
  const titulo = document.createElement('b');
  titulo.textContent = datos.titulo;
  carta.append(titulo);

  // mensaje
  const texto = document.createElement('div');
  texto.className = 'texto'; texto.tabIndex = 0;
  texto.textContent = datos.texto;
  carta.append(texto);

  // foto (si no existe el archivo, el espacio se quita solo)
  if (datos.imagen) {
    const foto = document.createElement('div'); foto.className = 'foto';
    const img = new Image(); img.alt = 'Foto de ' + datos.titulo;
    img.onerror = () => foto.remove();
    img.src = datos.imagen;
    foto.append(img); carta.append(foto);
  }

  // tocar una carta que quedó atrás la trae al frente
  carta.addEventListener('click', () => { carta.style.zIndex = ++zTop; });

  pila.append(carta);
  pila.style.height = (ALTO_CARTA + i * DESPLAZAMIENTO + 30) + 'px';
  actualizarBoton();
}

function actualizarBoton() {
  botonMas.disabled = cuantas >= MAX_CARTAS;
  botonMas.textContent =
    cuantas === 0 ? 'Abrir mi primera carta' :
    cuantas >= MAX_CARTAS ? `Las ${MAX_CARTAS} cartas están abiertas` :
    `Abrir otra carta (${cuantas}/${MAX_CARTAS})`;
}

/* ---------- 7. BOTONES E INICIO ---------- */
botonMas.addEventListener('click', agregarCarta);
$('skip').addEventListener('click', terminarIntro);
$('again').addEventListener('click', iniciarIntro);

actualizarBoton();
iniciarIntro();   // arranca todo al abrir la página





// Musica Astetik
const contenedor = document.getElementById('contenedor-reproductor');
const disco = document.getElementById('reproductor-disco');
const audioDisco = document.getElementById('audio-disco');
const itemsCancion = document.querySelectorAll('.item-cancion');

// 1. Controlar play/pause al hacer clic en el disco principal
disco.addEventListener('click', (e) => {
    e.stopPropagation(); // Evita conflictos en móviles
    
    if (audioDisco.paused) {
        audioDisco.play();
        disco.classList.add('girando');
    } else {
        audioDisco.pause();
        disco.classList.remove('girando');
    }
});

// 2. Cambiar de canción desde el menú
itemsCancion.forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Quitar la clase 'sonando' de todas las canciones
        itemsCancion.forEach(btn => btn.classList.remove('sonando'));
        
        // Añadir la clase 'sonando' a la canción que seleccionamos
        this.classList.add('sonando');

        // Cambiar la ruta del audio y reproducir
        const nuevaCancion = this.getAttribute('data-src');
        audioDisco.src = nuevaCancion;
        audioDisco.play();
        
        // Asegurarnos de que el disco gire
        disco.classList.add('girando');
    });
});

// 3. Soporte para móviles ("Poner el dedo")
// Mostrar el menú al tocar el contenedor
contenedor.addEventListener('touchstart', () => {
    contenedor.classList.add('activo');
});

// Ocultar el menú si se toca cualquier otra parte de la pantalla
document.addEventListener('touchstart', (e) => {
    if (!contenedor.contains(e.target)) {
        contenedor.classList.remove('activo');
    }
});