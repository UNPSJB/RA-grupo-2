import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image
} from "@react-pdf/renderer";
import type { Pregunta, RespuestaInformeSintetico, InformeCompletado, Carrera, Departamento } from "../../../../types/types";


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
    coverTitle: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 20,
    },
    coverSubtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 10,
    },
    coverBlock: {
        marginTop: 15,
        marginBottom: 5,
        fontSize: 12,
    },
    coverText: {
        fontSize: 12,
        marginBottom: 8,
    },
    logo: {
        width: 90,
        height: 90,
        marginBottom: 10,
        alignSelf: "center",
    },
    headerTitle: {
        fontSize: 14,
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 2,
    },
    headerSub: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 15,
    }
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

        const pushList = (titulo: string, texto: string) => {
            lines.push(titulo);
            texto.split("\n").forEach((l) => {
                if (l.trim()) lines.push("• " + l.trim()); // <-- evita puntitos vacíos
            });
            lines.push("");
        };

        pushList("Aspectos positivos (enseñanza):", obj.aspectos_positivos_ensenanza);
        pushList("Aspectos positivos (aprendizaje):", obj.aspectos_positivos_aprendizaje);
        pushList("Obstáculos (enseñanza):", obj.obstaculos_ensenanza);
        pushList("Obstáculos (aprendizaje):", obj.obstaculos_aprendizaje);
        pushList("Estrategias a implementar:", obj.estrategias);

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

        const listaFiltrada = obj.filter((doc: any) => {
            const act = doc.actividades || {};
            return (
                act.capacitacion?.trim() ||
                act.investigacion?.trim() ||
                act.extension?.trim() ||
                act.gestion?.trim() ||
                act.observaciones?.trim()
            );
        });

        // Si nadie tiene actividades → mensaje especial
        if (listaFiltrada.length === 0) {
            return ["Ningún miembro del equipo de cátedra realizó actividades"];
        }

        return listaFiltrada.flatMap((doc: any) => {
            const act = doc.actividades || {};
            const out: string[] = [];

            out.push(`${doc.nombre_docente} — ${doc.rol_docente}`);

            if (act.capacitacion?.trim()) out.push(`Capacitación: ${act.capacitacion}`);
            if (act.investigacion?.trim()) out.push(`Investigación: ${act.investigacion}`);
            if (act.extension?.trim()) out.push(`Extensión: ${act.extension}`);
            if (act.gestion?.trim()) out.push(`Gestión: ${act.gestion}`);
            if (act.observaciones?.trim()) out.push(`Observaciones: ${act.observaciones}`);

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

function getPeriodo(p: string) {
    switch (p) {
        case "PRIMER_CUATRI": return "Primer Cuatrimestre"
        case "SEGUNDO_CUATRI": return "Segundo Cuatrimestre"
    }
}

export default function InformeSinteticoPDF({
    informe,
    carrera,
    dpto,
    preguntas,
    respuestas,
}: {
    informe: InformeCompletado;
    carrera: Carrera;
    dpto: Departamento;
    preguntas: Pregunta[];
    respuestas: RespuestaInformeSintetico[];
}) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image
                    style={styles.logo}
                    src="/unpsjb-logo.png"
                />

                <Text style={styles.headerTitle}>
                    Universidad Nacional de la Patagonia San Juan Bosco
                </Text>
                <Text style={styles.headerSub}>
                    Facultad de Ingeniería
                </Text>

                <Text style={styles.coverTitle}>Informe Sintético</Text>
                <Text style={styles.coverSubtitle}>
                    Síntesis de los Informes Anuales de Actividades Curriculares
                </Text>

                <View style={styles.coverBlock}>
                    <Text style={styles.coverText}>
                        <Text style={{ fontWeight: "bold" }}>Ciclo Lectivo y/o cuatrimestre evaluado: </Text>
                        {getPeriodo(informe.periodo)} {informe.anio}
                    </Text>

                    <Text style={styles.coverText}>
                        <Text style={{ fontWeight: "bold" }}>
                            Comisión Asesora de Carrera o Departamental correspondiente a:{' '}
                        </Text>
                        {dpto?.nombre || "—"}
                    </Text>

                    <Text style={styles.coverText}>
                        <Text style={{ fontWeight: "bold" }}>Sede: </Text>
                        {dpto?.sede?.nombre || "—"}
                    </Text>

                    <Text style={styles.coverText}>
                        <Text style={{ fontWeight: "bold" }}>Carrera: </Text>
                        {carrera?.nombre || "—"}
                    </Text>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.coverText}>
                        El Informe anual Sintético muestra en forma resumida el detalle de las
                        actividades curriculares. Tiene como propósito ofrecer información de las
                        actividades curriculares dependientes de cada departamento, Delegación de
                        Facultad o Secretaría Académica, que permita analizar la evolución de cada
                        espacio curricular dentro de cada dependencia y por sede de Facultad con el fin
                        de realizar un seguimiento y acompañamiento de las propuestas de mejora
                        realizadas por cada equipo docente.
                    </Text>
                </View>

                {preguntas.map((p) => {
                    const respuestasDeLaPregunta = respuestas.filter(
                        (r) => r.pregunta_id === p.id
                    );

                    return (
                        <View key={p.id} break>
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
                                            <View style={styles.separator} />
                                            {r.materia ? (
                                                <Text style={styles.pregunta}>
                                                    {r.materia.matricula} - {r.materia.nombre}
                                                </Text>
                                            ) : null}

                                            {prettyFormatRespuesta(texto).map((line, idx) => (
                                                <Text key={idx} style={styles.respuesta}>{line}</Text>
                                            ))}
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
