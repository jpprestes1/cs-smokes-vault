import { type TacticFormData } from './TacticForm';

interface TacticFormManualFieldsProps {
  formData: TacticFormData;
  setFormData: React.Dispatch<React.SetStateAction<TacticFormData>>;
}

export default function TacticFormManualFields({
  formData,
  setFormData,
}: TacticFormManualFieldsProps) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-4 duration-300">
      <label className="flex flex-col gap-1">
        <span className="text-on-surface-variant font-data-label text-xs">TITLE</span>
        <input
          type="text"
          placeholder="Ex: CT Ticket Booth Smoke"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">TYPE</span>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
          >
            <option value="SMOKE">SMOKE</option>
            <option value="FLASH">FLASH</option>
            <option value="MOLOTOV">MOLOTOV</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">SIDE</span>
          <select
            value={formData.side}
            onChange={(e) => setFormData({ ...formData, side: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
          >
            <option value="TERRORIST">TERRORIST</option>
            <option value="COUNTER-TERRORIST">CT</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">COORD X (%)</span>
          <input
            type="number"
            placeholder="Ex: 45"
            value={formData.x}
            onChange={(e) => setFormData({ ...formData, x: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">COORD Y (%)</span>
          <input
            type="number"
            placeholder="Ex: 50"
            value={formData.y}
            onChange={(e) => setFormData({ ...formData, y: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-on-surface-variant font-data-label text-xs">DESCRIPTION</span>
        <textarea
          rows={3}
          placeholder="Lineup instructions..."
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary resize-none rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>
    </div>
  );
}
