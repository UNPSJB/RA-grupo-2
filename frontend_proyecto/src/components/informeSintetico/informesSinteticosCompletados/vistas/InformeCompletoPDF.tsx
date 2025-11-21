import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import type { Pregunta, RespuestaInformeSintetico } from "../../../../types/types";


const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 11,
        fontFamily: "Helvetica",
        lineHeight: 1.5,
    },
    title: {
        fontSize: 18,
        marginBottom: 15,
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 14,
        marginTop: 20,
        marginBottom: 8,
        fontWeight: "bold",
    },
    pregunta: {
        fontSize: 12,
        marginBottom: 5,
        fontWeight: "bold",
    },
    respuesta: {
        fontSize: 11,
        marginBottom: 10,
    },
    separator: {
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        borderBottomStyle: "solid",
    },
});


function prettyFormatRespuesta(texto: string): string[] {
    if (!texto) return ["—"];

    let obj;
    try {
        obj = JSON.parse(texto);
    } catch {
        return texto.split("\n");
    }

    const lines: string[] = [];


    // 0) INFORMACIÓN GENERAL 
    if (obj.cant_alumnos !== undefined) {
        lines.push(`Cantidad de alumnos: ${obj.cant_alumnos}`);
        lines.push(`Comisiones teóricas: ${obj.cant_comisiones_t}`);
        lines.push(`Comisiones prácticas: ${obj.cant_comisiones_p}`);
        return lines;
    }

    // 1) BIBLIOGRAFÍA Y EQUIPAMIENTO
    if (obj.bibliografia || obj.equipamiento) {
        if (obj.bibliografia) {
            lines.push("Bibliografía:");
            obj.bibliografia.split("\n").forEach((l) => lines.push("• " + l));
            lines.push("");
        }
        if (obj.equipamiento) {
            lines.push("Equipamiento:");
            obj.equipamiento.split("\n").forEach((l) => lines.push("• " + l));
        }
        return lines;
    }

    // 2) PORCENTAJE DE HORAS
    if (obj.porcentaje_teoricas !== undefined) {
        lines.push(`Porcentaje de horas teóricas dictadas: ${obj.porcentaje_teoricas}%`);
        lines.push(`Porcentaje de horas prácticas dictadas: ${obj.porcentaje_practicas}%`);
        if (obj.justificacion) {
            lines.push(`Justificación: ${obj.justificacion}`);
        }
        return lines;
    }

    // 2.A) PORCENTAJE DE CONTENIDOS
    if (obj.porcentaje !== undefined) {
        lines.push(`Porcentaje de contenidos alcanzados: ${obj.porcentaje}%`);

        if (obj.estrategias) {
            lines.push("Estrategias para próximos dictados:");
            obj.estrategias.split("\n").forEach((l) => lines.push("• " + l));
        }
        return lines;
    }

    // 2.B) ENCUESTAS A ALUMNOS
    if (obj.encuesta_B !== undefined) {
        lines.push(`Comunicación y desarrollo (B): ${obj.encuesta_B}`);
        lines.push(`Metodología (C): ${obj.encuesta_C}`);
        lines.push(`Evaluación (D): ${obj.encuesta_D}`);
        lines.push(`Actuación Equipo Teórico (ET): ${obj.encuesta_ET}`);
        lines.push(`Actuación Equipo Práctico (EP): ${obj.encuesta_EP}`);
        if (obj.juicio_valor) {
            lines.push(`Juicio de valor: ${obj.juicio_valor}`);
        }
        return lines;
    }

    // 2.C) ASPECTOS POSITIVOS / OBSTÁCULOS / ESTRATEGIAS
    if (obj.aspectos_positivos_ensenanza !== undefined) {
        lines.push("Aspectos positivos (enseñanza):");
        obj.aspectos_positivos_ensenanza.split("\n").forEach((l) => lines.push("• " + l));

        lines.push("");
        lines.push("Aspectos positivos (aprendizaje):");
        obj.aspectos_positivos_aprendizaje.split("\n").forEach((l) => lines.push("• " + l));

        lines.push("");
        lines.push("Obstáculos (enseñanza):");
        obj.obstaculos_ensenanza.split("\n").forEach((l) => lines.push("• " + l));

        lines.push("");
        lines.push("Obstáculos (aprendizaje):");
        obj.obstaculos_aprendizaje.split("\n").forEach((l) => lines.push("• " + l));

        lines.push("");
        lines.push("Estrategias a implementar:");
        obj.estrategias.split("\n").forEach((l) => lines.push("• " + l));

        return lines;
    }

    // 4) VALORACIÓN DE AUXILIARES
    if (Array.isArray(obj) && obj.length > 0 && obj[0].calificacion !== undefined) {
        return obj.flatMap((aux: any) => {
            const out: string[] = [];

            out.push(`${aux.nombre} — Calificación: ${aux.calificacion}`);

            if (aux.justificacion) {
                out.push(`Justificación: ${aux.justificacion}`);
            }

            out.push("");
            return out;
        });
    }

    // 3) ACTIVIDADES DOCENTES
    if (Array.isArray(obj) && obj.length > 0 && obj[0].actividades !== undefined) {
        return obj.flatMap((doc: any) => {
            const act = doc.actividades || {};

            const out: string[] = [];

            out.push(`${doc.nombre_docente} — ${doc.rol_docente}`);

            out.push(`  Capacitación: ${act.capacitacion ?? "—"}`);
            out.push(`  Investigación: ${act.investigacion ?? "—"}`);
            out.push(`  Extensión: ${act.extension ?? "—"}`);
            out.push(`  Gestión: ${act.gestion ?? "—"}`);

            if (act.observaciones) {
                out.push(`  Observaciones: ${act.observaciones}`);
            }

            out.push("");
            return out;
        });
    }

    // 5) OBSERVACIONES FINALES (sección 5)
    if (obj.observaciones_comentarios !== undefined) {
        obj.observaciones_comentarios.split("\n").forEach((l) => lines.push(l));
        return lines;
    }

    // DEFAULT: mostrar cada campo del JSON
    Object.entries(obj).forEach(([key, value]) => {
        lines.push(`${key}: ${value}`);
    });

    return lines;
}



export default function InformeSinteticoPDF({
    titulo,
    preguntas,
    respuestas,
}: {
    titulo: string;
    preguntas: Pregunta[];
    respuestas: RespuestaInformeSintetico[];
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{titulo}</Text>

                {preguntas.map((p) => {
                    const respuestasDeLaPregunta = respuestas.filter(
                        (r) => r.pregunta_id === p.id
                    );

                    return (
                        <View key={p.id}>
                            <Text style={styles.sectionTitle}>
                                {p.cod} - {p.enunciado}
                            </Text>

                            {respuestasDeLaPregunta.length === 0 ? (
                                <Text style={styles.respuesta}>— Sin respuesta —</Text>
                            ) : (
                                respuestasDeLaPregunta.map((r) => {
                                    let texto = "—";
                                    try {
                                        if (r.texto_respuesta) {
                                            const parsed = JSON.parse(r.texto_respuesta);
                                            texto = JSON.stringify(parsed, null, 2);
                                        }
                                    } catch {
                                        texto = r.texto_respuesta || "—";
                                    }

                                    return (
                                        <View key={r.id}>
                                            {r.materia ? (
                                                <Text style={styles.pregunta}>
                                                    {r.materia.matricula} - {r.materia.nombre}
                                                </Text>
                                            ) : null}

                                            {prettyFormatRespuesta(texto).map((line, idx) => (
                                                <Text key={idx} style={styles.respuesta}>{line}</Text>
                                            ))}


                                            <View style={styles.separator} />
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    );
                })}
            </Page>
        </Document>
    );
}
