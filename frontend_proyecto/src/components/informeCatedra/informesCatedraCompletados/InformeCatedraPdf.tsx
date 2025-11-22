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
    InformeCompletadoDetalle
} from "./InformeCatedraCompletadoDetail";

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
    if (!texto) return ["—"];

    return texto
        .split("\n")
        .map(t => t.trim())
        .filter(t => t !== "")
        .map(t => "• " + t);
}


export default function InformeCatedraPDF({
    informe,
    categorias,
}: {
    informe: InformeCompletadoDetalle;
    categorias: CategoriaConPreguntas[];
}) {

    const respuestas = informe.respuestas_informe;

    const getRespuestaDe = (preguntaId: number) => {
        const r = respuestas.find(x => x.pregunta.id === preguntaId);
        return r?.texto_respuesta ?? null;
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

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Año:</Text> {informe.anio}
                    </Text>
                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Periodo:</Text> {informe.periodo}
                    </Text>
                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Actividad Curricular:</Text>{" "}
                        {informe.materiaCodigo} – {informe.materiaNombre}
                    </Text>
                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Docente Responsable:</Text>{" "}
                        {informe.docenteResponsable ?? "—"}
                    </Text>
                    <Text style={styles.respuesta}>
                        <Text style={{ fontWeight: "bold" }}>Sede:</Text>{" "}
                        {informe.sede ?? "—"}
                    </Text>
                </View>
            </Page>


            {categorias.map((cat) => (
                <Page key={cat.id} size="A4" style={styles.page}>

                    <Text style={styles.sectionTitle}>
                        {cat.cod} — {cat.texto}
                    </Text>

                    {cat.preguntas.map((pregunta) => {
                        const texto = getRespuestaDe(pregunta.id);
                        const lineas = formatRespuesta(texto);

                        return (
                            <View key={pregunta.id}>
                                <Text style={styles.pregunta}>
                                    {pregunta.enunciado}
                                </Text>

                                {lineas.map((l, i) => (
                                    <Text key={i} style={styles.respuesta}>
                                        {l}
                                    </Text>
                                ))}

                                <View style={styles.separator} />
                            </View>
                        );
                    })}
                </Page>
            ))}
        </Document>
    );
}
