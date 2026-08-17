import { type TacticFormData } from '../types';

interface TacticFormVideoFieldsProps {
  formData: TacticFormData;
  setFormData: React.Dispatch<React.SetStateAction<TacticFormData>>;
  isManualEntry: boolean;
}

export default function TacticFormVideoFields({
  formData,
  setFormData,
  isManualEntry,
}: TacticFormVideoFieldsProps) {
  return (
    <div
      className={`border-t border-white/10 pt-4 ${!isManualEntry ? 'mt-0 border-t-0 pt-0' : ''}`}
    >
      <label className="flex flex-col gap-1 pb-2">
        <span className="text-on-surface-variant font-data-label text-xs">VIDEO TITLE</span>
        <input
          type="text"
          placeholder="Ex: Smoke rápido CT"
          value={formData.titleVideo}
          onChange={(e) => setFormData({ ...formData, titleVideo: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4 pb-2">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">THROW COORD X (%)</span>
          <input
            type="number"
            placeholder="Ex: 45"
            value={formData.throwX}
            onChange={(e) => setFormData({ ...formData, throwX: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">THROW COORD Y (%)</span>
          <input
            type="number"
            placeholder="Ex: 50"
            value={formData.throwY}
            onChange={(e) => setFormData({ ...formData, throwY: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 pb-4">
        <span className="text-on-surface-variant font-data-label text-xs">
          DIFFICULTY / JUMP TYPE
        </span>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
        >
          <option value="EASY">EASY (Standing)</option>
          <option value="MEDIUM">MEDIUM (Jump Throw)</option>
          <option value="HARD">HARD (Run + Jump Throw)</option>
        </select>
      </label>

      <span className="text-on-surface-variant font-data-label mb-2 block text-xs">
        ATTACH VIDEO
      </span>
      <div className="mb-4 flex gap-2">
        <select
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container w-1/3 rounded border border-white/10 p-2 text-sm outline-none"
        >
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
        <input
          type="text"
          placeholder="URL"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary flex-1 rounded border border-white/10 p-2 text-sm outline-none"
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-on-surface-variant font-data-label text-xs">CREATOR</span>
        <input
          type="text"
          placeholder="Ex: @LidesUT, lidesut, LidesUT"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
        />
      </label>
    </div>
  );
}
