import React from "react";

const autoExpand = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
};

interface CommonProps { label: string | null; error?: boolean; }

export function CampoTextArea({ 
    label,
    value, 
    onChange, 
    error }: CommonProps & { value: string; onChange?: (v: string) => void; }) {
    return (
        <div className="col-12">
            {label && <label className="form-label">{label}</label>}
            <textarea
                className={`form-control ${error ? "is-invalid" : ""}`}
                rows={2}
                value={value || ""}
                onChange={(e) => { onChange?.(e.target.value); autoExpand(e); }}
                onInput={autoExpand}
                style={{ resize: "none" }}
            />
            {error && <div className="invalid-feedback">No puede dejar este campo vacío. Ingrese información para continuar.</div>}
        </div>
    );
}

export function CampoTextoNumero({ label, value, onChange, error }: CommonProps & { value: number; onChange: (v: number) => void; }) {
    return (
        <div className="col-md-4">
            <label className="form-label">{label}</label>
            <input
                type="number"
                className={`form-control ${error ? "is-invalid" : ""}`}
                min={0}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
             {error && <div className="invalid-feedback">Requerido.</div>}
        </div>
    );
}

export function CampoPorcentaje({ label, value, onChange, error }: CommonProps & { value: number | null; onChange: (v: number | null) => void; }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") { onChange(null); return; }
        const num = Number(val);
        onChange(num > 100 ? 100 : num < 0 ? 0 : num);
    };
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="number"
                className={`form-control ${error ? "is-invalid" : ""}`}
                min={0} max={100}
                value={value === null ? "" : value}
                onChange={handleChange}
                placeholder="Ej: 80"
            />
             {error && <div className="invalid-feedback">Requerido.</div>}
        </div>
    );
}

export function CampoTexto({ label, value, readOnly = false, onChange, error }: CommonProps & { value: string; readOnly?: boolean; onChange?: (v: string) => void; }) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="text"
                className={`form-control ${error ? "is-invalid" : ""}`}
                value={value || ""}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
            />
             {error && <div className="invalid-feedback">Requerido.</div>}
        </div>
    );
}

export function CampoCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void; }) {
    return (
        <td className="text-center" style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', userSelect: 'none' }} onClick={() => onChange(!checked)}>
            {checked ? 'X' : '-'}
        </td>
    );
}