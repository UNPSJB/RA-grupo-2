// Campos.tsx (Modificado)

const autoExpand = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
};

// --- CampoTextArea ---
export function CampoTextArea({
    label,
    value,
    onChange,
    isReadOnly = false, // <-- Nuevo prop
}: {
    label: string|null;
    value: string;
    onChange?: (v: string) => void;
    isReadOnly?: boolean; // <-- Nuevo prop
}) {
    // Si está en modo ReadOnly, mostramos como texto simple en lugar de un <textarea> editable
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
                className="form-control"
                rows={2}
                value={value}
                onChange={
                    (e) => {onChange?.(e.target.value);
                    autoExpand(e);
                }}
                onInput={autoExpand}
                style={{ resize: "none" }}
            />
        </div>
    );
}

// --- CampoTextoNumero ---
export function CampoTextoNumero({
    label,
    value,
    onChange,
    isReadOnly = false, // <-- Nuevo prop
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    isReadOnly?: boolean; // <-- Nuevo prop
}) {
    // Si está en modo ReadOnly, mostramos como texto simple
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
                className="form-control"
                min={0}
                max={10000}
                value={value}
                onChange={(e) => {
                    const num = Number(e.target.value);
                    if (num >= 0) onChange(num);
                }}
            />
        </div>
    );
}

// --- CampoPorcentaje ---
export function CampoPorcentaje({
    label,
    value,
    onChange,
    isReadOnly = false, // <-- Nuevo prop
}: {
    label: string;
    value: number | null;
    onChange: (v: number | null) => void;
    isReadOnly?: boolean; // <-- Nuevo prop
}) {
    // Si está en modo ReadOnly, mostramos como texto simple
    if (isReadOnly) {
        const displayValue = value === null || value === undefined || value === 0 ? '—' : `${value}%`;
        return (
            <div className="col-md-6">
                <label className="form-label fw-bold">{label}</label>
                <p className="form-control-plaintext ps-1 border-bottom">
                    {displayValue}
                </p>
            </div>
        );
    }

    // Lógica de edición existente
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            onChange(null);
            return;
        }
        
        const num = Number(val);
        if (num >= 0 && num <= 100) {
            onChange(num);
        } else if (num > 100) {
            onChange(100);
        } else if (num < 0) {
            onChange(0);
        }
    };

    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="number"
                className="form-control"
                min={0}
                max={100}
                value={value === null ? "" : value} 
                onChange={handleChange}
                placeholder="Ej: 80"
            />
        </div>
    );
}

// --- CampoTexto (ya tenía readOnly) ---
export function CampoTexto({
    label,
    value,
    readOnly = false, // Se renombra a isReadOnly para consistencia, o se mantiene para no romper otros archivos
    onChange,
}: {
    label: string;
    value: string;
    readOnly?: boolean; // Mantener 'readOnly' para consistencia con el uso en <input>
    onChange?: (v: string) => void;
}) {
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <input
                type="text"
                className="form-control"
                value={value}
                readOnly={readOnly} // Aquí usamos el prop readOnly directamente
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}

// --- CampoCheckbox ---
export function CampoCheckbox({
    checked,
    onChange,
    isReadOnly = false, // <-- Nuevo prop
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    isReadOnly?: boolean; // <-- Nuevo prop
}) {
    // Si está en modo ReadOnly, no se permite el evento onClick
    return (
        <td 
            className={`text-center ${!isReadOnly ? 'cursor-pointer' : ''}`} 
            style={{ 
                cursor: !isReadOnly ? 'pointer' : 'default', // Cambiar cursor si es editable
                fontWeight: 'bold', 
                fontSize: '1.2rem',
                userSelect: 'none',
                // Estilo visual si está deshabilitado
                opacity: isReadOnly ? 0.6 : 1, 
            }}
            onClick={() => {
                if (!isReadOnly) {
                    onChange(!checked);
                }
            }}
        >
            {checked ? 'X' : '-'}
        </td>
    );
}