import React from "react";

const autoExpand = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
};

interface CommonProps { 
    label: string | null; 
    error?: boolean; 
    isReadOnly?: boolean; 
}

interface CampoTextAreaProps extends CommonProps {
    value: string;
    onChange?: (v: string) => void;
}

export function CampoTextArea({ 
    label,
    value, 
    onChange, 
    error,
    isReadOnly = false
}: CampoTextAreaProps) {
    if (isReadOnly) {
        return (
            <div className="col-12">
                {label && <label className="form-label fw-bold">{label}</label>}
                <p className="form-control-plaintext border p-2 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {value || "— No hay información registrada —"}
                </p>
            </div>
        );
    }
    
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

interface CampoTextoNumeroProps extends CommonProps {
    value: number;
    onChange: (v: number) => void;
}

export function CampoTextoNumero({ 
    label, 
    value, 
    onChange, 
    error,
    isReadOnly = false 
}: CampoTextoNumeroProps) {
    if (isReadOnly) {
        const displayValue = value === null || value === undefined || value === 0 ? '—' : value;
        return (
            <div className="col-md-4">
                <label className="form-label fw-bold">{label}</label>
                <p className="form-control-plaintext ps-1 border-bottom">
                    {displayValue}
                </p>
            </div>
        );
    }
    
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

interface CampoPorcentajeProps extends CommonProps {
    value: number | null;
    onChange: (v: number | null) => void;
}

export function CampoPorcentaje({ 
    label, 
    value, 
    onChange, 
    error,
    isReadOnly = false
}: CampoPorcentajeProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") { onChange(null); return; }
        const num = Number(val);
        onChange(num > 100 ? 100 : num < 0 ? 0 : num);
    };

    if (isReadOnly) {
        const displayValue = value === null || value === undefined ? '—' : `${value}%`;
        return (
            <div className="col-md-6">
                <label className="form-label fw-bold">{label}</label>
                <p className="form-control-plaintext ps-1 border-bottom">
                    {displayValue}
                </p>
            </div>
        );
    }

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

interface CampoTextoProps extends CommonProps {
    value: string;
    readOnly?: boolean;
    onChange?: (v: string) => void;
}

export function CampoTexto({ 
    label, 
    value, 
    readOnly = false, 
    onChange, 
    error,
    isReadOnly: inheritedReadOnly = false
}: CampoTextoProps) {
    
    const effectiveReadOnly = inheritedReadOnly || readOnly;

    if (effectiveReadOnly) {
        return (
            <div className="col-md-6">
                <label className="form-label fw-bold">{label}</label>
                <p className="form-control-plaintext ps-1 border-bottom">
                    {value || '—'}
                </p>
            </div>
        );
    }
    
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="text"
                className={`form-control ${error ? "is-invalid" : ""}`}
                value={value || ""}
                readOnly={effectiveReadOnly}
                onChange={(e) => onChange?.(e.target.value)}
            />
            {error && <div className="invalid-feedback">Requerido.</div>}
        </div>
    );
}

// --- CAMPO CHECKBOX CORREGIDO PARA ACEPTAR Y USAR isReadOnly ---
interface CampoCheckboxProps { 
    checked: boolean; 
    onChange?: (v: boolean) => void;
    isReadOnly?: boolean; 
}

export function CampoCheckbox({ checked, onChange, isReadOnly = false }: CampoCheckboxProps) {
    
    const handleClick = () => {
        // Solo ejecuta onChange si NO está en modo solo lectura
        if (!isReadOnly && onChange) {
            onChange(!checked);
        }
    };

    return (
        <td 
            className="text-center" 
            style={{ 
                cursor: isReadOnly ? 'default' : 'pointer', // Cambia el cursor
                fontWeight: 'bold', 
                fontSize: '1.2rem', 
                userSelect: 'none' 
            }} 
            onClick={handleClick}
        >
            {checked ? 'X' : '—'}
        </td>
    );
}