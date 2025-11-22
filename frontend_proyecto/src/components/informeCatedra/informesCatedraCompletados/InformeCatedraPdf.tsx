import {
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet
} from "@react-pdf/renderer";

import type {
    CategoriaConPreguntas,
    InformeCompletadoDetalle,
    Opcion
} from "./InformeCatedraCompletadoDetail";

import { mostrarPeriodo } from "./InformeCatedraCompletadoDetail";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 11,
        fontFamily: "Helvetica",
        lineHeight: 1.5,
    },
    logo: {
        width: 90,
        height: 90,
        marginBottom: 10,
        alignSelf: "center",
    },
    titleCenter: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 6,
        fontWeight: "bold",
    },
    subtitleCenter: {
        fontSize: 13,
        textAlign: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
    },
    pregunta: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
    },
    respuesta: {
        fontSize: 11,
        marginBottom: 6,
    },
    separator: {
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        borderBottomStyle: "solid",
    },
});

function formatRespuesta(texto: string | null): string[] {
    if (!texto) return [];
    return texto
        .split("\n")
        .map(t => t.trim())
        .filter(t => t !== "" && t !== "—")
        .map(t => "• " + t);
}

export default function InformeCatedraPDF({
    informe,
    categorias,
    opciones
}: {
    informe: InformeCompletadoDetalle;
    categorias: CategoriaConPreguntas[];
    opciones: Opcion[];
}) {

    const respuestas = informe.respuestas_informe;

    const getResp = (pid: number) => {
        const r = respuestas.find(x => x.pregunta.id === pid);
        if (!r) return { texto: null, opcion: null };
        return { texto: r.texto_respuesta, opcion: r.opcion_id };
    };

    const normalizarEnunciadoCat1 = (e: string) => {
        const low = e.toLowerCase();
        if (low.includes("equip")) return "Equipamiento";
        if (low.includes("bibli")) return "Bibliografía";
        return e;
    };

    const agruparCategoria3 = (preguntas: any[]) => {
        const grupos: Record<string, any[]> = {};

        preguntas.forEach(p => {
            const partes = p.enunciado.split(" - ");
            const etiqueta = partes[0]?.trim();
            const rol = partes[1]?.trim();
            if (!rol) return;

            if (!grupos[rol]) grupos[rol] = [];

            const r = getResp(p.id);
            grupos[rol].push({
                etiqueta,
                respuesta: r.texto
            });
        });

        return grupos;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image src="/unpsjb-logo.png" style={styles.logo} />

                <Text style={styles.titleCenter}>
                    Universidad Nacional de la Patagonia San Juan Bosco
                </Text>
                <Text style={styles.subtitleCenter}>Facultad de Ingeniería</Text>

                <Text style={styles.titleCenter}>Informe de Cátedra</Text>

                <View style={{ marginTop: 25 }}>
                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Sede:</Text>{" "}
                        {informe.sede ?? "—"}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Ciclo Lectivo:</Text>{" "}
                        {informe.anio} - {mostrarPeriodo(informe.periodo)}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Actividad Curricular:</Text>{" "}
                        {informe.materiaNombre ?? "—"}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Código de la actividad curricular:</Text>{" "}
                        {informe.materiaCodigo ?? "—"}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Docente Responsable:</Text>{" "}
                        {informe.docenteResponsable ?? "—"}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Cantidad de alumnos inscriptos:</Text>{" "}
                        {informe.cantidadAlumnos ?? "—"}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Cantidad de comisiones clases teóricas:</Text>{" "}
                        {informe.cantidadComisionesTeoricas ?? "—"}
                    </Text>

                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Cantidad de comisiones clases prácticas:</Text>{" "}
                        {informe.cantidadComisionesPracticas ?? "—"}
                    </Text>
                </View>
            </Page>

            {categorias.map((cat) => (
                <Page key={cat.id} size="A4" style={styles.page}>
                    <Text style={styles.sectionTitle}>
                        {cat.cod} — {cat.texto}
                    </Text>

                    {cat.cod === "3" ? (
                        (() => {
                            const grupos = agruparCategoria3(cat.preguntas);

                            return Object.entries(grupos).map(([rol, items]) => {
                                const itemsConContenido = items.filter(i =>
                                    i.respuesta && i.respuesta.trim() !== "—"
                                );

                                if (itemsConContenido.length === 0) return null;

                                return (
                                    <View key={rol}>
                                        <View style={styles.separator} />
                                        {itemsConContenido.map((item, idx) => {
                                            const lineas = formatRespuesta(item.respuesta);

                                            return (
                                                <View key={idx}>
                                                    <Text style={styles.pregunta}>
                                                        {item.etiqueta} - {rol}
                                                    </Text>
                                                    {lineas.map((l, i) => (
                                                        <Text key={i} style={styles.respuesta}>
                                                            {l}
                                                        </Text>
                                                    ))}
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            });
                        })()
                    ) : (

                        cat.preguntas.map((pregunta) => {
                            let enunciado = pregunta.enunciado;

                            if (cat.cod === "1") {
                                enunciado = normalizarEnunciadoCat1(enunciado);
                            }

                            const { texto, opcion } = getResp(pregunta.id);

                            let contenidoFinal: string[] = [];

                            if (opcion !== null) {
                                const opt = opciones.find(o => o.id === opcion);
                                if (opt) {
                                    contenidoFinal = ["• " + opt.contenido];
                                }
                            } else {
                                contenidoFinal = formatRespuesta(texto);
                            }

                            return (
                                <View key={pregunta.id}>
                                    <View style={styles.separator} />
                                    <Text style={styles.pregunta}>{enunciado}</Text>

                                    {contenidoFinal.length > 0 ? (
                                        contenidoFinal.map((l, i) => (
                                            <Text key={i} style={styles.respuesta}>{l}</Text>
                                        ))
                                    ) : (
                                        <Text style={styles.respuesta}>—</Text>
                                    )}
                                </View>
                            );
                        })
                    )}
                </Page>
            ))}
        </Document>
    );
}
