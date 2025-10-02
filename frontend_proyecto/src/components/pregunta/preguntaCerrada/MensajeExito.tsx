interface Props {
  mensaje: string;
  onClose: () => void;
}

export default function MensajeExito({ mensaje, onClose }: Props) {
  return (
    <div className="alert alert-success d-flex justify-content-between align-items-center">
      <span>{mensaje}</span>
      <button className="btn-close" onClick={onClose}></button>
    </div>
  );
}
