import { useState, useEffect } from "react";
import ListaCarreras from "./ListarCarreras";

export default function CarrerasPage(){
    const [carreras, setCarreras] = useState([]);

    useEffect(() => {
        fetch("htpp://127.0.0.1:8000/carreras")
            .then((res) => res.json())
            .then((data) => {
                setCarreras(data);
        })


            .catch((err) => {
                console.error("Error al obtener carreras:", err);
                setCarreras([]);
            });
    }, []);

    return (
        <div>
            <h1>Lista de Carreras</h1>
            <ListaCarreras carreras={carreras} />
        </div>
    );
}