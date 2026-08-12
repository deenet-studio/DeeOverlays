type Props = { checked: boolean; onChange: (value: boolean) => void; label: string }
export function Toggle({ checked, onChange, label }: Props) {
  return <button className={`toggle ${checked ? 'is-on' : ''}`} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
    <span className="toggle-knob" /><span>{checked ? 'Включено' : 'Выключено'}</span><span className="sr-only">: {label}</span>
  </button>
}
