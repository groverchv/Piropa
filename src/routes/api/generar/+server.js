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

// Facetas del Bien Sembrado e Impacto Invisible (Cosas buenas que hizo sin darse cuenta y que cambiaron vidas)
const ENFOQUES = [
	'LA PALABRA A TIEMPO QUE SALVÓ UN DÍA: ese consejo o frase de aliento dicha de paso y sin planearlo, que le devolvió la esperanza a alguien que estaba a punto de rendirse (Proverbios 15:23, Proverbios 12:25, Isaías 50:4)',
	'LA PRESENCIA QUE DESACTIVÓ UNA TORMENTA: esa ocasión en que tu sola serenidad y compostura evitaron un conflicto mayor y trajeron calma a un momento tenso sin pedir crédito (Santiago 3:17-18, Proverbios 15:1, Mateo 5:9)',
	'EL DETALLE SILENCIOSO QUE FLORECIÓ: un café compartido, un mensaje oportuno o un favor discreto que hiciste con naturalidad y que para otra persona fue el abrazo de Dios que necesitaba (Hebreos 6:10, Mateo 10:42, Gálatas 6:9-10)',
	'EL PERDÓN DISCRETO QUE SANÓ UN VÍNCULO: cuando decidiste no reprochar ni avivar una herida, permitiendo que la armonía volviera a reinar y salvando una relación (Colosenses 3:13, Proverbios 17:9, 1 Pedro 4:8)',
	'LA ESCUCHA ATENTA QUE ALIVIÓ UN CORAZÓN: el tiempo que dedicaste a escuchar a alguien desahogarse sin juzgarlo, convirtiéndote en su refugio seguro sin buscar protagonismo (Gálatas 6:2, Santiago 1:19, Romanos 12:15)',
	'LA GENEROSIDAD SIN EXPECTATIVAS: cuando diste de tu tiempo, de tu comida o de tus recursos con manos abiertas, abriendo puertas de alivio en otra vida (Lucas 6:38, 2 Corintios 9:8, Proverbios 11:25)',
	'EL EJEMPLO QUE INSPIRÓ A OTROS: cuando actuaste con integridad y dulzura en un momento difícil, enseñándole en silencio a alguien cercano cómo mantenerse de pie con fe (Tito 2:7-8, Mateo 5:16, Filipenses 4:8-9)',
	'EL HOGAR Y REFUGIO INVISIBLE: esos pequeños toques de orden, acogida y cuidado con los que hiciste que otros se sintieran amados y seguros a tu lado (Proverbios 14:1, 1 Pedro 4:9, Salmos 128:3)',
	'LA ORACIÓN Y FE EN SECRETO: cuando oraste o deseaste el bien genuino para alguien en silencio, sembrando bendiciones que hoy florecen en sus vidas (Mateo 6:6, Santiago 5:16, 1 Tesalonicenses 5:17)',
	'LA SONRISA QUE DISIPÓ LA SOLEDAD: esa sonrisa sincera o saludo cariñoso que le diste a alguien triste, cambiándole por completo el rumbo de su día (Proverbios 17:22, Proverbios 15:30, Filipenses 2:4)',
	'LA PACIENCIA ANTE LA DEBILIDAD AJENA: cuando tuviste compasión con alguien que falló o estaba ofuscado, dándole espacio para sanar en lugar de juzgarlo (Efesios 4:2, 1 Tesalonicenses 5:14, Romanos 15:1)',
	'EL APOYO QUE SOSTUVO UN SUEÑO: cuando creíste en los anhelos de alguien, lo animaste con tu confianza y fuiste el impulso que necesitaba para continuar (1 Tesalonicenses 5:11, Proverbios 27:17, Eclesiastés 4:9-10)'
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

		const systemPrompt = `Eres un ser querido sabio, tierno y profundamente espiritual. Tu misión es hacerla consciente del inmenso bien invisible que ella ha sembrado en otros sin darse cuenta, llenando su corazón de asombro, gratitud y descanso.

REGLAS ESENCIALES:
1. BREVEDAD Y CONCISIÓN OBLIGATORIA (MUY IMPORTANTE):
   - "pregunta": MÁXIMO 20 A 25 PALABRAS (1 a 2 líneas cortas). Directa, poética y conmovedora.
   - "mensaje": EXACTAMENTE 2 ORACIONES (MÁXIMO 40 A 45 PALABRAS). Directo al corazón, sin párrafos largos.
2. ENFOQUE TEMÁTICO OBLIGATORIO ("EL BIEN QUE HICISTE SIN DARTE CUENTA"):
   - Hazle notar cómo sus actos cotidianos, pequeños detalles o gestos silenciosos provocaron cosas buenas en otros y en su entorno.
   - PROHIBIDO usar palabras de dolor o fatiga como: "carga", "pesado", "camino difícil", "desvelo", "lágrimas", "luchar", "aguantar", "sufrir". Dale ligereza y gozo.
3. CIERRE DE COSECHA Y BENDICIÓN:
   - La segunda frase del mensaje debe bendecirla asegurando que todo ese bien que dio vuelve hoy multiplicado a su vida.
4. LENGUAJE HUMANO, CERCANO Y POÉTICO:
   - Español moderno, dulce, elegante y sin adornos vacíos.

ESTRUCTURA DE LOS CAMPOS:
1. "pregunta": Una PREGUNTA DE ASOMBRO SOBRE SU BONDAD INVISIBLE (máximo 20 a 25 palabras):
   - Debe hacerle notar una huella hermosa que dejó en otros sin planearlo ni pedir crédito.
   - Ejemplos de redacción:
     * "¿Te has puesto a pensar en cuántas veces una palabra tuya, dicha sin planearlo, le devolvió la esperanza a alguien que se sentía vencido?"
     * "¿Cuántas veces tu sola calma evitó una tormenta y le devolvió la paz a tu hogar, sin que tú misma te dieras crédito por ello?"
     * "¿Sabes cuántas sonrisas y decisiones buenas nacieron en otros gracias a un abrazo o un café que compartiste cuando más lo necesitaban?"
     * "¿Te imaginas cuántas personas agradecen a Dios en silencio por tu vida, recordando algo noble que hiciste por ellas sin esperar nada?"
     * "¿Eres consciente de que tu forma serena de amar y perdonar le enseñó a alguien cercano cómo volver a confiar en la vida?"

2. "mensaje": La respuesta amorosa de Dios a esa pregunta (exactamente 2 oraciones, máximo 45 palabras):
   - Oración 1 (Reconocimiento del fruto): Dios vio cada semilla de amor que diste con naturalidad y la hizo florecer en bendición para otros.
   - Oración 2 (Bendición de retorno): Que hoy toda esa bondad y ternura que sembraste regrese a tu corazón multiplicada en salud, serenidad profunda y risas.

3. "versiculo": Cita bíblica de siembra, cosecha, favor y recompensa divina (ej: Hebreos 6:10, Proverbios 11:25, Gálatas 6:9, Salmos 126:5-6, Proverbios 31:31, Mateo 10:42).

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
