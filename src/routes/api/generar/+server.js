import { json } from '@sveltejs/kit';
import { GROQ_API_KEY } from '$app/env/private';
import Groq from 'groq-sdk';
import dns from 'node:dns';

if (dns.setDefaultResultOrder) {
	dns.setDefaultResultOrder('ipv4first');
}


// Registro de memoria de elementos ya usados para impedir repeticiones
/** @type {{ preguntas: string[], versiculos: string[], temas: string[] }} */
const historyUsed = {
	preguntas: [],
	versiculos: [],
	temas: []
};

// Facetas de Auto-Identificación e Introspección Femenina (12 dimensiones humanas reales)
const ENFOQUES = [
	'LA PACIENCIA Y EL PERDÓN SILENCIOSO: la mujer que elige no pagar con la misma moneda, que desactiva discusiones con una palabra blanda y decide guardar su paz antes que tener la razón (Proverbios 15:1, Efesios 4:31-32, Colosenses 3:13)',
	'LA AUTO-EXIGENCIA Y LA COMPASIÓN: la mujer perfeccionista que suele ser comprensiva con los errores de todo el mundo pero implacable consigo misma, necesitando recordar que no tiene que ser perfecta para ser amada (Salmos 103:13-14, 2 Corintios 12:9, Romanos 8:1)',
	'EL DON DE CREAR HOGAR Y CALMA: la mujer cuya sola presencia, orden y atención a los detalles convierte un espacio frío en un refugio cálido donde otros encuentran descanso (Proverbios 14:1, Lucas 10:38-42, Salmos 128:3)',
	'LA VALENTÍA DISCRETA Y RESUELTA: la mujer que toma decisiones difíciles sin hacer ruido, que no busca protagonismo pero sostiene proyectos y familias con una determinación inquebrantable (Josué 1:9, Proverbios 31:25, Rut 1:16-17)',
	'LA EMPATÍA QUE ESCUCHA Y SANA: la mujer con la que otros se desahogan porque no juzga, cuya mirada y silencio respetuoso son un bálsamo para quienes la rodean (Gálatas 6:2, 1 Tesalonicenses 5:11, Proverbios 12:25)',
	'EL TIEMPO PARA SÍ MISMA Y EL DESCANSO: la mujer que siempre pone las necesidades de los demás en primer lugar en su agenda y hoy necesita el permiso sagrado de detenerse y cuidarse a sí misma (Marcos 6:31, Mateo 11:28, Salmos 23:2-3)',
	'LA FE CONSTANTE EN MEDIO DE LA INCERTIDUMBRE: la mujer que ora en secreto cuando no sabe qué pasará mañana, sembrando confianza y serenidad en su entorno (Filipenses 4:6-7, Hebreos 11:1, Salmos 46:1-5)',
	'LA GENEROSIDAD SIN CONDICIONES: la mujer que comparte lo que tiene, su tiempo, su comida o sus consejos con manos abiertas y corazón noble (Proverbios 11:25, Lucas 6:38, 2 Corintios 9:7-8)',
	'LA INTELIGENCIA Y EL BUEN JUICIO: la mujer prudente cuya sabiduría práctica y discernimiento han evitado errores y guiado a los suyos por caminos seguros (Proverbios 3:13-18, Santiago 3:17, 1 Samuel 25:32-33)',
	'LA AUTENTICIDAD Y EL VALOR INTRÍNSECO: la mujer que hoy necesita recordar que su valor no se mide por lo que produce ni por la aprobación ajena, sino por la dignidad divina que habita en ella (Sofonías 3:17, Cantares 4:7, Salmos 139:13-16)',
	'LA CAPACIDAD DE VOLVER A EMPEZAR: la mujer resiliente que ha sabido reinventarse con gracia y elegancia después de tropiezos o cambios de planes, sin perder la dulzura (Isaías 43:18-19, Lamentaciones 3:22-23, Salmos 30:5)',
	'LA ALEGRÍA QUE CONTAGIA VIDA: la mujer cuya risa sincera y sentido del humor aligera los días grises y recuerda a los demás que la vida es un regalo para disfrutar (Proverbios 17:22, Nehemías 8:10, Salmos 126:2)'
];

let callCounter = 0;

/** @param {{ request: Request }} event */
export async function POST({ request }) {
	/** @type {Record<string, any>} */
	let body = {};
	try {
		body = await request.json();
	} catch {
		body = {};
	}

	const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : 'Amada mujer';

	const groqApiKey = GROQ_API_KEY || (typeof process !== 'undefined' ? process.env?.GROQ_API_KEY : undefined);

	if (!groqApiKey) {
		console.error('[API /api/generar] GROQ_API_KEY no encontrada en env');
		return json({ error: 'Falta configurar GROQ_API_KEY' }, { status: 500 });
	}

	try {
		const groq = new Groq({ apiKey: groqApiKey });
		callCounter++;

		// Filtrar los enfoques que no se hayan usado en las últimas 6 llamadas para garantizar variedad total
		const ultimosTemas = historyUsed.temas.slice(-6);
		const enfoquesDisponibles = ENFOQUES.filter(e => !ultimosTemas.some(t => e.startsWith(t)));
		const listaSeleccion = enfoquesDisponibles.length > 0 ? enfoquesDisponibles : ENFOQUES;
		
		// Selección pseudo-aleatoria rotativa
		const indiceSeleccionado = Math.floor(Math.random() * listaSeleccion.length);
		const enfoqueActual = listaSeleccion[indiceSeleccionado];
		const identificadorTema = enfoqueActual.split(':')[0];
		historyUsed.temas.push(identificadorTema);

		// Lista de pasajes y preguntas ya generados en llamadas previas
		const ultimasPreguntas = historyUsed.preguntas.slice(-15);
		const ultimosVersiculos = historyUsed.versiculos.slice(-20);

		const exclusionPrompt = (ultimosVersiculos.length > 0)
			? `REGLA ESTRICTA DE ORIGINALIDAD Y NO REPETICIÓN:
- ESTÁ TERMINANTEMENTE PROHIBIDO volver a usar estos versículos/pasajes ya mostrados: ${ultimosVersiculos.join(', ')}.
- DEBES usar un versículo o libro bíblico TOTALMENTE DISTINTO.
- NINGUNA pregunta debe parecerse temáticamente ni en redacción a las anteriores: ${ultimasPreguntas.map(p => `"${p.slice(0, 40)}..."`).join('; ')}.`
			: '';

		const systemPrompt = `Eres un ser querido sabio, tierno y profundamente espiritual. Tu voz es como un bálsamo que llena el corazón de una mujer de ligereza, descanso, felicidad y asombro por lo especial que es.

REGLAS ESENCIALES PARA QUE SE SIENTA PLENA Y FELIZ:
1. BREVEDAD Y CONCISIÓN OBLIGATORIA (MUY IMPORTANTE):
   - "pregunta": MÁXIMO 20 A 25 PALABRAS (1 a 2 líneas cortas). Nada de oraciones interminables con comas y rodeos. Una sola idea clara que vaya directo al corazón.
   - "mensaje": MÁXIMO 40 A 50 PALABRAS (2 oraciones directas). Debe leerse en 10 segundos con total comodidad en una pantalla de celular. Cero párrafos gigantes.
2. PROHIBIDO RECORDAR PESADEZ, DOLOR O FATIGA:
   - PROHIBIDO usar palabras como: "carga", "pesado", "camino difícil", "desvelo", "lágrimas", "luchar", "aguantar", "sufrir". No le recuerdes el cansancio.
   - Dale LIGEREZA, DESCANSO, DULZURA Y GOZO. Haz que sienta que sus hombros caen en alivio y que su pecho se llena de paz.
3. CIERRE DE BENDICIÓN:
   - La segunda frase del mensaje debe ser una bendición de retorno: que el amor y la paz que ella da vuelva a su vida multiplicada.
4. LENGUAJE HUMANO, CERCANO Y POÉTICO:
   - Español moderno, claro, dulce y sin adornos innecesarios.

ESTRUCTURA DE LOS CAMPOS:
1. "pregunta": Una VERDADERA PREGUNTA DE INTROSPECCIÓN (máximo 20 a 25 palabras):
   - PROHIBIDO EMPEZAR CON SUGERENCIAS O CONSEJOS tipo: "¿Qué tal si...", "¿Por qué no...", "¿Qué pasaría si hoy sueltas...". Eso NO es una pregunta reflexiva, es un consejo con signos de interrogación.
   - Debe ser una PREGUNTA DE AUTO-OBSERVACIÓN que le haga notar una contradicción real de su vida:
     * El contraste entre cómo trata a los demás y cómo se trata a sí misma:
       ej: "¿Te has dado cuenta de lo fácil que te resulta perdonar a los demás y lo mucho que te cuesta perdonarte a ti misma?"
     * La dificultad de recibir amor:
       ej: "¿Por qué te cuesta tanto dejarte cuidar y recibir ayuda, cuando tú eres la primera en dar la mano sin dudar?"
     * La autocrítica frente a su amor:
       ej: "Si te miraras hoy con los mismos ojos de ternura con los que miras a quienes más amas, ¿qué te dirías a ti misma?"
     * La prisa de la vida vs su propio ser:
       ej: "¿Cuándo fue la última vez que hiciste algo solo por el gusto de disfrutarlo, sin sentir la culpa de tener que ser productiva?"
     * La voz interior:
       ej: "¿Te has detenido a escuchar cómo te hablas a ti misma cuando nadie te ve, y si le hablarías así a tu mejor amiga?"

2. "mensaje": La respuesta amorosa de Dios a esa pregunta (exactamente 2 oraciones, máximo 45 palabras):
   - Oración 1: La respuesta de gracia y alivio que desactiva esa exigencia (Dios te ama completa y en paz, sin que tengas que demostrarle nada a nadie).
   - Oración 2: Bendición hermosa de retorno (Que toda la generosidad y el cariño que das a otros regrese hoy a tu vida multiplicado en salud, descanso y risas).

3. "versiculo": Cita bíblica de descanso, gracia, amor y paz interior (ej: Mateo 11:28, Salmos 103:13-14, Sofonías 3:17, Juan 14:27, Romanos 8:1).

4. "cita": El texto del versículo bíblico en palabras claras, dulces y consoladoras.

TEMA PARA ESTA CARTA:
${enfoqueActual}.

${exclusionPrompt}

Devuelve EXCLUSIVAMENTE este JSON válido (SIN título):
{
  "pregunta": "¿...",
  "mensaje": "...",
  "versiculo": "...",
  "cita": "..."
}`;

		const completion = await groq.chat.completions.create({
			model: 'qwen/qwen3.8-27b',
			messages: [
				{ role: 'system', content: systemPrompt },
				{
					role: 'user',
					content: `Genera una tarjeta reflexiva de bendición totalmente nueva e irrepetible para ${nombre}. Semilla aleatoria: ${Date.now()}_${Math.random()}`
				}
			],
			temperature: 0.95, // Alta creatividad para evitar respuestas iguales
			top_p: 0.9,
			max_tokens: 500,
			response_format: { type: 'json_object' }
		});

		const rawContent = completion.choices[0]?.message?.content;
		if (!rawContent) {
			throw new Error('La IA no devolvió contenido');
		}

		const parsed = JSON.parse(rawContent);

		const preguntaFinal = (parsed.pregunta || '').trim();
		const versiculoFinal = (parsed.versiculo || '').trim();

		// Guardar en el historial de exclusión para que la siguiente llamada nunca lo repita
		if (preguntaFinal) {
			historyUsed.preguntas.push(preguntaFinal);
		}
		if (versiculoFinal) {
			historyUsed.versiculos.push(versiculoFinal);
		}

		return json({
			pregunta: preguntaFinal,
			mensaje: (parsed.mensaje || parsed.texto || '').trim(),
			versiculo: versiculoFinal,
			cita: (parsed.cita || '').trim(),
			fuente: 'groq_ai'
		});
	} catch (err) {
		console.error('Error al llamar a Groq:', err);
		return json({ error: 'Error generando mensaje con IA', detalle: String(err) }, { status: 500 });
	}
}
